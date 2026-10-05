import { useState, useEffect } from "react";
import { X, Clock, Check, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { soundManager } from "../../lib/sounds";

//tiempo  requisito de lectura con el que se reclama los 300PI
const READING_SECONDS = 120;

//Componente
export default function LegalModal({
  open,
  documentKey,
  title,
  children,
  onClose,
}) {
  const [timeLeft, setTimeLeft] = useState(READING_SECONDS);
  const [canClaim, setCanClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [alreadyRead, setAlreadyRead] = useState(false);
  const [checking, setChecking] = useState(true);

  //Hook#1
  useEffect(() => {
    if (!open) {
      setTimeLeft(READING_SECONDS);
      setCanClaim(false);
      setClaimed(false);
      setAlreadyRead(false);
      return;
    }

    const check = async () => {
      const { data, error } = await supabase
        .from("user_legal_reads")
        .select("document_key")
        .eq("document_key", documentKey)
        .maybeSingle();
      if (!error && data) setAlreadyRead(true);
      setChecking(false);
    };
    check();
  }, [open, documentKey]);

  //Hook#2
  useEffect(() => {
    if (!open || alreadyRead || claimed || checking) return;
    if (timeLeft <= 0) {
      setCanClaim(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, alreadyRead, claimed, timeLeft, checking]);

  const handleClaim = async () => {
    if (!canClaim || claimed || alreadyRead) return;
    const { data, error } = await supabase.rpc("claim_legal_read", {
      p_document_key: documentKey,
    });
    if (!error && data?.success) {
      soundManager.play("pi_reward");
      setClaimed(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  if (!open) return null;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-350 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">{title}</h2>
            {checking ? (
              <div className="text-[11px] text-text-tertiary mt-0.5">
                Cargando...
              </div>
            ) : alreadyRead ? (
              <div className="text-[11px] text-text-tertiary mt-0.5">
                Ya reclamaste esta recompensa
              </div>
            ) : claimed ? (
              <div className="text-[11px] text-accent-hover font-medium mt-0.5">
                ¡Recompensa reclamada! +300 PI
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary mt-0.5">
                <Clock size={11} />
                {canClaim
                  ? "Lectura completada. Reclama tu recompensa."
                  : `Lee por ${formatTime(timeLeft)} más para obtener 300 PI`}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>

        {!alreadyRead && !claimed && !checking && (
          <div className="p-4 border-t border-border-soft shrink-0">
            <button
              onClick={handleClaim}
              disabled={!canClaim}
              className="w-full py-3 rounded-xl bg-accent text-bg text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {canClaim ? (
                <>
                  <Sparkles size={14} />
                  Reclamar +300 PI
                </>
              ) : (
                <>
                  <Clock size={14} />
                  Sigue leyendo... {formatTime(timeLeft)}
                </>
              )}
            </button>
          </div>
        )}

        {alreadyRead && (
          <div className="p-4 border-t border-border-soft shrink-0">
            <div className="w-full py-3 rounded-xl bg-bg-alt text-text-tertiary text-[13px] font-semibold text-center">
              Ya leído
            </div>
          </div>
        )}

        {claimed && (
          <div className="p-4 border-t border-border-soft shrink-0">
            <div className="w-full py-3 rounded-xl bg-accent/15 text-accent-hover text-[13px] font-bold text-center flex items-center justify-center gap-2">
              <Check size={14} />
              ¡Recompensa obtenida!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
