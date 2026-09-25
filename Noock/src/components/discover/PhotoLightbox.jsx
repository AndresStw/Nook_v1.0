import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoLightbox({ photos, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);

  // Navegación con teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", handleKey);
    // Bloquear scroll del body
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index]);

  const next = () => {
    if (photos.length <= 1) return;
    setIndex((prev) => (prev + 1) % photos.length);
  };

  const prev = () => {
    if (photos.length <= 1) return;
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[index]?.url || "";

  return (
    <div
      className="photo-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Header con contador y cerrar */}
      <div
        className="photo-lightbox__header"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="photo-lightbox__counter">
          {index + 1} / {photos.length}
        </div>
        <button
          className="photo-lightbox__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Foto principal */}
      <div
        className="photo-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zona izquierda (retroceder) */}
        {photos.length > 1 && (
          <button
            className="photo-lightbox__nav photo-lightbox__nav--prev"
            onClick={prev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <img
          src={currentPhoto}
          alt="Foto"
          className="photo-lightbox__img"
          onClick={(e) => {
            // Click en la mitad derecha avanza, izquierda retrocede
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) prev();
            else next();
          }}
        />

        {/* Zona derecha (avanzar) */}
        {photos.length > 1 && (
          <button
            className="photo-lightbox__nav photo-lightbox__nav--next"
            onClick={next}
            aria-label="Foto siguiente"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Dots de paginación */}
      {photos.length > 1 && (
        <div
          className="photo-lightbox__dots"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              className={`photo-lightbox__dot ${i === index ? "photo-lightbox__dot--active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
