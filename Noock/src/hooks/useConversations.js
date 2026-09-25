import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_conversations");

    if (error) {
      console.error("🚨 NOOK-502: Error cargando conversaciones", error);
      setError(error.message);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();

    // Suscribirse a nuevos mensajes para actualizar el preview
    const channel = supabase
      .channel("conversations-updates")
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
}
