import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const fetchCount = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc("get_unread_count");
    if (!error && typeof data === "number") {
      setCount(data);
    }
  }, [userId]);

  // Obtener userId
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar y suscribirse a cambios
  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    fetchCount();

    // Realtime: escuchar nuevos mensajes y actualizaciones de read_at
    const channel = supabase
      .channel("unread-count-" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchCount(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => fetchCount(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchCount(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCount]);

  return count;
}
