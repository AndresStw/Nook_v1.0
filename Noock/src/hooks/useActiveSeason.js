import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useActiveSeason() {
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("event_seasons")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        setSeason(null);
      } else {
        setSeason(data);
      }
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`active-season-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_seasons" },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const isPostDay = () => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }),
    );
    return now.getDay() === (season?.post_day ?? 5);
  };

  const getNextPostDay = () => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }),
    );
    const dow = now.getDay();
    const target = season?.post_day ?? 5;
    const daysUntil = (target - dow + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntil);
    return next.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return { season, loading, isPostDay, getNextPostDay };
}
