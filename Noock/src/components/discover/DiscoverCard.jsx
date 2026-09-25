import { useState, useEffect } from "react";
import {
  X,
  Heart,
  Star,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import PiBadge from "../ui/PiBadge";
import ProfilePanicButton from "./ProfilePanicButton";
import PhotoLightbox from "./PhotoLightbox";

export default function DiscoverCard({
  profile,
  onLike,
  onPass,
  onSave,
  onReport,
  isFavorited = false,
  disabled,
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
    setLightboxOpen(false);
  }, [profile?.id]);

  if (!profile) return null;

  const photos = profile.photos || [];
  const currentPhoto = photos[photoIndex]?.url || "";
  const interestNames = (profile.interests || []).map((i) => i.name);

  const nextPhoto = (e) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) prevPhoto(e);
    else nextPhoto(e);
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    if (photos.length === 0) return;
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden h-full w-full shadow-card">
        {/* Foto principal */}
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={profile.name}
            onClick={handleImageClick}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer select-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-alt to-border flex items-center justify-center">
            <span className="text-text-tertiary text-[12px]">Sin foto</span>
          </div>
        )}

        {/* Zonas clickables invisibles */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              aria-label="Foto anterior"
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
            >
              <ChevronLeft size={28} className="text-white/80 drop-shadow-lg" />
            </button>
            <button
              onClick={nextPhoto}
              aria-label="Foto siguiente"
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
            >
              <ChevronRight
                size={28}
                className="text-white/80 drop-shadow-lg"
              />
            </button>
          </>
        )}

        {/* Barra de progreso */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
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

        {/* Contador */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
            {photoIndex + 1} / {photos.length}
          </div>
        )}

        {/* Badge de PI + Botón expandir */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <PiBadge pi={profile.pi || 0} size="xs" variant="overlay" />
          {photos.length > 0 && (
            <button
              onClick={handleExpand}
              className="discover-expand-btn"
              title="Ver fotos en tamaño completo"
              aria-label="Expandir foto"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>

        {/* Botón de pánico */}
        <ProfilePanicButton onReport={onReport} />

        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />

        {/* Info del perfil */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h2 className="text-xl font-bold leading-tight drop-shadow-lg">
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

          <div className="flex items-center gap-1 text-[11px] text-white/90 mb-2">
            <MapPin size={12} />
            <span>{profile.city || "Sin ciudad"}</span>
          </div>

          {profile.bio && (
            <p className="text-[12.5px] text-white/95 leading-snug mb-2.5 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {interestNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {interestNames.slice(0, 5).map((interest) => (
                <span
                  key={interest}
                  className="text-[10px] px-2 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={onPass}
              disabled={disabled}
              className="w-10 h-10 rounded-full bg-white hover:bg-accent text-text-primary hover:text-bg flex items-center justify-center transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Pasar"
            >
              <X size={17} strokeWidth={2.2} />
            </button>

            <button
              onClick={onLike}
              disabled={disabled}
              className="w-12 h-12 rounded-full bg-accent hover:opacity-90 text-bg flex items-center justify-center transition-all hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Conectar"
            >
              <Heart size={20} strokeWidth={2.2} className="fill-bg" />
            </button>

            <button
              onClick={onSave}
              disabled={disabled}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isFavorited
                  ? "bg-accent text-bg"
                  : "bg-white hover:bg-accent text-text-primary hover:text-bg"
              }`}
              aria-label={isFavorited ? "Quitar de favoritos" : "Guardar"}
            >
              <Star
                size={17}
                strokeWidth={2.2}
                className={isFavorited ? "fill-bg" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          initialIndex={photoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
