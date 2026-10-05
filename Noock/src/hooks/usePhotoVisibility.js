// src/hooks/usePhotoVisibility.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Cache en memoria para evitar RPCs repetidos en la misma sesión.
// Se invalida al cerrar sesión (page reload lo limpia).
const cache = new Map(); // targetId → { should_blur, reason }

export function usePhotoVisibility(targetId) {
  const [state, setState] = useState(() => {
    if (!targetId)
      return { shouldBlur: false, reason: "no_target", loading: false };
    const cached = cache.get(targetId);
    if (cached) {
      return {
        shouldBlur: cached.should_blur,
        reason: cached.reason,
        loading: false,
      };
    }
    // Fallback seguro mientras carga: asumir borroso
    return { shouldBlur: true, reason: "loading", loading: true };
  });

  useEffect(() => {
    if (!targetId) {
      setState({ shouldBlur: false, reason: "no_target", loading: false });
      return;
    }

    const cached = cache.get(targetId);
    if (cached) {
      setState({
        shouldBlur: cached.should_blur,
        reason: cached.reason,
        loading: false,
      });
      return;
    }

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase.rpc("get_photo_visibility", {
        p_target_id: targetId,
      });

      if (!mounted) return;

      if (error || !data) {
        // Conservador: si falla, blur
        setState({ shouldBlur: true, reason: "error", loading: false });
        return;
      }

      cache.set(targetId, data);
      setState({
        shouldBlur: data.should_blur,
        reason: data.reason,
        loading: false,
      });
    };

    load();

    return () => {
      mounted = false;
    };
  }, [targetId]);

  return state;
}

// Para invalidar el cache cuando hay un match nuevo
export function invalidateVisibilityCache(targetId) {
  if (targetId) cache.delete(targetId);
  else cache.clear();
}
