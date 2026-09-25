import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useFeed(limit = 10) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("get_feed_profiles", {
      p_limit: limit,
    });

    if (error) {
      console.error("🚨 NOOK-502: Error cargando feed", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
  }, [limit]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchFeed,
  };
}
