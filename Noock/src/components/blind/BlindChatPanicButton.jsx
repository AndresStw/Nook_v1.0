import { useState } from "react";
import { AlertCircle, X, Shield, Flag } from "lucide-react";

export default function BlindChatPanicButton({ onAbandon }) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleAbandon = async (reason) => {
    if (processing) return;
    setProcessing(true);
    await onAbandon(reason);
    setProcessing(false);
    setOpen(false);
  };

  return (
    <>
      {/* Botón octágono rojo */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Botón de pánico"
        className="w-8 h-8 rounded-full hover:bg-error/10 flex items-center justify-center transition-colors shrink-0"
      >
        <svg viewBox="0 0 40 40" width="22" height="22">
          <polygon
            points="12,2 28,2 38,12 38,28 28,38 12,38 2,28 2,12"
            fill="#DC2626"
            stroke="white"
            strokeWidth="3"
          />
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
          >
            !
          </text>
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-bg-surface rounded-3xl p-6 max-w-md w-full shadow-elevated animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🛑</div>
              <h2 className="text-lg font-bold text-text-primary mb-1">
                ¿Qué está pasando?
              </h2>
              <p className="text-[12px] text-text-secondary">
                Salir de la cita a ciegas tiene consecuencias. Elige con
                honestidad.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Opción 1: Me aburrí */}
              <button
                onClick={() => handleAbandon("left_bored")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">😴</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                    Ya no quiero seguir
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    No me gustó la charla. Salgo de la cita.
                  </div>
                  <div className="text-[10px] text-error font-medium mt-1">
                    −15 PI por salir antes de tiempo
                  </div>
                </div>
              </button>

              {/* Opción 2: Grosero */}
              <button
                onClick={() => handleAbandon("left_rude")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">😠</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                    Está siendo grosero/a
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    Insultos, comentarios feos o incomodidad.
                  </div>
                  <div className="text-[10px] text-accent-hover font-medium mt-1">
                    Sin costo · Se enviará un reporte
                  </div>
                </div>
              </button>

              {/* Opción 3: Emergencia */}
              <button
                onClick={() => handleAbandon("left_emergency")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border-2 border-error/40 hover:bg-error/5 transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">🚨</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-error mb-0.5">
                    Me siento en peligro
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    Amenazas, contenido ilegal o algo grave.
                  </div>
                  <div className="text-[10px] text-error font-medium mt-1">
                    Bloqueo inmediato · Reporte urgente
                  </div>
                </div>
              </button>

              {/* Cancelar */}
              <button
                onClick={() => setOpen(false)}
                disabled={processing}
                className="w-full py-2.5 mt-1 text-[12px] text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>

            <p className="text-[10px] text-text-tertiary text-center mt-3 leading-relaxed">
              Los reportes son anónimos. Nunca sabrán que fuiste tú.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
