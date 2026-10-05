import { Heart, MessageCircle, Eye, Clock } from "lucide-react";

export default function EventPostCard({ post, onClick, onQuickLike }) {
  const isPending = post.status === "pending_review";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="relative aspect-square rounded-2xl overflow-hidden group bg-bg-alt text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <img
        src={post.image_url}
        alt={post.caption || "Post"}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* Gradiente permanente */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Badge "en revisión" */}
      {isPending && (
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[9.5px] font-bold flex items-center gap-1">
          <Clock size={10} />
          En revisión
        </div>
      )}

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm text-text-primary text-[11px] font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5">
          <Eye size={12} />
          Ver post
        </div>
      </div>

      {/* Info del post */}
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="text-[11.5px] font-semibold mb-1.5 truncate">
          {post.user_name}
        </div>

        {post.caption && (
          <p className="text-[10.5px] text-white/90 line-clamp-2 leading-snug mb-2">
            {post.caption}
          </p>
        )}

        <div className="flex items-center gap-3 text-[10.5px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickLike?.(post.id);
            }}
            className={`flex items-center gap-1 transition-colors ${
              post.user_liked ? "text-error" : "text-white/90 hover:text-white"
            }`}
          >
            <Heart
              size={13}
              className={post.user_liked ? "fill-error" : ""}
              strokeWidth={post.user_liked ? 0 : 2}
            />
            {post.like_count}
          </button>
          <div className="flex items-center gap-1 text-white/90">
            <MessageCircle size={12} />
            {post.comment_count}
          </div>
        </div>
      </div>
    </div>
  );
}
