import { useState, useEffect, useRef } from "react";
import { X, Camera, Loader2, AlertCircle, Lock, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { checkCanPost } from "../../hooks/useEventPosts";
import { FALLBACK_SEASON } from "../../lib/halloween";
import { soundManager } from "../../lib/sounds";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EventUploadModal({ open, onClose, onSuccess, season }) {
  const { user } = useAuth();
  const activeSeason = season || FALLBACK_SEASON;
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [postResult, setPostResult] = useState(null);
  const [canPost, setCanPost] = useState(null);
  const [checking, setChecking] = useState(true);
  const fileRef = useRef(null);

  // Toda la lógica de "hoy es día de publicar" ahora la da el RPC
  // El hook useActiveSeason solo se usa para el nombre/emoji del evento

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setCaption("");
      setError(null);
      setPostResult(null);
    } else {
      setChecking(true);
      checkCanPost(
        activeSeason.slug?.startsWith("halloween") ? "halloween" : "halloween",
      ).then((res) => {
        setCanPost(res);
        setChecking(false);
      });
    }
  }, [open]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);

    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no puede pesar más de ${MAX_SIZE_MB}MB`);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WEBP.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const fileName = `${user.id}/post-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(fileName);

      const { data, error: rpcError } = await supabase.rpc(
        "create_event_post",
        {
          p_image_url: urlData.publicUrl,
          p_caption: caption.trim() || null,
          p_event_type: "halloween",
        },
      );

      if (rpcError) throw rpcError;
      if (data?.error) throw new Error(data.error);

      soundManager.play("success");
      setPostResult({
        status: data.status,
        pi_earned: data.pi_earned,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("🚨 NOOK-502: Error subiendo post de evento", err);
      setError(err.message || "Algo salió mal. Intenta de nuevo.");
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-300 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft shrink-0">
          <div>
            <div className="text-[15px] font-bold text-text-primary flex items-center gap-2">
              {activeSeason.emoji} Subir al evento
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              {activeSeason.tagline}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {checking ? (
            <div className="text-center py-8">
              <Loader2 size={20} className="animate-spin text-accent mx-auto" />
            </div>
          ) : !canPost?.can_post ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🔒</div>
              <h3 className="text-[15px] font-bold text-text-primary mb-2">
                Hoy no se puede publicar
              </h3>
              <p className="text-[12.5px] text-text-secondary leading-relaxed max-w-xs mx-auto">
                {canPost?.reason === "not_friday"
                  ? "Solo puedes subir fotos los viernes."
                  : canPost?.reason === "max_reached"
                    ? `Ya alcanzaste el máximo de ${canPost.max} publicaciones este viernes.`
                    : "No pudimos verificar tu estado. Intenta de nuevo más tarde."}
              </p>
            </div>
          ) : (
            <>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden bg-bg-alt">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-error transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center gap-3 text-text-tertiary hover:text-accent"
                >
                  <Camera size={32} />
                  <div className="text-[13px] font-semibold">Sube tu foto</div>
                  <div className="text-[10.5px] text-center max-w-50 leading-snug">
                    JPG, PNG o WEBP · Máx 5MB
                  </div>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
              />

              <div>
                <label className="text-[11.5px] font-semibold text-text-primary mb-1.5 block">
                  Cuéntanos algo (opcional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 150))}
                  rows={3}
                  placeholder="Ej: Mi disfraz de gato negro 🐈‍⬛"
                  className="w-full px-3.5 py-2.5 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
                />
                <div className="text-[10px] text-text-tertiary text-right mt-1">
                  {caption.length} / 150
                </div>
              </div>

              {postResult?.status === "pending_review" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Lock size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[12px] text-amber-800 leading-snug">
                    <strong>Tu post está en revisión.</strong> Lo vamos a
                    revisar pronto y te avisamos cuando esté visible.
                  </div>
                </div>
              )}
              {postResult?.status === "published" && (
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2">
                  <Sparkles size={14} className="text-accent-hover shrink-0" />
                  <div className="text-[12px] text-accent-hover leading-snug">
                    <strong>¡Publicado! +{postResult.pi_earned} PI</strong> Ya
                    está visible para todos 🎉
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-[12px] text-error flex items-start gap-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {canPost?.can_post && (
          <div className="p-3 border-t border-border-soft shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!file || uploading || postResult}
              className="w-full py-3 rounded-xl bg-accent text-bg text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>Publicar {activeSeason.emoji}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
