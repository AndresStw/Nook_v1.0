import { Paperclip, Send, X, Reply, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { supabase } from "../../lib/supabase";
import ChatOptionsMenu from "./ChatOptionsMenu";
import PiBadge from "../ui/PiBadge";
import { createPortal } from "react-dom";
import { useCanInteract } from "../../hooks/useCanInteract";
import { useAuth } from "../../hooks/useAuth";

//Componente
export default function ChatPanel({ matchId, otherUser, onBack }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const { user, profile } = useAuth();
  const { canInteract, reason: blockReason } = useCanInteract(
    user?.id,
    profile?.onboarding_completed,
    profile?.role === "founder",
  );
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState(null);
  const { messages, messagesById, loading, error, sending, sendMessage } =
    useChat(matchId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);

  // Galería de fotos del otro usuario
  const [userPhotos, setUserPhotos] = useState([]);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState(null);
  const photoRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const [icebreakers, setIcebreakers] = useState([]);

  //Hook #1
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Hook #1.1  Cargar todas las fotos del otro usuario (para el popover al hover)
  useEffect(() => {
    if (!otherUser?.id) return;
    supabase
      .from("photos")
      .select("url, position")
      .eq("user_id", otherUser.id)
      .order("position")
      .then(({ data }) => setUserPhotos(data || []));
  }, [otherUser?.id]);

  // Hook #1.2  Cleanup del timer al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Hook #1.3 Cargar preguntas del otro usuario si el chat está vacío
  useEffect(() => {
    if (!otherUser?.id || !matchId) return;
    if (loading || messages.length > 0) return;

    supabase
      .rpc("get_icebreaker_questions", { p_user_id: otherUser.id })
      .then(({ data }) => setIcebreakers(data || []));
  }, [otherUser?.id, matchId, loading, messages.length]);

  //Hook #2
  useEffect(() => {
    if (!sending && matchId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sending, matchId]);

  //Hook #3
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //Hook #4 Ocultar toast automáticamente
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

    if (!canInteract) {
      setToast({
        message:
          blockReason === "readonly"
            ? "Estás en modo exploración. Completa tu perfil para enviar mensajes."
            : "Completa tu perfil para enviar mensajes.",
        type: "error",
      });
      return;
    }

    const result = await sendMessage(message, replyingTo?.id || null);

    // Si hubo error (validación o DB), mostrar toast y NO limpiar el input
    if (result?.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }

    // Se envió bien limpiar input y cancelar respuesta
    setMessage("");
    setReplyingTo(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  //  Escalar al mensaje original
  const handleScrollToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight temporal
      el.classList.add("ring-2", "ring-accent", "rounded-2xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-accent", "rounded-2xl");
      }, 1500);
    }
  };

  //  Enviar una pregunta como primer mensaje
  const handleSendIcebreaker = async (questionText) => {
    if (sending || !questionText) return;
    const result = await sendMessage(questionText);
    if (result?.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }
    setIcebreakers([]);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Hover sobre la foto  abrir popover (con delay)
  const handlePhotoEnter = () => {
    if (userPhotos.length <= 1) return; // no hay galería que mostrar
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (photoRef.current) {
        const rect = photoRef.current.getBoundingClientRect();
        setPopoverPos({
          top: rect.bottom + 10,
          left: Math.max(8, rect.left - 20),
        });
        setPhotosOpen(true);
      }
    }, 300);
  };

  const handlePhotoLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setPhotosOpen(false);
    }, 200);
  };

  // Click en la foto  ir al perfil
  const handleViewProfile = () => {
    if (otherUser?.id) navigate(`/u/${otherUser.id}`);
  };

  const handleArchive = async () => {
    if (!matchId) return;
    await supabase.rpc("archive_match", { p_match_id: matchId });
    navigate("/messages");
  };

  const handleUnarchive = async () => {
    if (!matchId) return;
    await supabase.rpc("unarchive_match", { p_match_id: matchId });
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
    <>
      <div className="bg-bg-surface border border-border rounded-2xl flex flex-col h-full shadow-soft overflow-hidden relative">
        {/* TOAST flotante de error */}
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
        <div className="flex items-center gap-2.5 p-3 md:p-3.5 border-b border-border-soft shrink-0">
          {/* Botón back solo en móvil */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0 -ml-1"
              aria-label="Volver"
            >
              <ArrowLeft size={18} className="text-text-primary" />
            </button>
          )}

          <div
            className="relative shrink-0"
            onMouseEnter={handlePhotoEnter}
            onMouseLeave={handlePhotoLeave}
          >
            <button
              ref={photoRef}
              onClick={handleViewProfile}
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent transition-all cursor-pointer"
              title="Chismosear el perfil"
            >
              {otherUser.photo ? (
                <img
                  src={otherUser.photo}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: otherUser.photo_focal
                      ? `${otherUser.photo_focal.x}% ${otherUser.photo_focal.y}%`
                      : "50% 50%",
                  }}
                />
              ) : (
                <div className="w-full h-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[11px]">
                  {otherUser.name?.[0] || "?"}
                </div>
              )}
            </button>
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
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-3.5 space-y-2.5">
          {loading && (
            <div className="text-center text-text-tertiary text-[11px] py-4">
              Cargando mensajes...
            </div>
          )}

          {error && (
            <div className="text-center text-error text-[11px] py-4">
              {error}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-8 px-4">
              <div className="text-3xl mb-3">🧊</div>
              <div className="text-[12.5px] font-semibold text-text-primary mb-1">
                Rompe el hielo
              </div>

              {icebreakers.length > 0 ? (
                <>
                  <div className="text-[11px] text-text-tertiary text-center mb-4 max-w-[260px] leading-snug">
                    Elige una de las preguntas que{" "}
                    {otherUser?.name?.split(" ")[0] || "esta persona"}{" "}
                    respondió:
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[320px]">
                    {icebreakers.slice(0, 3).map((q) => (
                      <button
                        key={q.question_id}
                        onClick={() => handleSendIcebreaker(q.text)}
                        disabled={sending}
                        className="text-left text-[12px] px-3.5 py-2.5 bg-bg-alt border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50 text-text-primary leading-snug"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-text-tertiary text-center max-w-[240px] leading-snug">
                  Manda un mensajito y rompe el hielo ✨
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.sender_id === currentUserId}
              replyTo={
                msg.reply_to_id ? messagesById.get(msg.reply_to_id) : null
              }
              otherUserName={otherUser?.name}
              onReply={() =>
                setReplyingTo({
                  id: msg.id,
                  content: msg.content,
                  sender_id: msg.sender_id,
                })
              }
              onScrollTo={handleScrollToMessage}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 md:p-2.5 border-t border-border-soft shrink-0">
          {/* Preview de respuesta */}
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-accent/8 border-l-2 border-accent rounded-r-lg">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-accent-hover mb-0.5">
                  Respondiendo a{" "}
                  {replyingTo.sender_id === currentUserId
                    ? "ti mismo"
                    : otherUser?.name || "alguien"}
                </div>
                <div className="text-[11px] text-text-secondary truncate">
                  {replyingTo.content}
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="w-6 h-6 rounded-full hover:bg-bg-alt flex items-center justify-center shrink-0 transition-colors"
                title="Cancelar respuesta"
              >
                <X size={13} className="text-text-tertiary" />
              </button>
            </div>
          )}

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
              placeholder={
                canInteract
                  ? "Suelta algo lindo..."
                  : "Modo exploración · no puedes enviar mensajes"
              }
              disabled={sending || !canInteract}
              className="flex-1 min-w-0 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none py-1 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || !canInteract}
              className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Popover de fotos al hover (en portal para que no lo corte el overflow-hidden) */}
      {photosOpen &&
        popoverPos &&
        userPhotos.length > 1 &&
        createPortal(
          <PhotoPreviewPopover
            photos={userPhotos}
            name={otherUser.name}
            city={otherUser.city}
            position={popoverPos}
            onMouseEnter={() => {
              if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            }}
            onMouseLeave={handlePhotoLeave}
            onViewProfile={() => {
              setPhotosOpen(false);
              handleViewProfile();
            }}
          />,
          document.body,
        )}
    </>
  );
}

function MessageBubble({
  message,
  isMine,
  replyTo,
  otherUserName,
  onReply,
  onScrollTo,
}) {
  const [hovered, setHovered] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartRef = useRef(null);
  const swipingRef = useRef(false);

  const time = new Date(message.created_at).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const repliedName = replyTo
    ? replyTo.sender_id === message.sender_id
      ? "sí mismo"
      : otherUserName || "alguien"
    : "";

  // === Swipe handlers (solo móvil) ===
  const handleTouchStart = (e) => {
    // Solo empezar swipe desde el lado izquierdo, no cuando ya hay scroll horizontal
    touchStartRef.current = e.touches[0].clientX;
    swipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === null) return;
    const dx = e.touches[0].clientX - touchStartRef.current;

    // Solo swipe hacia la derecha (dx > 0) y con un límite
    if (dx > 8 && dx < 90) {
      // Si es un swipe claro (más de 15px), activar y prevenir scroll
      if (dx > 15) {
        swipingRef.current = true;
        setSwipeX(dx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 55 && swipingRef.current) {
      // Vibrar si el dispositivo lo soporta
      if (navigator.vibrate) navigator.vibrate(15);
      onReply();
    }
    setSwipeX(0);
    touchStartRef.current = null;
    swipingRef.current = false;
  };

  // Trigger visual del swipe
  const swipeProgress = Math.min(swipeX / 60, 1);

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} items-end gap-1.5 group relative`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Icono de responder (solo desktop) */}
      <button
        onClick={onReply}
        className={`hidden md:flex w-6 h-6 rounded-full bg-bg-alt border border-border hover:bg-accent hover:text-bg items-center justify-center shrink-0 transition-all self-end mb-5 ${
          hovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        title="Responder"
      >
        <Reply size={11} />
      </button>

      {/* Icono de responder que aparece con el swipe (solo móvil) */}
      <div
        className={`md:hidden flex items-center justify-center shrink-0 self-end mb-5 transition-opacity ${
          swipeX > 10 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: swipeX,
          maxWidth: 60,
          color:
            swipeX > 55 ? "var(--color-accent)" : "var(--color-text-tertiary)",
        }}
      >
        <Reply
          size={14}
          style={{ transform: "scale(" + (0.6 + swipeProgress * 0.4) + ")" }}
        />
      </div>

      <div
        className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"} transition-transform`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? "transform 200ms ease" : "none",
        }}
      >
        <div
          className={`px-3 py-1.5 rounded-2xl text-[12.5px] leading-snug ${
            isMine
              ? "bg-accent text-bg rounded-br-md"
              : "bg-white border border-border text-text-primary rounded-bl-md"
          }`}
        >
          {replyTo && (
            <button
              onClick={() => onScrollTo(replyTo.id)}
              className={`w-full text-left mb-1.5 pl-2 border-l-2 rounded-sm ${
                isMine ? "border-bg/50 bg-bg/10" : "border-accent bg-accent/5"
              } py-1 px-2 hover:opacity-80 transition-opacity`}
            >
              <div
                className={`text-[9.5px] font-semibold mb-0.5 ${
                  isMine ? "text-bg/80" : "text-accent-hover"
                }`}
              >
                {repliedName}
              </div>
              <div
                className={`text-[10.5px] line-clamp-2 ${
                  isMine ? "text-bg/70" : "text-text-secondary"
                }`}
              >
                {replyTo.content}
              </div>
            </button>
          )}
          {message.content}
        </div>
        <span className="text-[9px] text-text-tertiary mt-0.5 px-1">
          {time}
        </span>
      </div>
    </div>
  );
}
function PhotoPreviewPopover({
  photos,
  name,
  city,
  position,
  onMouseEnter,
  onMouseLeave,
  onViewProfile,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-[260px] bg-bg-surface border border-border rounded-2xl shadow-elevated overflow-hidden animate-in"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border-soft">
        <div className="text-[12.5px] font-semibold text-text-primary truncate">
          Así es {name} 👀
        </div>
        {city && (
          <div className="text-[10.5px] text-text-tertiary flex items-center gap-1 mt-0.5">
            <MapPin size={9} />
            {city}
          </div>
        )}
      </div>

      {/* Grid de fotos */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {photos.slice(0, 6).map((p, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg overflow-hidden bg-bg-alt"
          >
            <img
              src={p.url}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Footer con CTA */}
      <button
        onClick={onViewProfile}
        className="w-full py-2 bg-accent text-bg text-[11.5px] font-semibold hover:opacity-90 transition-opacity"
      >
        Chismosear 🤭
      </button>
    </div>
  );
}
