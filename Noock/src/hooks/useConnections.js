import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useConnections() {
  const [groups, setGroups] = useState({ new: [], active: [], archived: [] });
  const channelIdRef = useRef(
    `conn-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("get_connections_grouped");

    if (error) {
      console.error("🚨 NOOK-502: Error cargando conexiones", error);
      setError(error.message);
      setGroups({ new: [], active: [], archived: [] });
    } else {
      setGroups({
        new: data?.new || [],
        active: data?.active || [],
        archived: data?.archived || [],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();

    // Realtime: actualizar cuando haya nuevo match o mensaje
    const channel = supabase
      .channel(channelIdRef.current)

      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchGroups(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchGroups(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchGroups]);

  return { groups, loading, error, refetch: fetchGroups };
}
