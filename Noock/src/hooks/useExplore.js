import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useExplore({ city, interestIds, sort, limit = 50 } = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("get_explore_users", {
      p_city: city || null,
      p_interest_ids: interestIds?.length > 0 ? interestIds : null,
      p_sort: sort || "recent",
      p_limit: limit,
    });

    if (error) {
      console.error("🚨 NOOK-502: Error cargando explore", error);
      setError(error.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, [city, interestIds, sort, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
