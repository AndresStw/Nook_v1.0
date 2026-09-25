import { useState } from "react";

export default function ProfilePanicButton({ onReport }) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleReport = async (reason) => {
    if (processing) return;
    setProcessing(true);
    await onReport(reason);
    setProcessing(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Botón de pánico"
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
      >
        <svg viewBox="0 0 40 40" width="20" height="20">
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

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
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
                Reportar a alguien es anónimo. Nunca sabrá que fuiste tú.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleReport("bored")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">😐</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                    No me interesa
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    Simplemente no es para mí. Que no me vuelva a aparecer.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport("rude")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">😠</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                    Me incomoda
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    Comentarios feos, actitud grosera o algo que no me gustó.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport("fake_profile")}
                disabled={processing}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-start gap-3"
              >
                <div className="text-xl shrink-0 mt-0.5">👤</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                    Perfil falso o sospechoso
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    Fotos robadas, datos inventados o parece un bot.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport("emergency")}
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
                </div>
              </button>

              <button
                onClick={() => setOpen(false)}
                disabled={processing}
                className="w-full py-2.5 mt-1 text-[12px] text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
