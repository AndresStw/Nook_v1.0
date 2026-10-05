import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Heart,
  CheckCircle2,
  Lock,
  Camera,
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import PiBadge from "../components/ui/PiBadge";
import Badges from "../components/discover/Badges";
import ProfileAttributes from "../components/discover/ProfileAttributes";
import { supabase } from "../lib/supabase";
import "../assets/Css/myprofile.css";
import { usePhotoVisibility } from "../hooks/usePhotoVisibility";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { shouldBlur } = usePhotoVisibility(userId);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_public_profile", {
        p_user_id: userId,
      });

      if (!isMounted) return;

      if (error || data?.error) {
        setError(error?.message || data?.error || "Perfil no disponible");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-text-secondary text-[13px]">
            Cargando perfil...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center flex-col gap-3">
          <div className="text-text-primary text-[15px] font-bold">
            Perfil no disponible
          </div>
          <div className="text-text-secondary text-[12px]">
            {error || "Este perfil no existe o fue eliminado."}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-accent text-bg rounded-lg text-[12px] font-medium"
          >
            Volver
          </button>
        </div>
      </AppLayout>
    );
  }

  const photos = profile.photos || [];
  const answers = profile.answers || [];
  const interests = profile.interests || [];
  const isFounder = profile.role === "founder";
  const hearts = profile.hearts ?? 3;

  const mainPhoto = photos[0]?.url;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto pb-8">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          {/* Hero card */}
          <div className="bg-bg-surface border border-border rounded-3xl overflow-hidden shadow-soft mb-4">
            {/* Cover (foto principal con overlay) */}
            {/* Cover (foto principal con overlay) */}
            <div className="relative h-72 bg-bg-alt">
              {mainPhoto ? (
                <>
                  <img
                    src={mainPhoto}
                    alt={shouldBlur ? "Foto oculta" : profile.name}
                    className={`w-full h-full object-cover transition-[filter] duration-500 ${
                      shouldBlur ? "scale-110" : ""
                    }`}
                    style={{
                      objectPosition: photos[0]?.focal_point
                        ? `${photos[0].focal_point.x}% ${photos[0].focal_point.y}%`
                        : "50% 50%",
                      filter: shouldBlur ? "blur(28px)" : "none",
                      WebkitFilter: shouldBlur ? "blur(28px)" : "none",
                    }}
                  />

                  {/* Overlay candado cuando blur */}
                  {shouldBlur && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center gap-3 px-7 py-6 rounded-2xl bg-black/55 backdrop-blur-md border border-white/15 shadow-2xl max-w-70 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                          <Lock size={20} className="text-white" />
                        </div>
                        <div className="text-white text-[13px] font-bold leading-tight">
                          Fotos ocultas
                        </div>
                        <div className="text-white/80 text-[11px] leading-snug">
                          Se revelan cuando ambos se eligen.
                          <br />
                          Mientras tanto, conócelo por lo que dice.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary text-[40px]">
                  {profile.name?.[0] || "?"}
                </div>
              )}
            </div>

            {/* Info secundaria */}
            <div className="p-6 border-b border-border-soft">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badges profile={profile} />
                </div>

                {!isFounder && (
                  <div
                    title="Nook premia el respeto."
                    className="flex items-center gap-1 cursor-help"
                  >
                    {[1, 2, 3].map((i) => (
                      <Heart
                        key={i}
                        size={14}
                        className={
                          i <= hearts
                            ? "text-accent fill-accent"
                            : "text-text-tertiary/30"
                        }
                      />
                    ))}
                    <span className="text-[10.5px] text-text-tertiary ml-1">
                      {hearts}/3
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda: Bio + respuestas */}
              <div className="lg:col-span-2 space-y-5">
                {profile.bio && (
                  <div>
                    <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                      Sobre mí
                    </h2>
                    <p className="text-[13.5px] text-text-primary leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Video — solo con match */}
                {profile.video_url && !shouldBlur && (
                  <div>
                    <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                      Video de presentación
                    </h2>
                    <video
                      src={profile.video_url}
                      controls
                      playsInline
                      className="w-full max-w-md rounded-xl aspect-video bg-black"
                    />
                  </div>
                )}

                {/* Video oculto — mensaje alternativo */}
                {profile.video_url && shouldBlur && (
                  <div>
                    <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                      Video de presentación
                    </h2>
                    <div className="w-full max-w-md aspect-video rounded-xl bg-bg-alt border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <Lock size={22} />
                      <p className="text-[11.5px] font-semibold">
                        Se revela cuando ambos se eligen
                      </p>
                    </div>
                  </div>
                )}

                {/* Respuestas */}
                {answers.length > 0 && (
                  <div>
                    <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-3">
                      Sus respuestas
                    </h2>
                    <div className="space-y-3">
                      {answers.map((a, i) => (
                        <div
                          key={i}
                          className="bg-bg-alt rounded-xl p-4 border border-border-soft"
                        >
                          <div className="text-[11px] text-text-tertiary italic mb-1.5 leading-snug">
                            {a.question}
                          </div>
                          <div className="text-[13px] text-text-primary leading-relaxed">
                            {a.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha: detalles */}
              <div className="space-y-5">
                <ProfileAttributes profile={profile} />

                {interests.length > 0 && (
                  <div>
                    <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                      Intereses
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((i, idx) => (
                        <span
                          key={idx}
                          className="text-[11.5px] px-2.5 py-1 bg-bg-alt border border-border rounded-full text-text-secondary"
                        >
                          {i.emoji} {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galería de fotos */}
          {photos.length > 1 && (
            <div className="bg-bg-surface border border-border rounded-3xl p-6 shadow-soft">
              <h2 className="text-[14px] font-bold text-text-primary mb-4 flex items-center gap-2">
                <Camera size={15} />
                Fotos
                {shouldBlur && (
                  <span className="ml-auto text-[10px] font-medium text-text-tertiary flex items-center gap-1">
                    <Lock size={10} />
                    Se revelan con match
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (shouldBlur) return;
                      setLightboxIndex(i);
                      setLightboxOpen(true);
                    }}
                    disabled={shouldBlur}
                    className={`relative aspect-square rounded-xl overflow-hidden group ${
                      shouldBlur ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${i + 1}`}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        shouldBlur ? "scale-110" : "group-hover:scale-105"
                      }`}
                      style={{
                        objectPosition: photo.focal_point
                          ? `${photo.focal_point.x}% ${photo.focal_point.y}%`
                          : "50% 50%",
                        filter: shouldBlur ? "blur(20px)" : "none",
                        WebkitFilter: shouldBlur ? "blur(20px)" : "none",
                      }}
                    />

                    {shouldBlur && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center border border-white/20">
                          <Lock size={13} className="text-white" />
                        </div>
                      </div>
                    )}

                    {!shouldBlur && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Maximize2
                          size={22}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && photos.length > 0 && !shouldBlur && (
        <div
          className="fixed inset-0 z-300 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X size={20} />
          </button>

          <img
            src={photos[lightboxIndex]?.url}
            alt="Foto"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (prev) => (prev - 1 + photos.length) % photos.length,
                  );
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % photos.length);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/15 text-white text-[12px] font-semibold">
                {lightboxIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}
