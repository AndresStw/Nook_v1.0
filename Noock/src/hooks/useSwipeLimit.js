// src/hooks/useSwipeLimit.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_STATUS = {
  swipes_used: 0,
  swipes_left: 15,
  max_swipes: 15,
  reset_at: null,
  can_swipe: true,
};

export function useSwipeLimit() {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_swipe_status");

    if (error || data?.error) {
      console.warn(
        "⚠️ Error cargando swipe status:",
        error?.message || data?.error,
      );
      setLoading(false);
      return;
    }

    setStatus(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordSwipe = useCallback(async () => {
    const { data, error } = await supabase.rpc("record_swipe");

    if (error || data?.error) {
      console.warn(
        "⚠️ Error registrando swipe:",
        error?.message || data?.error,
      );
      return null;
    }

    if (data?.success) {
      // Actualizar con datos frescos del servidor
      setStatus({
        swipes_used: data.swipes_used,
        swipes_left: data.swipes_left,
        max_swipes: data.max_swipes,
        reset_at: data.reset_at,
        can_swipe: data.can_swipe,
      });
    } else if (data?.reason === "max_reached") {
      // Sincronizar con el server (por si el cliente tenía stale state)
      setStatus({
        swipes_used: data.swipes_used,
        swipes_left: 0,
        max_swipes: data.max_swipes,
        reset_at: data.reset_at,
        can_swipe: false,
      });
    }

    return data;
  }, []);

  return {
    status,
    loading,
    canSwipe: status.can_swipe,
    swipesLeft: status.swipes_left,
    swipesUsed: status.swipes_used,
    maxSwipes: status.max_swipes,
    resetAt: status.reset_at,
    recordSwipe,
    refresh,
  };
}
