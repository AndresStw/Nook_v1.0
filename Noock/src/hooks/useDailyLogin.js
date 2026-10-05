import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useDailyLogin() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_daily_login_status");
    if (!error && data) setStatus(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const claim = async () => {
    if (claiming) return null;
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_daily_login");
    setClaiming(false);
    if (error) return { error: error.message };
    if (data?.success) {
      await fetchStatus();
    }
    return data;
  };

  return { status, loading, claiming, claim, refetch: fetchStatus };
}
