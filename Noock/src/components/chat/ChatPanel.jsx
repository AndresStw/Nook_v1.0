import { Paperclip, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { supabase } from "../../lib/supabase";
import ChatOptionsMenu from "./ChatOptionsMenu";
import PiBadge from "../ui/PiBadge";

export default function ChatPanel({ matchId, otherUser }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState(null); // ← NUEVO
  const { messages, loading, error, sending, sendMessage } = useChat(matchId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!sending && matchId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sending, matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ocultar toast automáticamente
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  // ============================================
  // handleSend con validación anti-redes
  // ============================================
  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const result = await sendMessage(message);

    // Si hubo error (validación o DB), mostrar toast y NO limpiar el input
    if (result?.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }

    // Si se envió bien, limpiar input y volver a enfocar
    setMessage("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleArchive = async () => {
    if (!matchId) return;
    await supabase.rpc("archive_match", { p_match_id: matchId });
    navigate("/messages");
  };

  const handleUnarchive = async () => {
    if (!matchId) return;
    await supabase.rpc("unarchive_match", { p_match_id: matchId });
    // Disparar refresco de la lista
    window.dispatchEvent(new Event("refresh-conversations"));
    navigate("/messages");
  };

  const handleMute = async () => {
    if (!matchId) return;
    await supabase.rpc("mute_match", { p_match_id: matchId });
  };

  const handleBlock = async () => {
    if (!otherUser?.id) return;
    await supabase.rpc("block_user", { p_target_id: otherUser.id });
    navigate("/messages");
  };

  const handleReport = () => {
    navigate(`/report/${otherUser?.id}`);
  };

  if (!matchId || !otherUser) {
    return (
      <div className="bg-bg-surface border border-border rounded-2xl flex items-center justify-center h-full shadow-soft">
        <p className="text-[12px] text-text-tertiary">
          Selecciona una conversación
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl flex flex-col h-full shadow-soft overflow-hidden relative">
      {/* TOAST flotante de error (ej: intento de compartir redes) */}
      {toast && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-[12px] font-medium text-white shadow-elevated animate-in"
          style={{
            background: "#DC2626",
            maxWidth: "calc(100% - 32px)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 p-3.5 border-b border-border-soft shrink-0">
        <div className="relative shrink-0">
          {otherUser.photo ? (
            <img
              src={otherUser.photo}
              alt={otherUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[11px]">
              {otherUser.name?.[0] || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-[13px] font-semibold text-text-primary truncate">
              {otherUser.name}
            </div>
            <PiBadge pi={otherUser.pi || 0} size="xs" />
            {otherUser.vip && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-amber-700 bg-amber-100">
                VIP
              </span>
            )}
          </div>
          <div className="text-[10px] text-text-tertiary">En línea</div>
        </div>

        <ChatOptionsMenu
          matchId={matchId}
          otherUserId={otherUser.id}
          isArchived={otherUser.isArchived || false}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onMute={handleMute}
          onBlock={handleBlock}
          onReport={handleReport}
        />
      </div>

      {/* Mensajes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2.5">
        {loading && (
          <div className="text-center text-text-tertiary text-[11px] py-4">
            Cargando mensajes...
          </div>
        )}

        {error && (
          <div className="text-center text-error text-[11px] py-4">{error}</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-text-tertiary text-[11px] py-8">
            Di hola 👋
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-border-soft shrink-0">
        <div className="flex items-center gap-1.5 bg-bg-alt rounded-full pl-3 pr-1 py-1">
          <button className="text-text-tertiary hover:text-text-primary transition-colors shrink-0">
            <Paperclip size={14} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje"
            disabled={sending}
            className="flex-1 min-w-0 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none py-1 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  const time = new Date(message.created_at).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-[12.5px] leading-snug ${
          isMine
            ? "bg-accent text-bg rounded-br-md"
            : "bg-white border border-border text-text-primary rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
      <span className="text-[9px] text-text-tertiary mt-0.5 px-1">{time}</span>
    </div>
  );
}
