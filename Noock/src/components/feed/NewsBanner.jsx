// src/components/feed/NewsBanner.jsx
import { useEffect, useState } from "react";
import { Megaphone, X, Sparkles } from "lucide-react";
import { useFounderLetter } from "../../hooks/useFounderLetter";

const SHOW_DELAY_MS = 6000; // 6s después del login

export default function NewsBanner() {
  const { letter, loading, shouldShow, dismiss } = useFounderLetter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || !shouldShow || !letter) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loading, shouldShow, letter]);

  if (!visible || !letter) return null;

  const handleDismiss = async () => {
    setVisible(false);
    await dismiss();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-200 w-[calc(100%-24px)] max-w-md animate-in">
      <div className="relative bg-bg-surface border border-accent/40 rounded-2xl shadow-2xl p-4 overflow-hidden">
        {/* Acento lateral */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-accent to-accent/30" />

        {/* Emoji decorativo */}
        <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none pointer-events-none">
          📰
        </div>

        <div className="relative flex items-start gap-3 pl-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Megaphone size={18} className="text-accent-hover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-accent-hover">
                Carta del fundador
              </span>
              <Sparkles size={9} className="text-accent-hover" />
            </div>

            <div className="text-[12.5px] font-bold text-text-primary mb-1 leading-snug">
              {letter.title}
            </div>

            <p className="text-[11.5px] text-text-secondary leading-relaxed line-clamp-3">
              {letter.content}
            </p>

            <div className="text-[10px] text-text-tertiary mt-1.5">
              {new Date(letter.published_at).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0 text-text-tertiary"
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
