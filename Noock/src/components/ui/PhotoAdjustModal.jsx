import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check, Move, Loader2 } from "lucide-react";

/**
 * Modal para ajustar el punto focal de una foto.
 * El usuario arrastra la imagen dentro del marco para elegir qué parte se ve.
 *
 * @param {string} photoUrl - URL de la foto a ajustar
 * @param {{x: number, y: number}} initialFocal - Punto focal inicial (0-100)
 * @param {function} onSave - Callback con el nuevo {x, y}
 * @param {function} onClose - Callback al cerrar sin guardar
 * @param {string} aspectRatio - "square" | "portrait" | "wide" (default: "square")
 */
export default function PhotoAdjustModal({
  photoUrl,
  initialFocal = { x: 50, y: 50 },
  onSave,
  onClose,
  aspectRatio = "square",
}) {
  const [focal, setFocal] = useState(initialFocal);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStartRef = useRef(null);
  const containerRef = useRef(null);

  const aspectClass =
    {
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      wide: "aspect-[4/3]",
    }[aspectRatio] || "aspect-square";

  // Manejar drag
  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        focalX: focal.x,
        focalY: focal.y,
      };
    },
    [focal],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      if (!dragStartRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Sensibilidad: qué tan rápido se mueve el foco respecto al drag
      // 1% de cambio por cada 1% de ancho/alto del marco
      const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

      // Arrastrar hacia la derecha → mover foco hacia la izquierda (efecto natural)
      const newX = Math.max(0, Math.min(100, dragStartRef.current.focalX - dx));
      const newY = Math.max(0, Math.min(100, dragStartRef.current.focalY - dy));

      setFocal({ x: Math.round(newX), y: Math.round(newY) });
    };

    const handleUp = () => {
      setDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging]);

  const handleReset = () => setFocal({ x: 50, y: 50 });

  const handleSave = async () => {
    setSaving(true);
    await onSave(focal);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[95vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-soft">
          <div>
            <div className="text-[14px] font-bold text-text-primary flex items-center gap-2">
              <Move size={14} className="text-accent-hover" />
              Ajustar foto
            </div>
            <div className="text-[11px] text-text-tertiary">
              Arrastra para elegir qué parte se verá
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-text-tertiary" />
          </button>
        </div>

        {/* Preview con marco */}
        <div className="p-4">
          <div className="flex items-center justify-center bg-bg-alt rounded-2xl p-3">
            <div
              ref={containerRef}
              className={`relative ${aspectClass} w-full max-w-[280px] rounded-xl overflow-hidden cursor-move select-none`}
              onPointerDown={handlePointerDown}
              style={{ touchAction: "none" }}
            >
              <img
                src={photoUrl}
                alt="Ajuste"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                  objectPosition: `${focal.x}% ${focal.y}%`,
                }}
              />

              {/* Grid de referencia (tercios) */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
              </div>

              {/* Indicador de drag */}
              {dragging && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  Arrastrando...
                </div>
              )}
            </div>
          </div>

          {/* Coordenadas */}
          <div className="flex items-center justify-between mt-3 text-[11px] text-text-tertiary">
            <span>
              X: {focal.x}% · Y: {focal.y}%
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-accent-hover font-medium hover:underline"
            >
              Centrar
            </button>
          </div>

          <p className="text-[10.5px] text-text-tertiary text-center mt-2 leading-snug">
            Arrastra la imagen para elegir qué parte aparecerá en tu perfil
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-soft flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-bg-alt text-text-primary text-[12.5px] font-semibold hover:bg-border transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-[12.5px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={13} />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
