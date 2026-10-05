import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

//Componente
export function useDiscovery(key) {
  const claimed = useRef(false);

  //Hooks #1:
  useEffect(() => {
    if (!key || claimed.current) return;
    claimed.current = true;

    //funcion
    const claim = async () => {
      const { data, error } = await supabase.rpc("claim_discovery", {
        p_discovery_key: key,
      });
      if (!error && data?.success) {
        window.dispatchEvent(
          new CustomEvent("nook:discovery", {
            detail: { key, pi: data.pi_earned },
          }),
        );
      }
    };
    //llamada funcion claim despues de cumplir todo
    claim();
  }, [key]);
}
