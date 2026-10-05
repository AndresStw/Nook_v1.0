// src/components/discover/SwipeCounter.jsx
import { RefreshCw, Lock } from "lucide-react";

function formatTimeUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "ahora";
  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SwipeCounter({
  swipesLeft,
  maxSwipes = 15,
  resetAt,
  showReset = true,
}) {
  const isEmpty = swipesLeft <= 0;
  const timeLeft = showReset ? formatTimeUntil(resetAt) : null;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
          isEmpty
            ? "bg-error/10 border border-error/30 text-error"
            : "bg-bg-surface border border-border text-text-secondary"
        }`}
      >
        {isEmpty ? <Lock size={11} /> : <RefreshCw size={11} />}
        <span className="tabular-nums">
          {swipesLeft} / {maxSwipes}
        </span>
        {isEmpty ? (
          <span className="opacity-80">
            {timeLeft ? `· reinician en ${timeLeft}` : "· usa Citas a ciegas"}
          </span>
        ) : (
          <span className="opacity-70 hidden sm:inline">
            {timeLeft && `· reinician en ${timeLeft}`}
          </span>
        )}
      </div>
    </div>
  );
}
