import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useEventPosts(seasonId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelIdRef = useRef(
    `event-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    // El RPC usa event_type. Mantenemos 'halloween' como filtro base
    // pero después filtramos por season_id en el cliente.
    const { data, error: rpcError } = await supabase.rpc("get_event_posts", {
      p_event_type: "halloween",
      p_limit: 100,
      p_offset: 0,
    });

    if (rpcError) {
      console.error("🚨 NOOK-502: Error cargando event posts", rpcError);
      setError(rpcError.message);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_posts" },
        () => fetchPosts(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_post_likes" },
        () => fetchPosts(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_post_comments" },
        () => fetchPosts(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

  const toggleLike = async (postId) => {
    const { data } = await supabase.rpc("toggle_event_post_like", {
      p_post_id: postId,
    });
    if (data?.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_liked: data.liked,
                like_count: Math.max(0, p.like_count + (data.liked ? 1 : -1)),
              }
            : p,
        ),
      );
    }
    return data;
  };

  const deletePost = async (postId) => {
    const { data } = await supabase.rpc("delete_my_event_post", {
      p_post_id: postId,
    });
    if (data?.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
    return data;
  };

  return { posts, loading, error, refetch: fetchPosts, toggleLike, deletePost };
}

export async function checkCanPost(eventType = "halloween") {
  const { data, error } = await supabase.rpc("can_post_event_today", {
    p_event_type: eventType,
  });
  if (error) return { can_post: false, reason: "error" };
  return data;
}
