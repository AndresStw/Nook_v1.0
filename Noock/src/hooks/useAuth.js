// src/hooks/useAuth.js
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);

  // Helper para desuscribir/remover canal activo
  const cleanupRealtime = async () => {
    if (subscriptionRef.current) {
      await supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };

  const setupRealtimeListener = async (userId) => {
    // 1. Limpiar cualquier canal anterior completamente
    await cleanupRealtime();

    // 2. Crear el canal y registrar callbacks ANTES de hacer .subscribe()
    const channel = supabase
      .channel(`auth:user:${userId}:${Date.now()}`) // Generar sufijo único para evitar colisión de sockets
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        (payload) => {
          if (payload.new.id === userId) {
            setProfile((prevProfile) => ({
              ...prevProfile,
              ...payload.new,
            }));
          }
        },
      );

    // 3. Guardar la referencia ANTES de suscribir
    subscriptionRef.current = channel;

    // 4. Suscribir al final
    channel.subscribe();
  };

  useEffect(() => {
    let mounted = true;

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
        if (mounted) {
          await setupRealtimeListener(currentUser.id);
        }
      } else {
        setProfile(null);
        setLoading(false);
        await cleanupRealtime();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      cleanupRealtime();
    };
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error cargando perfil:", error);
    }

    setProfile(data);
    setLoading(false);
  };

  // Disparar chispazo al loguearse
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.rpc("maybe_trigger_chispazo");
      if (!error && data?.status === "created") {
        console.log("🎭 Chispazo disparado:", data.chat_id);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user]);

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await cleanupRealtime();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refetchProfile: () => user && fetchProfile(user.id),
  };
}
