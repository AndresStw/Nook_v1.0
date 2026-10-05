// src/components/discover/DiscoverCard.jsx

//ajustar el tema de las preguntas para web no tiene sentido colocarlas en la foto ya que aparece al lado derecho en web hay reduncancia
import { useState, useEffect } from "react";
//prettier-ignore
import { X, Star, MapPin, CheckCircle2, Lock, Sparkles, Quote, MessageCircle } from "lucide-react";
import { GENDER_INTERNAL } from "../../lib/profileLabels";
import PiBadge from "../ui/PiBadge";
import ProfilePanicButton from "./ProfilePanicButton";
import { usePhotoVisibility } from "../../hooks/usePhotoVisibility";

// Componente
export default function DiscoverCard({
  profile,
  onStartBlindChat,
  onPass,
  onSave,
  onReport,
  onShowDetails,
  isFavorited = false,
  disabled,
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const { shouldBlur } = usePhotoVisibility(profile?.id);

  //Hook #1: Reiniciar estado al cambiar de perfil
  useEffect(() => {
    setPhotoIndex(0);
  }, [profile?.id]);

  if (!profile) return null;

  const photos = profile.photos || [];
  const currentPhoto = photos[photoIndex]?.url || "";
  const genderKey = profile.gender_internal || profile.gender;
  //prettier-ignore
  const genderLabel = GENDER_INTERNAL[genderKey] || (genderKey && genderKey !== "prefiero_no_decir" ? genderKey : null);

  // Ordenar respuestas: featured primero
  const rawAnswers = profile.answers || [];
  const sortedAnswers = [...rawAnswers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  const featured = sortedAnswers[0] || null;
  const secondary = sortedAnswers.slice(1, 3); // máximo 2 más

  // Navegación de fotos (solo si NO hay blur)
  const nextPhoto = (e) => {
    e?.stopPropagation();
    if (shouldBlur || photos.length <= 1) return;
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    if (shouldBlur || photos.length <= 1) return;
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  //Hook #2: Gestos táctiles
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const minSwipeDistance = 50;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleGesture();
    };

    const handleGesture = () => {
      const distanceX = touchEndX - touchStartX;
      const distanceY = touchEndY - touchStartY;

      if (Math.abs(distanceY) > Math.abs(distanceX)) {
        if (distanceY < -minSwipeDistance && onShowDetails) {
          onShowDetails();
        }
        return;
      }

      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          if (!disabled && onStartBlindChat) onStartBlindChat();
        } else {
          if (!disabled && onPass) onPass();
        }
      }
    };

    const cardElement = document.getElementById(`discover-card-${profile.id}`);
    if (!cardElement) return;

    cardElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    cardElement.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      cardElement.removeEventListener("touchstart", handleTouchStart);
      cardElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [profile?.id, disabled, onStartBlindChat, onPass, onShowDetails]);

  return (
    <div
      id={`discover-card-${profile.id}`}
      className="relative rounded-2xl overflow-hidden h-full w-full shadow-card select-none bg-bg-alt"
    >
      {/* Foto (con blur condicional) */}
      {currentPhoto ? (
        <img
          src={currentPhoto}
          alt={shouldBlur ? "Foto oculta" : profile.name}
          onClick={!shouldBlur ? nextPhoto : undefined}
          className={`absolute inset-0 w-full h-full object-cover select-none transition-[filter] duration-500 ease-out ${
            shouldBlur ? "scale-110" : "cursor-pointer"
          }`}
          style={{
            objectPosition: photos[photoIndex]?.focal_point
              ? `${photos[photoIndex].focal_point.x}% ${photos[photoIndex].focal_point.y}%`
              : "50% 50%",
            filter: shouldBlur ? "blur(24px)" : "none",
            WebkitFilter: shouldBlur ? "blur(24px)" : "none",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-bg-alt to-border flex items-center justify-center">
          <span className="text-text-tertiary text-[12px]">Sin foto</span>
        </div>
      )}

      {/* Barra de progreso (solo si NO hay blur) */}
      {!shouldBlur && photos.length > 1 && (
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1 pointer-events-none">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-0.5 rounded-full transition-all ${
                i === photoIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Contador (solo si NO hay blur) */}
      {!shouldBlur && photos.length > 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium pointer-events-none">
          {photoIndex + 1} / {photos.length}
        </div>
      )}

      {/* Badge de PI */}
      <div className="absolute top-3 right-3 z-20">
        <PiBadge pi={profile.pi || 0} size="xs" variant="overlay" />
      </div>

      {/* Botón de pánico (izquierda) */}
      <div className="absolute top-3 left-3 z-20">
        <ProfilePanicButton onReport={onReport} />
      </div>

      {/* Candado (blur activo) — pequeño, arriba */}
      {shouldBlur && currentPhoto && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15">
            <Lock size={10} className="text-white" />
            <span className="text-white text-[10px] font-semibold">
              Foto oculta
            </span>
          </div>
        </div>
      )}

      {/* 🎯 Respuesta destacada — overlay central */}
      {featured && (
        <div className="absolute inset-x-4 top-24 md:top-28 z-20 pointer-events-none">
          <div className="relative rounded-2xl p-4 md:p-5 bg-black/45 backdrop-blur-md border border-white/15 shadow-2xl max-w-md mx-auto">
            <Quote size={16} className="text-white/40 absolute top-3 left-3" />
            <div className="pl-6">
              <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1.5 font-semibold">
                {featured.question}
              </div>
              <div className="text-[15px] md:text-[16px] text-white font-medium leading-snug italic">
                "{featured.answer}"
              </div>
            </div>
          </div>

          {/* 2 mini pills debajo */}
          {secondary.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2.5 max-w-md mx-auto">
              {secondary.map((s, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-black/35 backdrop-blur-sm border border-white/10 flex items-start gap-2"
                >
                  <span className="text-white/50 text-[10px] shrink-0 mt-0.5">
                    ❝
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-white/60 uppercase tracking-wider mb-0.5 truncate">
                      {s.question}
                    </div>
                    <div className="text-[11.5px] text-white/95 leading-snug line-clamp-2">
                      {s.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gradiente inferior */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none" />

      {/* Info del perfil (parte inferior) */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white z-20">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h2 className="text-lg md:text-xl font-bold leading-tight drop-shadow-lg">
            {profile.name}
            {profile.age ? `, ${profile.age}` : ""}
          </h2>
          {profile.verified && (
            <CheckCircle2
              size={17}
              className="text-accent fill-accent/20 shrink-0"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-white/90 mb-2 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{profile.city || "Sin ciudad"}</span>
          </div>
          {genderLabel && (
            <>
              <span className="text-white/60">·</span>
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-medium text-white">
                {genderLabel}
              </span>
            </>
          )}
        </div>

        {profile.bio && (
          <p className="text-[12px] md:text-[12.5px] text-white/95 leading-snug mb-2 md:mb-2.5 line-clamp-1 md:line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Gesto ver respuestas */}
        {onShowDetails && (
          <div
            onClick={onShowDetails}
            className="flex items-center justify-center gap-1 text-[11px] text-white/70 mb-2 cursor-pointer py-1 animate-pulse"
          >
            <Sparkles size={11} />
            <span className="md:hidden">Desliza hacia arriba</span>
            <span className="hidden md:inline">Ver todo lo que dice</span>
          </div>
        )}

        {/* Botones de acción — Hablar primero es el héroe */}
        <div className="flex items-center gap-2">
          {/* No me interesa */}
          <button
            onClick={onPass}
            disabled={disabled}
            className="w-11 h-11 shrink-0 rounded-full bg-white/95 hover:bg-white text-text-primary flex items-center justify-center transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="No me interesa"
            title="No me interesa"
          >
            <X size={18} strokeWidth={2.4} />
          </button>

          {/* CTA principal — HABLAR PRIMERO */}
          <button
            onClick={onStartBlindChat}
            disabled={disabled}
            className="flex-1 min-w-0 h-12 rounded-full bg-accent hover:opacity-95 text-bg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-[13.5px] tracking-tight"
            aria-label="Hablar primero"
          >
            <MessageCircle size={17} strokeWidth={2.4} className="shrink-0" />
            <span className="truncate">Hablar primero</span>
          </button>

          {/* Guardar */}
          <button
            onClick={onSave}
            disabled={disabled}
            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isFavorited
                ? "bg-accent text-bg"
                : "bg-white/95 hover:bg-white text-text-primary"
            }`}
            aria-label={isFavorited ? "Quitar de favoritos" : "Guardar"}
            title={isFavorited ? "Quitar de favoritos" : "Guardar"}
          >
            <Star
              size={17}
              strokeWidth={2.4}
              className={isFavorited ? "fill-bg" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
