import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Heart, X, Clock, AlertCircle } from "lucide-react";
import { useBlindChat } from "../hooks/useBlindChat";
import Logo from "../components/ui/Logo";
import BlindChatPanicButton from "../components/blind/BlindChatPanicButton";
import { supabase } from "../lib/supabase";
import PiBadge from "../components/ui/PiBadge";

export default function BlindChatView() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const {
    chat,
    profile,
    messages,
    loading,
    error,
    sending,
    deciding,
    timeLeft,
    currentUserId,
    sendMessage,
    decide,
  } = useBlindChat(chatId);

  const [message, setMessage] = useState("");
  const [decisionResult, setDecisionResult] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // ← MOVIDO AQUÍ ADENTRO

  // Auto-focus al input cuando el chat esté activo
  useEffect(() => {
    if (chat?.status === "active" && timeLeft > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chat?.status, timeLeft]);

  // Volver a enfocar cuando termine el envío
  useEffect(() => {
    if (!sending && chat?.status === "active" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sending, chat?.status]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleDecision = async (decision) => {
    const result = await decide(decision);
    if (result?.status === "matched") {
      setDecisionResult({ status: "matched", matchId: result.match_id });
    } else if (result?.status === "passed") {
      setDecisionResult({ status: "passed" });
    } else if (result?.status === "waiting") {
      setDecisionResult({ status: "waiting" });
    }
  };
  const handleAbandon = async (reason) => {
    const { data, error } = await supabase.rpc("abandon_blind_chat", {
      p_chat_id: chatId,
      p_reason: reason,
    });

    if (error) {
      console.error("🚨 NOOK-502: Error abandonando chat", error);
      return;
    }

    // Si fue reporte, ir al feed
    if (reason === "left_rude" || reason === "left_emergency") {
      navigate("/feed");
    } else {
      // Si fue "aburrido", también salir
      navigate("/feed");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary text-[13px]">
          Preparando la cita a ciegas...
        </div>
      </main>
    );
  }

  if (error || !chat || !profile) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md text-center">
          <AlertCircle size={32} className="text-error mx-auto mb-3" />
          <h2 className="text-[15px] font-bold text-text-primary mb-2">
            No pudimos abrir la cita
          </h2>
          <p className="text-[12px] text-text-secondary mb-4">
            {error || "Chat no encontrado"}
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="px-4 py-2 bg-accent text-bg rounded-lg text-[12px] font-medium"
          >
            Volver al feed
          </button>
        </div>
      </main>
    );
  }

  const timeIsUp = timeLeft === 0;

  if (
    chat.status === "pending" ||
    chat.status === "cancelled" ||
    chat.status === "expired"
  ) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md text-center">
          <div className="text-5xl mb-4">🍃</div>
          <h2 className="text-[15px] font-bold text-text-primary mb-2">
            Cita no disponible
          </h2>
          <p className="text-[12px] text-text-secondary mb-4">
            {chat.status === "pending" &&
              "Esperando que ambos acepten la invitación."}
            {chat.status === "cancelled" &&
              "La otra persona no aceptó la cita."}
            {chat.status === "expired" && "Se agotó el tiempo para aceptar."}
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="px-4 py-2 bg-accent text-bg rounded-lg text-[12px] font-medium"
          >
            Volver al feed
          </button>
        </div>
      </main>
    );
  }

  const myDecision =
    chat.user_a === currentUserId ? chat.user_a_decision : chat.user_b_decision;

  if (decisionResult) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-bg-surface border border-border rounded-2xl p-8 max-w-md text-center shadow-elevated">
          {decisionResult.status === "matched" && (
            <>
              <div className="text-5xl mb-4">💚</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                ¡Hay conexión!
              </h2>
              <p className="text-text-secondary text-[13px] mb-6">
                Ambos decidieron seguir conociéndose. Se revelaron las fotos.
              </p>
              <button
                onClick={() => navigate("/messages")}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Enviar mensaje
              </button>
            </>
          )}

          {decisionResult.status === "passed" && (
            <>
              <div className="text-5xl mb-4">🍃</div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                No fue esta vez
              </h2>
              <p className="text-text-secondary text-[13px] mb-6">
                La otra persona decidió no continuar. Así es la vida, hay más
                personas esperando.
              </p>
              <button
                onClick={() => navigate("/feed")}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Seguir explorando
              </button>
            </>
          )}

          {decisionResult.status === "waiting" && (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Esperando a la otra persona
              </h2>
              <p className="text-text-secondary text-[13px] mb-6">
                Tu decisión fue registrada. En cuanto la otra persona decida, te
                avisamos.
              </p>
              <button
                onClick={() => navigate("/messages")}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Ir a mensajes
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-bg flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border-soft bg-bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <div>
            <div className="text-[13px] font-bold text-text-primary">
              Cita a ciegas
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-text-tertiary">
                {profile.other_alias || "Misterio"}
              </span>
              <PiBadge pi={profile.pi || 0} size="xs" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              timeLeft <= 60
                ? "bg-error/10 text-error"
                : "bg-accent/10 text-accent-hover"
            }`}
          >
            <Clock size={13} />
            <span className="text-[12px] font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>

          {chat.status === "active" && (
            <BlindChatPanicButton onAbandon={handleAbandon} />
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-[380px_1fr] gap-0 overflow-hidden">
        {/* Perfil censurado (izquierda) */}
        <div className="border-r border-border-soft overflow-y-auto p-5 bg-bg">
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/40 to-accent mx-auto mb-3 flex items-center justify-center text-3xl">
              🎭
            </div>
            <div className="text-[15px] font-bold text-text-primary">
              {profile.other_alias}
            </div>
            <div className="text-[11px] text-text-tertiary">
              {profile.age} años · {profile.city}
            </div>
          </div>

          {profile.tagline && (
            <div className="bg-bg-surface border border-border rounded-xl p-3 mb-3">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">
                Su frase
              </div>
              <p className="text-[12.5px] text-text-primary font-medium">
                "{profile.tagline}"
              </p>
            </div>
          )}

          {profile.bio && (
            <div className="bg-bg-surface border border-border rounded-xl p-3 mb-3">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">
                Sobre ella/él
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.answers?.length > 0 && (
            <div className="bg-bg-surface border border-border rounded-xl p-3 mb-3">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
                Sus respuestas
              </div>
              <div className="space-y-2.5">
                {profile.answers.map((a, i) => (
                  <div key={i}>
                    <div className="text-[10px] text-text-tertiary italic mb-0.5">
                      {a.question}
                    </div>
                    <div className="text-[12px] text-text-primary">
                      {a.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.interests?.length > 0 && (
            <div className="bg-bg-surface border border-border rounded-xl p-3">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
                Intereses
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((i, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-1 bg-bg-alt border border-border rounded-full text-text-secondary"
                  >
                    {i.emoji} {i.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 p-3 bg-accent/8 rounded-xl border border-accent/20">
            <p className="text-[11px] text-text-secondary text-center leading-relaxed">
              Las fotos y nombres reales se revelan solo si ambos deciden
              seguir.
            </p>
          </div>
        </div>

        {/* Chat (derecha) */}
        <div className="flex flex-col bg-bg-surface min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-text-tertiary text-[12px] py-12">
                Aún no hay mensajes. Rompe el hielo tú 👋
              </div>
            )}

            {messages.map((msg) => (
              <BlindBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border-soft p-4 shrink-0">
            {!timeIsUp && chat.status === "active" && (
              <div className="flex items-center gap-2 bg-bg-alt rounded-full pl-4 pr-1 py-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Escribe algo..."
                  disabled={sending}
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send size={15} strokeWidth={2.2} />
                </button>
              </div>
            )}

            {timeIsUp && !myDecision && (
              <div className="text-center">
                <p className="text-[13px] text-text-primary font-medium mb-3">
                  El tiempo terminó. ¿Qué quieres hacer?
                </p>
                <div className="flex gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => handleDecision("pass")}
                    disabled={deciding}
                    className="flex-1 py-3 border-2 border-border text-text-primary rounded-xl font-medium text-[13px] hover:bg-bg-alt transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X size={15} />
                    Dejar pasar
                  </button>
                  <button
                    onClick={() => handleDecision("match")}
                    disabled={deciding}
                    className="flex-1 py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Heart size={15} className="fill-bg" />
                    Hacer match
                  </button>
                </div>
              </div>
            )}

            {timeIsUp && myDecision && !decisionResult && (
              <div className="text-center py-3">
                <p className="text-[12px] text-text-secondary">
                  Ya registraste tu decisión. Esperando a la otra persona...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function BlindBubble({ message, isMine }) {
  const time = new Date(message.created_at).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[13px] leading-snug ${
          isMine
            ? "bg-accent text-bg rounded-br-md"
            : "bg-bg-alt text-text-primary rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
      <span className="text-[9px] text-text-tertiary mt-1 px-1">{time}</span>
    </div>
  );
}
