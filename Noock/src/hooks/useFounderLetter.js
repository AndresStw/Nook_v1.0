// src/hooks/useFounderLetter.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const LAST_SHOWN_KEY = "nook_founder_letter_last_shown";

export function useFounderLetter() {
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  const fetchLetter = useCallback(async () => {
    setLoading(true);

    // Cooldown local (24h)
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown, 10);
      if (elapsed < COOLDOWN_MS) {
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.rpc("get_latest_founder_letter");
    if (error || !data?.letter) {
      setLoading(false);
      return;
    }

    setLetter(data.letter);
    setShouldShow(true);
    setLoading(false);
  }, []);

  const dismiss = useCallback(async () => {
    if (letter?.id) {
      await supabase.rpc("dismiss_founder_letter", { p_letter_id: letter.id });
    }
    // El cooldown local arranca al descartar (no al mostrar)
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    setShouldShow(false);
  }, [letter]);

  useEffect(() => {
    fetchLetter();
  }, [fetchLetter]);

  return { letter, loading, shouldShow, dismiss };
}
