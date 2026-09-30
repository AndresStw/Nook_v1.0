import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { validateBio } from "../lib/profileValidation";
import { soundManager } from "../lib/sounds";

const STRICT_MESSAGES_LIMIT = 5; // primeros 5 mensajes: validación estricta

export function useChat(matchId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [lastRejected, setLastRejected] = useState(null); // para mostrar el toast
  const [messagesById, setMessagesById] = useState(() => new Map()); //responder mensajes expecificos nuevo
  const channelRef = useRef(null);
  const channelIdRef = useRef(
    `chat-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );

  // Cargar mensajes al cambiar de match
  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let titleFlashInterval = null;
    let originalTitle = null;

    const stopTitleFlash = () => {
      if (titleFlashInterval) {
        clearInterval(titleFlashInterval);
        titleFlashInterval = null;
      }
      if (originalTitle !== null) {
        document.title = originalTitle;
        originalTitle = null;
      }
    };

    const loadMessagesAndSubscribe = async () => {
      setLoading(true);

      // Obtener el usuario actual para comparar en el Realtime
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error("🚨 NOOK-502: Error cargando mensajes", error);
        setError(error.message);
      } else {
        const loadedMessages = data || [];
        setMessages(loadedMessages);
        // Poblar diccionario
        setMessagesById(new Map(loadedMessages.map((m) => [m.id, m])));
        try {
          await supabase.rpc("mark_messages_read", { p_match_id: matchId });
          window.dispatchEvent(new Event("refresh-unread-count"));
        } catch (err) {
          console.error("Error marcando como leído:", err);
        }
      }
      setLoading(false);

      // Suscribirse a los cambios en tiempo real
      const channel = supabase
        .channel(`${channelIdRef.current}-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${matchId}`,
          },
          async (payload) => {
            if (!isMounted) return;

            const isFromOther =
              currentUser && payload.new.sender_id !== currentUser.id;

            // Sonido si no es mío
            if (isFromOther) {
              soundManager.play("message");

              // Flash en el título de la pestaña (por si está en otra pestaña
              // o el audio está bloqueado por el navegador)
              if (!titleFlashInterval) {
                originalTitle = document.title;
                let flashOn = true;
                titleFlashInterval = setInterval(() => {
                  document.title = flashOn
                    ? "💬 Nuevo mensaje · Nook"
                    : originalTitle;
                  flashOn = !flashOn;
                }, 800);

                // Detener al volver a la pestaña
                const handleFocus = () => {
                  stopTitleFlash();
                  window.removeEventListener("focus", handleFocus);
                };
                window.addEventListener("focus", handleFocus);
              }

              // Marcar como leído porque el chat está ABIERTO
              try {
                await supabase.rpc("mark_messages_read", {
                  p_match_id: matchId,
                });
                // Avisar al badge del Sidebar que refresque
                window.dispatchEvent(new Event("refresh-unread-count"));
              } catch (err) {
                console.error("Error marcando como leído:", err);
              }
            }
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });

            //  Agregar al diccionario
            setMessagesById((prev) => {
              const next = new Map(prev);
              next.set(payload.new.id, payload.new);
              return next;
            });
          },
        )
        .subscribe();

      channelRef.current = channel;
    };

    loadMessagesAndSubscribe();

    return () => {
      isMounted = false;
      stopTitleFlash();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId]);

  // ============================================
  // sendMessage con validación anti-redes
  // ============================================
  const sendMessage = async (content, replyToId = null) => {
    if (!matchId || !content?.trim() || sending) return null;

    const trimmed = content.trim();

    // Obtener user actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No autenticado");
      return null;
    }

    // Contar cuántos mensajes ha enviado YO en este chat
    const myMessageCount = messages.filter(
      (m) => m.sender_id === user.id,
    ).length;

    // Si aún estoy en los primeros mensajes → validar
    const shouldValidate = myMessageCount < STRICT_MESSAGES_LIMIT;

    if (shouldValidate) {
      const check = validateBio(trimmed);

      if (!check.valid) {
        // Registrar el intento (strike)
        const { data: strikeData } = await supabase.rpc("log_bio_violation", {
          p_rule_id: `chat_${check.ruleId}`,
          p_attempted_text: trimmed.slice(0, 300),
        });

        // Reproducir sonido de error por violación de regla
        soundManager.play("warning");

        // Mensaje de marca
        const brandedError =
          strikeData?.penalty_applied > 0
            ? `${strikeData.message} (strike ${strikeData.strike_count}/10)`
            : "En Nook no compartimos redes en los primeros mensajes. Aquí se conecta de verdad. 🎭";

        setLastRejected({ reason: check.ruleId, text: trimmed });

        return {
          error: brandedError,
          ruleId: check.ruleId,
          strikeCount: strikeData?.strike_count || 1,
          penalty: strikeData?.penalty_applied || 0,
        };
      }
    }

    // Enviar normalmente
    setSending(true);

    const { error: insertError } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: trimmed,
      reply_to_id: replyToId, // Nuevo para responder los mensajes
    });

    if (insertError) {
      console.error("🚨 NOOK-502: Error enviando mensaje", insertError);
      setError(insertError.message);
      soundManager.play("error");
      setSending(false);
      return { error: insertError.message };
    }

    //  Sonido de mensaje enviado con éxito
    soundManager.play("message_sent");

    setSending(false);
    return { success: true };
  };

  // Limpiar el último rechazo (para que el toast desaparezca)
  const clearLastRejected = () => setLastRejected(null);

  return {
    messages,
    messagesById, //Nuevo
    loading,
    error,
    sending,
    sendMessage,
    lastRejected,
    clearLastRejected,
    isEarlyConversation:
      messages.filter((m) => m.sender_id).length < STRICT_MESSAGES_LIMIT,
  };
}
