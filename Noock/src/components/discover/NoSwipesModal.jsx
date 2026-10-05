// src/components/discover/NoSwipesModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function NoSwipesModal({ open, profile, resetAt, onClose }) {
  const navigate = useNavigate();
  const [startingBlind, setStartingBlind] = useState(false);

  if (!open) return null;

  const handleStartBlindChat = async () => {
    if (!profile?.id || startingBlind) return;
    setStartingBlind(true);

    const { data, error } = await supabase.rpc("start_blind_chat", {
      target_user_id: profile.id,
    });

    setStartingBlind(false);

    // Fallback robusto — cualquier resultado nos lleva a /messages o /blind
    if (error || data?.error) {
      console.warn("⚠️ Blind chat no iniciado:", error?.message || data?.error);
      onClose?.();
      navigate("/messages");
      return;
    }

    onClose?.();
    const chatId = data?.chat_id || data?.id;
    if (chatId) {
      navigate(`/blind/${chatId}`);
    } else {
      navigate("/messages");
    }
  };

  const handleGoMessages = () => {
    onClose?.();
    navigate("/messages");
  };

  return (
    <div
      className="fixed inset-0 z-200 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <Sparkles size={20} className="text-accent-hover" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-text-primary leading-tight">
                Se acabaron tus swipes
              </h2>
              <p className="text-[11.5px] text-text-tertiary mt-0.5">
                Vuelven mañana a las 00:00
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={15} className="text-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 rounded-2xl bg-accent/8 border border-accent/25 mb-5">
          <p className="text-[12.5px] text-text-primary leading-relaxed">
            💬 <strong>Las Citas a Ciegas no tienen límite.</strong>
            <br />
            <span className="text-text-secondary text-[11.5px]">
              Descubre a alguien por lo que dice, no por cómo se ve.
            </span>
          </p>
        </div>

        {/* CTA principal — Blind chat con ESTA persona */}
        {profile?.name && (
          <button
            onClick={handleStartBlindChat}
            disabled={startingBlind}
            className="w-full py-3.5 rounded-xl bg-accent text-bg font-bold text-[13.5px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mb-2"
          >
            {startingBlind ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Iniciando cita a ciegas...
              </>
            ) : (
              <>
                <MessageCircle size={15} />
                Hablar con {profile.name.split(" ")[0]} a ciegas
              </>
            )}
          </button>
        )}

        {/* CTAs secundarios */}
        <button
          onClick={handleGoMessages}
          disabled={startingBlind}
          className="w-full py-2.5 rounded-xl bg-bg-alt text-text-primary font-semibold text-[12.5px] hover:bg-border transition-colors disabled:opacity-50 mb-2"
        >
          Ver mis citas a ciegas
        </button>

        <button
          onClick={onClose}
          disabled={startingBlind}
          className="w-full py-2 text-[12px] text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Vuelvo mañana
        </button>
      </div>
    </div>
  );
}
