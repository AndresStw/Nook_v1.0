import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { validateBio } from "../lib/profileValidation";

const STRICT_MESSAGES_LIMIT = 5; // primeros 5 mensajes: validación estricta

export function useChat(matchId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [lastRejected, setLastRejected] = useState(null); // para mostrar el toast
  const channelRef = useRef(null);

  // Cargar mensajes al cambiar de match
  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      setLoading(true);
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
        setMessages(data || []);
        await supabase.rpc("mark_messages_read", { p_match_id: matchId });
      }
      setLoading(false);
    };

    loadMessages();

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (!isMounted) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId]);

  // ============================================
  // sendMessage con validación anti-redes
  // ============================================
  const sendMessage = async (content) => {
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
    });

    if (insertError) {
      console.error("🚨 NOOK-502: Error enviando mensaje", insertError);
      setError(insertError.message);
      setSending(false);
      return { error: insertError.message };
    }

    setSending(false);
    return { success: true };
  };

  // Limpiar el último rechazo (para que el toast desaparezca)
  const clearLastRejected = () => setLastRejected(null);

  return {
    messages,
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
