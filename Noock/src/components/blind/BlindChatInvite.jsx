import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Check, X } from "lucide-react";
import { soundManager } from "../../lib/sounds";

const READING_TIME = 8;
const DECIDING_TIME = 20;
const REVEALING_TIME = 2;

// Rutas donde NO debe aparecer el chispazo
const PUBLIC_ROUTES = ["/", "/login", "/register", "/test", "/onboarding"];

export default function BlindChatInvite() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [invite, setInvite] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | reading | deciding | revealing | result
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(READING_TIME);
  const [myVoted, setMyVoted] = useState(false);
  const [theirVoted, setTheirVoted] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [theirVote, setTheirVote] = useState(null);

  const channelRef = useRef(null);
  const timerRef = useRef(null);
  const hasExpiredRef = useRef(false);
  const chatIdRef = useRef(null);

  // ============================================
  // GUARDS DE RUTA
  // ============================================
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const isBlindChatRoute = location.pathname.startsWith("/blind/");

  // Mantener el chatId en un ref para que el timer de revealing no se reinicie
  useEffect(() => {
    chatIdRef.current = invite?.id || null;
  }, [invite]);

  // Obtener usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Escuchar cambios de sesión (login/logout)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cargar invitación pendiente al montar (solo si está autenticado)
  useEffect(() => {
    if (!currentUserId) return;
    const checkPending = async () => {
      const { data } = await supabase
        .from("blind_chats")
        .select("*")
        .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
        .eq("status", "pending")
        .gt("decision_expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const chat = data[0];
        const seen = localStorage.getItem(`blind_seen_${chat.id}`);
        if (!seen) startInvite(chat);
      }
    };
    checkPending();
  }, [currentUserId]);

  // Realtime
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`blind-invites-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blind_chats" },
        (payload) => {
          const chat = payload.new;
          if (
            (chat.user_a === currentUserId || chat.user_b === currentUserId) &&
            chat.status === "pending"
          ) {
            const seen = localStorage.getItem(`blind_seen_${chat.id}`);
            if (!seen) startInvite(chat);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blind_chats" },
        (payload) => {
          const chat = payload.new;
          setInvite((prev) => {
            if (!prev || prev.id !== chat.id) return prev;
            return chat;
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [currentUserId]);

  // Detectar votos del otro (desde el chat que llega por Realtime)
  useEffect(() => {
    if (!invite || !currentUserId) return;
    const isUserA = invite.user_a === currentUserId;
    const myVotedDb = isUserA ? invite.user_a_voted : invite.user_b_voted;
    const theirVotedDb = isUserA ? invite.user_b_voted : invite.user_a_voted;

    if (myVotedDb && !myVoted) setMyVoted(true);
    if (theirVotedDb && !theirVoted) setTheirVoted(true);
  }, [invite, currentUserId]);

  // 1. Cuando ambos votaron → pasar a revealing (una sola vez)
  useEffect(() => {
    if (phase !== "deciding") return;
    if (!myVoted || !theirVoted) return;
    setPhase("revealing");
  }, [myVoted, theirVoted, phase]);

  // 2. Cuando estamos en revealing → esperar REVEALING_TIME y mostrar resultado
  useEffect(() => {
    if (phase !== "revealing") return;

    const chatId = chatIdRef.current;
    if (!chatId) return;

    const timeoutId = setTimeout(async () => {
      const { data } = await supabase
        .from("blind_chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (!data) {
        setResult("passed");
        setPhase("result");
        return;
      }

      if (data.status === "active") {
        setResult("matched");
        soundManager.play("match"); // 🔊 Sonido de Match exitoso
      } else if (data.status === "cancelled") {
        setResult("passed");
      } else if (data.status === "expired") {
        setResult("expired");
      }
      setPhase("result");
    }, REVEALING_TIME * 1000);

    return () => clearTimeout(timeoutId);
  }, [phase]);

  // Timer de fases
  useEffect(() => {
    if (phase !== "reading" && phase !== "deciding") return;
    if (!invite) return;

    const totalTime = phase === "reading" ? READING_TIME : DECIDING_TIME;
    const startAt = Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startAt) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (phase === "reading") {
          setPhase("deciding");
          setTimeLeft(DECIDING_TIME);
        } else if (phase === "deciding") {
          if (!myVoted && !hasExpiredRef.current) {
            hasExpiredRef.current = true;
            handleExpire();
          } else if (myVoted && !theirVoted) {
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              handleExpire();
            }
          }
        }
      }
    };

    tick();
    timerRef.current = setInterval(tick, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, invite, myVoted, theirVoted]);

  // Handlers
  const startInvite = (chat) => {
    soundManager.play("blind_chat"); // 🔊 Sonido al recibir la invitación de Chispazo
    setInvite(chat);
    setPhase("reading");
    setTimeLeft(READING_TIME);
    setMyVoted(false);
    setTheirVoted(false);
    setMyVote(null);
    setTheirVote(null);
    setResult(null);
    hasExpiredRef.current = false;

    const isUserA = chat.user_a === currentUserId;
    if (isUserA ? chat.user_a_voted : chat.user_b_voted) setMyVoted(true);
    if (isUserA ? chat.user_b_voted : chat.user_a_voted) setTheirVoted(true);
  };

  const handleVote = async (accept) => {
    if (phase !== "deciding") return;
    if (myVoted) return;

    setMyVoted(true);
    setMyVote(accept);

    await supabase.rpc("respond_blind_invite", {
      p_chat_id: invite.id,
      p_accept: accept,
    });

    localStorage.setItem(
      `blind_seen_${invite.id}`,
      accept ? "accepted" : "rejected",
    );
  };

  const handleExpire = async () => {
    await supabase.rpc("expire_blind_invite", { p_chat_id: invite.id });
    setResult("expired");
    setPhase("result");
  };

  const handleResultClose = () => {
    if (result === "matched") {
      navigate(`/blind/${invite.id}`);
    }
    setInvite(null);
    setPhase("idle");
    setResult(null);
  };

  // ============================================
  // GUARDS FINALES
  // ============================================
  if (!currentUserId) return null; // No autenticado
  if (isPublicRoute) return null; // Landing, login, register, onboarding
  if (isBlindChatRoute) return null; // Ya está en un blind chat
  if (!invite || phase === "idle") return null;

  // Resultado
  if (phase === "result") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-bg-surface rounded-3xl p-6 max-w-md w-full shadow-elevated animate-in text-center">
          {result === "matched" && (
            <>
              <div className="text-5xl mb-3">💚</div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                ¡Hay conexión!
              </h2>
              <p className="text-[13px] text-text-secondary mb-5">
                Ambos aceptaron. Ahora sí, a conocerse de verdad.
              </p>
              <button
                onClick={handleResultClose}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Entrar a la cita 🚀
              </button>
            </>
          )}

          {result === "passed" && (
            <>
              <div className="text-5xl mb-3">🍃</div>
              <h2 className="text-lg font-bold text-text-primary mb-2">
                No fue esta vez
              </h2>
              <p className="text-[13px] text-text-secondary mb-5">
                Al menos uno decidió no entrar. No pasa nada, hay más gente
                esperándote.
              </p>
              <button
                onClick={handleResultClose}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Seguir explorando
              </button>
            </>
          )}

          {result === "expired" && (
            <>
              <div className="text-5xl mb-3">⏱</div>
              <h2 className="text-lg font-bold text-text-primary mb-2">
                Se agotó el tiempo
              </h2>
              <p className="text-[13px] text-text-secondary mb-5">
                Alguno no alcanzó a decidir. La cita se canceló.
              </p>
              <button
                onClick={handleResultClose}
                className="w-full py-3 bg-accent text-bg rounded-xl font-medium text-[13px] hover:opacity-90 transition-opacity"
              >
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Revealing
  if (phase === "revealing") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-bg-surface rounded-3xl p-8 max-w-md w-full shadow-elevated animate-in text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Revelando resultado...
          </h2>
          <div className="flex justify-center gap-6 mt-5">
            <VoteCircle voted={true} label="Tú" />
            <VoteCircle voted={true} label="La otra persona" />
          </div>
        </div>
      </div>
    );
  }

  // Reading / Deciding
  const isReading = phase === "reading";
  const canVote = phase === "deciding" && !myVoted;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-surface rounded-3xl p-6 max-w-md w-full shadow-elevated animate-in">
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/40 to-accent mx-auto mb-4 flex items-center justify-center text-3xl">
            ⚡
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            ¡Chispazo! ⚡
          </h2>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Nook te conectó con alguien al azar. Tienes 5 minutos para hablar
            sin ver fotos. Solo palabras.
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 my-6">
          <VoteCircle voted={myVoted} label="Tú" />
          <div className="text-text-tertiary text-[18px]">·</div>
          <VoteCircle voted={theirVoted} label="La otra persona" />
        </div>

        <div className="text-center mb-5">
          {isReading ? (
            <>
              <p className="text-[12px] text-text-tertiary mb-1">Leyendo...</p>
              <p className="text-2xl font-bold text-accent tabular-nums">
                {timeLeft}
              </p>
            </>
          ) : (
            <>
              <p className="text-[12px] text-text-tertiary mb-1">
                Tiempo para decidir
              </p>
              <p
                className={`text-2xl font-bold tabular-nums ${timeLeft <= 5 ? "text-error" : "text-accent"}`}
              >
                {timeLeft}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!canVote}
            className={`w-full py-3 rounded-xl font-medium text-[13px] transition-all flex items-center justify-center gap-2 ${
              myVote === true
                ? "bg-accent text-bg"
                : canVote
                  ? "bg-accent text-bg hover:opacity-90"
                  : "bg-bg-alt text-text-tertiary cursor-not-allowed opacity-60"
            }`}
          >
            <Check size={15} />
            {myVote === true ? "Votaste sí" : "Vamos con toda"}
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={!canVote}
            className={`w-full py-3 rounded-xl font-medium text-[13px] transition-all flex items-center justify-center gap-2 border ${
              myVote === false
                ? "bg-bg-alt border-border text-text-primary"
                : canVote
                  ? "border-border text-text-secondary hover:bg-bg-alt"
                  : "border-border/40 text-text-tertiary cursor-not-allowed opacity-60"
            }`}
          >
            <X size={15} />
            {myVote === false ? "Votaste no" : "Ahora no"}
          </button>
        </div>

        <p className="text-[10px] text-text-tertiary text-center mt-3">
          {isReading
            ? "Espera un momento antes de decidir..."
            : myVoted && !theirVoted
              ? "Ya votaste. Esperando a la otra persona..."
              : "La cita empieza solo si ambos aceptan."}
        </p>
      </div>
    </div>
  );
}

function VoteCircle({ voted, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          voted
            ? "bg-accent text-bg animate-pulse"
            : "bg-bg-alt border-2 border-border text-text-tertiary"
        }`}
      >
        {voted ? (
          <Check size={18} strokeWidth={3} />
        ) : (
          <span className="text-[14px]">·</span>
        )}
      </div>
      <span className="text-[10px] text-text-tertiary">{label}</span>
    </div>
  );
}
