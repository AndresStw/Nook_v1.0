import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const channelIdRef = useRef(
    `conv-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_conversations");

    if (error) {
      console.error("🚨 NOOK-502: Error cargando conversaciones", error);
      setError(error.message);
    } else {
      setConversations(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();

    // Suscripción Realtime a cambios en la DB
    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        () => fetchConversations(),
      )
      .subscribe();

    // Listener del evento personalizado (para archivar/desarchivar)
    const handleRefresh = () => fetchConversations();
    window.addEventListener("refresh-conversations", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-conversations", handleRefresh);
    };
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
}
