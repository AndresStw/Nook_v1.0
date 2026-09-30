// src/hooks/useFeed.js
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useFeed(limit = 20) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_filtered_profiles",
        {
          p_limit: limit,
        },
      );

      if (rpcError) {
        console.error("Error cargando feed:", rpcError);
        setError(rpcError.message);
        setProfiles([]);
        setLoading(false);
        return;
      }

      let feedData = data || [];

      // Sincronizar y enriquecer con los datos más recientes de la tabla users y sus respuestas
      if (feedData.length > 0) {
        const userIds = feedData.map((p) => p.id);

        const [usersRes, answersRes, questionsRes] = await Promise.all([
          supabase
            .from("users")
            .select(
              "id, pi, bio, tagline, name, city, verified, role, hearts, vip_level, gender_internal, gender_public",
            )
            .in("id", userIds),
          supabase
            .from("user_answers")
            .select("*")
            .in("user_id", userIds),
          supabase
            .from("questions")
            .select("*"),
        ]);

        const freshUsers = usersRes.data || [];
        const userAnswers = answersRes.data || [];
        const questionsList = questionsRes.data || [];

        // Mapear id de pregunta a su texto (en la tabla questions la columna es 'text' o 'question')
        const qMap = new Map(
          questionsList.map((q) => [q.id, q.text || q.question || ""]),
        );

        // Agrupar respuestas por user_id
        const answersMap = new Map();
        userAnswers.forEach((a) => {
          if (!a.answer || !a.answer.trim()) return;
          const qText = qMap.get(a.question_id);
          if (!qText) return;

          if (!answersMap.has(a.user_id)) {
            answersMap.set(a.user_id, []);
          }
          answersMap.get(a.user_id).push({
            question_id: a.question_id,
            question: qText,
            answer: a.answer,
            is_displayed: a.is_displayed,
          });
        });

        const freshMap = new Map(freshUsers.map((u) => [u.id, u]));

        feedData = feedData.map((p) => {
          const fresh = freshMap.get(p.id);

          // Filtrar las preguntas que el usuario eligió mostrar (is_displayed === true)
          const allUserAns = answersMap.get(p.id) || p.answers || [];
          const displayedAns = allUserAns.filter((a) => a.is_displayed);
          const finalAns =
            displayedAns.length > 0
              ? displayedAns.slice(0, 3)
              : allUserAns.slice(0, 3);

          return {
            ...p,
            ...(fresh || {}),
            pi: fresh?.pi ?? p.pi ?? 0,
            bio: fresh?.bio ?? p.bio ?? "",
            tagline: fresh?.tagline ?? p.tagline ?? "",
            name: fresh?.name ?? p.name,
            city: fresh?.city ?? p.city,
            gender_internal: fresh?.gender_internal ?? p.gender_internal,
            gender_public: fresh?.gender_public ?? p.gender_public,
            answers: finalAns,
          };
        });
      }

      setProfiles(feedData);
    } catch (err) {
      console.error("Error inesperado en feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProfiles();

    // Limpiar canal anterior si existía
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `feed:realtime:${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      // 1. Escuchar cambios de perfil en users (bio, nombre, pi, tagline, género, etc.)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        (payload) => {
          if (!payload?.new?.id) return;
          setProfiles((prevProfiles) =>
            prevProfiles.map((p) => {
              if (p.id === payload.new.id) {
                return {
                  ...p,
                  ...payload.new,
                  pi: payload.new.pi ?? p.pi ?? 0,
                  gender_internal:
                    payload.new.gender_internal ?? p.gender_internal,
                  gender_public:
                    payload.new.gender_public ?? p.gender_public,
                };
              }
              return p;
            }),
          );
        },
      )
      // 2. Escuchar cambios en fotos (subidas, eliminaciones o cambios de orden)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "photos",
        },
        async (payload) => {
          const targetUserId = payload.new?.user_id || payload.old?.user_id;
          if (!targetUserId) return;

          setProfiles((prevProfiles) => {
            const isVisible = prevProfiles.some((p) => p.id === targetUserId);
            if (!isVisible) return prevProfiles;

            supabase
              .from("photos")
              .select("*")
              .eq("user_id", targetUserId)
              .order("position")
              .then(({ data: userPhotos }) => {
                if (userPhotos) {
                  setProfiles((curr) =>
                    curr.map((p) =>
                      p.id === targetUserId ? { ...p, photos: userPhotos } : p,
                    ),
                  );
                }
              });

            return prevProfiles;
          });
        },
      )
      // 3. Escuchar cambios en intereses
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_interests",
        },
        async (payload) => {
          const targetUserId = payload.new?.user_id || payload.old?.user_id;
          if (!targetUserId) return;

          setProfiles((prevProfiles) => {
            const isVisible = prevProfiles.some((p) => p.id === targetUserId);
            if (!isVisible) return prevProfiles;

            supabase
              .from("user_interests")
              .select("interests(id, name, emoji)")
              .eq("user_id", targetUserId)
              .then(({ data }) => {
                if (data) {
                  const mappedInterests = data
                    .map((item) => item.interests)
                    .filter(Boolean);
                  setProfiles((curr) =>
                    curr.map((p) =>
                      p.id === targetUserId
                        ? { ...p, interests: mappedInterests }
                        : p,
                    ),
                  );
                }
              });

            return prevProfiles;
          });
        },
      )
      // 4. Escuchar cambios en respuestas a las preguntas
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_answers",
        },
        async (payload) => {
          const targetUserId = payload.new?.user_id || payload.old?.user_id;
          if (!targetUserId) return;

          setProfiles((prevProfiles) => {
            const isVisible = prevProfiles.some((p) => p.id === targetUserId);
            if (!isVisible) return prevProfiles;

            Promise.all([
              supabase
                .from("user_answers")
                .select("*")
                .eq("user_id", targetUserId),
              supabase
                .from("questions")
                .select("*"),
            ]).then(([ansRes, qRes]) => {
              if (ansRes.data && qRes.data) {
                const qMap = new Map(
                  qRes.data.map((q) => [q.id, q.text || q.question || ""]),
                );
                let mapped = ansRes.data
                  .filter((a) => a.answer && a.answer.trim())
                  .map((a) => ({
                    question_id: a.question_id,
                    question: qMap.get(a.question_id),
                    answer: a.answer,
                    is_displayed: a.is_displayed,
                  }))
                  .filter((a) => a.question);

                const displayed = mapped.filter((a) => a.is_displayed);
                if (displayed.length > 0) {
                  mapped = displayed.slice(0, 3);
                } else {
                  mapped = mapped.slice(0, 3);
                }

                setProfiles((curr) =>
                  curr.map((p) =>
                    p.id === targetUserId
                      ? { ...p, answers: mapped }
                      : p,
                  ),
                );
              }
            });

            return prevProfiles;
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchProfiles]);

  const removeProfile = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return { profiles, loading, error, refetch: fetchProfiles, removeProfile };
}
