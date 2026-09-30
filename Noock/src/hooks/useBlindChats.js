import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useBlindChats() {
  const [blindChats, setBlindChats] = useState([]);
  const channelIdRef = useRef(
    `blind-list-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );
  const [loading, setLoading] = useState(true);

  const fetchBlindChats = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_blind_chats");
    if (error) {
      console.error("🚨 NOOK-502: Error cargando citas ciegas", error);
    } else {
      setBlindChats(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlindChats();

     const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blind_chats" },
        () => fetchBlindChats(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { blindChats, loading, refetch: fetchBlindChats };
}
