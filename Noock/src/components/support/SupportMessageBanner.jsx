import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Heart,
  Check,
  X,
  Bell,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SupportMessageBanner() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  const loadMessage = async () => {
    const { data } = await supabase.rpc("get_my_support_messages");
    if (!data || data.length === 0) return;

    // Mostrar solo el más reciente NO leído
    const unread = data.find((m) => !m.read_at);
    if (unread) {
      setMessage(unread);
      setVisible(true);
    }
  };

  useEffect(() => {
    loadMessage();

    // Refrescar cada 30 segundos por si llega nuevo
    const interval = setInterval(loadMessage, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = async () => {
    if (message) {
      await supabase.rpc("mark_support_message_read", {
        p_message_id: message.id,
      });
    }
    setVisible(false);
    setMessage(null);

    // Buscar el siguiente no leído
    setTimeout(loadMessage, 500);
  };

  if (!visible || !message) return null;

  const config = {
    report_warning: {
      icon: AlertTriangle,
      color: "#DC2626",
      bg: "rgba(220, 38, 38, 0.08)",
      border: "rgba(220, 38, 38, 0.3)",
      emoji: "⚠️",
    },
    verification: {
      icon: Check,
      color: "#14E5C0",
      bg: "rgba(20, 229, 192, 0.08)",
      border: "rgba(20, 229, 192, 0.3)",
      emoji: "✅",
    },
    info: {
      icon: Bell,
      color: "#60A5FA",
      bg: "rgba(96, 165, 250, 0.08)",
      border: "rgba(96, 165, 250, 0.3)",
      emoji: "ℹ️",
    },
    congrats: {
      icon: Heart,
      color: "#E879B9",
      bg: "rgba(232, 121, 185, 0.08)",
      border: "rgba(232, 121, 185, 0.3)",
      emoji: "🎉",
    },
    system: {
      icon: MessageCircle,
      color: "#A855F7",
      bg: "rgba(168, 85, 247, 0.08)",
      border: "rgba(168, 85, 247, 0.3)",
      emoji: "🔔",
    },
    founder_reply: {
      icon: MessageCircle,
      color: "#14E5C0",
      bg: "rgba(20, 229, 192, 0.08)",
      border: "rgba(20, 229, 192, 0.3)",
      emoji: "💬",
    },
  };

  const c = config[message.type] || config.info;
  const Icon = c.icon;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] max-w-lg w-[calc(100%-32px)] rounded-2xl shadow-2xl animate-in"
      style={{
        background: "var(--color-bg-surface)",
        border: `1.5px solid ${c.border}`,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: c.bg, color: c.color }}
          >
            <Icon size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3
                className="text-[13.5px] font-bold leading-tight"
                style={{ color: c.color }}
              >
                {c.emoji} {message.title}
              </h3>
              <button
                onClick={handleClose}
                className="w-6 h-6 rounded-full hover:bg-bg-alt flex items-center justify-center shrink-0"
              >
                <X size={14} className="text-text-tertiary" />
              </button>
            </div>

            <p className="text-[12.5px] text-text-primary leading-relaxed whitespace-pre-wrap mb-3">
              {message.content}
            </p>

            <button
              onClick={handleClose}
              className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: c.bg, color: c.color }}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
