import { useState, useEffect } from "react";
import { Gift, Check, Loader2 } from "lucide-react";
import { useDailyLogin } from "../../hooks/useDailyLogin";
import { soundManager } from "../../lib/sounds";

//Componente
export default function DailyLoginBanner() {
  const { status, loading, claiming, claim } = useDailyLogin();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [claimedSuccess, setClaimedSuccess] = useState(false);

  //Hook #1
  useEffect(() => {
    if (!status || status.can_claim || !status.next_available_at) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(status.next_available_at).getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleClaim = async () => {
    const result = await claim();
    if (result?.success) {
      soundManager.play("success");
      setClaimedSuccess(true);
      setTimeout(() => setClaimedSuccess(false), 3000);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading || dismissed) return null;
  if (!status) return null;
  if (!status.can_claim && !timeLeft && !claimedSuccess) return null;

  return (
    <div className="relative bg-linear-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-4 mb-4 overflow-hidden">
      <div className="absolute -right-4 -top-4 text-6xl opacity-10 select-none">
        🎁
      </div>

      <div className="relative flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          {claimedSuccess ? (
            <Check size={20} className="text-accent-hover" />
          ) : (
            <Gift size={20} className="text-accent-hover" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-text-primary">
            {claimedSuccess
              ? "¡Recompensa reclamada!"
              : status.can_claim
                ? "Recompensa diaria disponible"
                : `Vuelve en ${formatTime(timeLeft)}`}
          </div>
          <div className="text-[11.5px] text-text-secondary">
            {status.can_claim
              ? `Día ${status.current_streak + 1} de racha · +${status.next_pi} PI`
              : `Racha actual: ${status.current_streak} días`}
          </div>
        </div>

        {status.can_claim && !claimedSuccess && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-4 py-2 rounded-xl bg-accent text-bg text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {claiming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              `Reclamar +${status.next_pi}`
            )}
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0 text-text-tertiary"
        >
          ×
        </button>
      </div>
    </div>
  );
}
