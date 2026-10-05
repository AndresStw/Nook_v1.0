import { useState, useEffect, useRef } from "react";
//prettier-ignore
import { X, Heart, MessageCircle, Send, Loader2, 
MoreVertical, Trash2, Flag, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import EventReportModal from "./EventReportModal";
import PiBadge from "../ui/PiBadge";

//Componente
//prettier-ignore
export default function EventPostModal({ open, post, onClose, onToggleLike, onDelete }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const commentsEndRef = useRef(null);
  const isOwner = post?.user_id === user?.id;

  //Hooks#1 Cargar comentarios
  useEffect(() => {
    if (!open || !post?.id) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_event_post_comments", {
        p_post_id: post.id,
      });
      if (mounted) {
        setComments(data || []);
        setLoading(false);
      }
    };
    load();

    //Funcion Realtime de comentarios
    const channel = supabase
      .channel(`event-comments-${post.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_post_comments",
          filter: `post_id=eq.${post.id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [open, post?.id]);

  //Hooks#2 Scroll al final de los comentarios
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async () => {
    const text = newComment.trim();
    if (!text || sending) return;
    setSending(true);

    const { data } = await supabase.rpc("create_event_post_comment", {
      p_post_id: post.id,
      p_content: text,
    });

    if (data?.success) {
      setNewComment("");
    }
    setSending(false);
  };

  const handleDelete = async () => {
    if (!confirm("¿Borrar tu publicación? Esta acción no se puede deshacer.")) return;
    await onDelete?.(post.id);
    onClose();
  };

  if (!open || !post) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-soft shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {post.user_photo ? (
                <img
                  src={post.user_photo}
                  alt={post.user_name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary shrink-0">
                  {post.user_name?.[0] || "?"}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-text-primary truncate">
                  {post.user_name}
                </div>
                <div className="text-[10.5px] text-text-tertiary">
                  {new Date(post.created_at).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                  })}
                  {post.status === "pending_review" && " · En revisión"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
                >
                  <MoreVertical size={16} className="text-text-secondary" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-9 z-50 w-44 bg-bg-surface border border-border rounded-xl shadow-elevated overflow-hidden">
                      {isOwner && (
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt text-left"
                        >
                          <Trash2 size={14} className="text-error" />
                          <span className="text-[12.5px] text-error">Borrar</span>
                        </button>
                      )}
                      {!isOwner && (
                        <button
                          onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt text-left"
                        >
                          <Flag size={14} className="text-error" />
                          <span className="text-[12.5px] text-error">Reportar</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Imagen */}
            <div className="bg-black flex items-center justify-center">
              <img
                src={post.image_url}
                alt={post.caption || "Post"}
                className="w-full max-h-[55vh] object-contain"
              />
            </div>

            {/* Caption + acciones */}
            <div className="p-4 border-b border-border-soft">
              {post.caption && (
                <p className="text-[13.5px] text-text-primary leading-relaxed mb-3">
                  {post.caption}
                </p>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onToggleLike?.(post.id)}
                  className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                    post.user_liked ? "text-error" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Heart
                    size={18}
                    className={post.user_liked ? "fill-error" : ""}
                    strokeWidth={post.user_liked ? 0 : 2}
                  />
                  {post.like_count}
                </button>
                <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                  <MessageCircle size={17} />
                  {comments.length}
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center py-6">
                  <Loader2 size={18} className="animate-spin text-accent mx-auto" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 text-[12px] text-text-tertiary">
                  Sé el primero en comentar 💬
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    {c.user_photo ? (
                      <img
                        src={c.user_photo}
                        alt={c.user_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-bg-alt flex items-center justify-center text-[11px] text-text-tertiary shrink-0 mt-0.5">
                        {c.user_name?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[12.5px] font-semibold text-text-primary truncate">
                          {c.user_name}
                        </span>
                        <span className="text-[10px] text-text-tertiary shrink-0">
                          {new Date(c.created_at).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-text-primary leading-snug break-words">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
          </div>

          {/* Input comentario */}
          <div className="p-3 border-t border-border-soft shrink-0">
            <div className="flex items-center gap-2 bg-bg-alt rounded-full pl-4 pr-1 py-1.5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 300))}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Escribe un comentario..."
                disabled={sending}
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendComment}
                disabled={sending || !newComment.trim()}
                className="w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center hover:opacity-90 disabled:opacity-40 shrink-0"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report modal */}
      <EventReportModal
        open={reportOpen}
        postId={post.id}
        onClose={() => setReportOpen(false)}
        onSuccess={() => {
        setTimeout(() => onClose(), 500); // Feedback opcional — cerramos el post por si fue auto-ocultado
        }}
      />
    </>
  );
}
