import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Configuración
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BASE_PHOTOS = 3;
const PI_THRESHOLD_PHOTOS = 3000;

const MAX_VIDEO_SIZE_MB = 25;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/x-matroska", "video/webm"];
const MAX_VIDEO_DURATION = 15;
const PI_THRESHOLD_VIDEO = 5000;

export function usePhotos(userId) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [limits, setLimits] = useState(null);

  // Cargar límites del usuario
  useEffect(() => {
    if (!userId) return;
    supabase.rpc("get_photo_limits").then(({ data }) => {
      if (data && !data.error) setLimits(data);
    });
  }, [userId]);

  const refreshLimits = async () => {
    const { data } = await supabase.rpc("get_photo_limits");
    if (data && !data.error) setLimits(data);
  };

  // ============================================
  // FOTOS
  // ============================================
  const uploadPhoto = async (file, position) => {
    if (!userId) throw new Error("No user id");

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`La imagen no puede pesar más de ${MAX_SIZE_MB}MB`);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Formato no permitido. Usa JPG, PNG o WEBP.");
    }
    if (
      position > MAX_BASE_PHOTOS &&
      limits &&
      limits.pi < PI_THRESHOLD_PHOTOS
    ) {
      const needed = PI_THRESHOLD_PHOTOS - limits.pi;
      throw new Error(
        `Necesitas ${needed.toLocaleString("es-CO")} PI más para desbloquear fotos extra`,
      );
    }

    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileName = `${userId}/photo-${position}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user-photos")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from("photos").upsert(
        {
          user_id: userId,
          url: publicUrl,
          position,
        },
        { onConflict: "user_id,position" },
      );

      if (dbError) throw dbError;

      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.error("🚨 NOOK-502: Error subiendo foto", err);
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  const deletePhoto = async (position, url) => {
    if (!userId) throw new Error("No user id");

    const fileName = url.split("/user-photos/")[1];
    if (!fileName) throw new Error("URL inválida");

    const { error: storageError } = await supabase.storage
      .from("user-photos")
      .remove([fileName]);

    if (storageError) console.warn("Error storage:", storageError);

    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .eq("user_id", userId)
      .eq("position", position);

    if (dbError) throw dbError;
  };

  // ============================================
  // VIDEO (solo PI >= 5000)
  // ============================================
  const uploadVideo = async (file) => {
    if (!userId) throw new Error("No user id");

    // Validar PI
    if (!limits || limits.pi < PI_THRESHOLD_VIDEO) {
      const needed = PI_THRESHOLD_VIDEO - (limits?.pi || 0);
      throw new Error(
        `Necesitas ${needed.toLocaleString("es-CO")} PI más para desbloquear el video`,
      );
    }

    // Validar tamaño
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      throw new Error(`El video no puede pesar más de ${MAX_VIDEO_SIZE_MB}MB`);
    }

    // Validar formato
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error("Formato no permitido. Usa MP4, MKV o WEBM.");
    }

    // Validar duración leyendo metadata
    const duration = await getVideoDuration(file);
    if (duration > MAX_VIDEO_DURATION + 0.5) {
      throw new Error(
        `El video no puede durar más de ${MAX_VIDEO_DURATION} segundos (tuyo: ${Math.round(duration)}s)`,
      );
    }

    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileName = `${userId}/video-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user-videos")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("users")
        .update({
          video_url: publicUrl,
          video_duration_seconds: Math.round(duration),
          video_uploaded_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (dbError) throw dbError;

      await refreshLimits();
      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.error("🚨 NOOK-502: Error subiendo video", err);
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  const deleteVideo = async (url) => {
    if (!userId || !url) throw new Error("Datos inválidos");

    const fileName = url.split("/user-videos/")[1];
    if (fileName) {
      await supabase.storage.from("user-videos").remove([fileName]);
    }

    const { error: dbError } = await supabase
      .from("users")
      .update({
        video_url: null,
        video_duration_seconds: null,
        video_uploaded_at: null,
      })
      .eq("id", userId);

    if (dbError) throw dbError;

    await refreshLimits();
  };

  //  Actualizar el punto focal de una foto
  const updatePhotoFocal = async (position, focalPoint) => {
    if (!userId) throw new Error("No user id");

    const { error } = await supabase
      .from("photos")
      .update({ focal_point: focalPoint })
      .eq("user_id", userId)
      .eq("position", position);

    if (error) throw error;
    return true;
  };

  return {
    uploadPhoto,
    deletePhoto,
    updatePhotoFocal,
    uploadVideo,
    deleteVideo,
    uploading,
    error,
    limits,
    refreshLimits,
  };
}

// ============================================
// Helper: leer duración del video
// ============================================
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error("No se pudo leer el video"));
    };
    video.src = URL.createObjectURL(file);
  });
}
