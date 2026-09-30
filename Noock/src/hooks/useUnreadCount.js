import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const channelIdRef = useRef(
    `unread-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );

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
      .channel(`unread-count-${userId}-${channelIdRef.current}`)
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

    // Listener del evento personalizado (refresco forzado)
    const handleRefresh = () => fetchCount();
    window.addEventListener("refresh-unread-count", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-unread-count", handleRefresh);
    };
  }, [userId, fetchCount]);

  return count;
}
