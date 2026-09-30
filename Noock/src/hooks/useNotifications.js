import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { soundManager } from "../lib/sounds";

//Componente
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_my_notifications");
    if (error) {
      console.error("NOOK-502: Error cargando notificaciones", error);
      return;
    }

    // Reproducir sonido solo si llegan notificaciones NUEVAS
    // (no en la carga inicial)
    if (initialLoadDone.current && data) {
      const prevCount = notifications.length;
      if (data.length > prevCount) {
        soundManager.play("notification");
      }
    }
    initialLoadDone.current = true;

    setNotifications(data || []);
    setLoading(false);
  }, [notifications.length]);

  useEffect(() => {
    fetchNotifications();

    // Realtime: escuchar nuevas notificaciones
    const channel = supabase
      .channel("notifications-" + Date.now())
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        async (payload) => {
          const match = payload.new;
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          // Solo si YO soy parte del match
          const iAmInMatch =
            match.user_a === user.id || match.user_b === user.id;
          if (!iAmInMatch) return;

          // Sonido de match
          soundManager.play("match");

          // Disparar un evento global para que el Feed muestre el popup
          window.dispatchEvent(
            new CustomEvent("nook-match", {
              detail: {
                matchId: match.id,
                otherUserId:
                  match.user_a === user.id ? match.user_b : match.user_a,
              },
            }),
          );

          fetchNotifications();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        () => fetchNotifications(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "support_messages" },
        () => fetchNotifications(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAsRead = async (notificationId) => {
    const { error } = await supabase.rpc("mark_support_message_read", {
      p_message_id: notificationId,
    });
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read_at);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
