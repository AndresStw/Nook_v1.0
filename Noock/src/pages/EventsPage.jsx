import { useState } from "react";
import { Plus, Calendar, Lock, Sparkles } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import EventPostCard from "../components/events/EventPostCard";
import EventPostModal from "../components/events/EventPostModal";
import EventUploadModal from "../components/events/EventUploadModal";
import { useEventPosts } from "../hooks/useEventPosts";
import { useActiveSeason } from "../hooks/useActiveSeason";
import { useDiscovery } from "../hooks/useDiscovery";

export default function EventsPage() {
  const {
    season,
    loading: seasonLoading,
    isPostDay,
    getNextPostDay,
  } = useActiveSeason();
  const { posts, loading, refetch, toggleLike, deletePost } = useEventPosts();
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Discovery al entrar
  useDiscovery("visit_events");

  const friday = isPostDay();

  const handleToggleLike = async (postId) => {
    await toggleLike(postId);
    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? {
            ...prev,
            user_liked: !prev.user_liked,
            like_count: Math.max(
              0,
              prev.like_count + (prev.user_liked ? -1 : 1),
            ),
          }
        : prev,
    );
  };

  // Todavía cargando temporada
  if (seasonLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-text-secondary text-[13px]">
            Cargando evento...
          </div>
        </div>
      </AppLayout>
    );
  }

  // No hay evento activo
  if (!season) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center flex-col gap-2 p-6 text-center">
          <div className="text-5xl mb-3">🌙</div>
          <h2 className="text-[15px] font-bold text-text-primary">
            No hay eventos activos
          </h2>
          <p className="text-[12px] text-text-secondary max-w-xs">
            Vuelve pronto, estamos preparando algo especial.
          </p>
        </div>
      </AppLayout>
    );
  }

  const bgGradient =
    "bg-gradient-to-br from-orange-500 via-orange-600 to-purple-700";

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-8">
          {/* Hero */}
          <div
            className={`relative rounded-3xl overflow-hidden mb-6 ${bgGradient} text-white`}
          >
            <div className="absolute inset-0 opacity-20 text-[120px] flex items-center justify-end pr-8 select-none">
              {season.emoji}
            </div>
            <div className="relative p-6 md:p-8">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-90 mb-1">
                Evento activo
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {season.emoji} {season.name}
              </h1>
              <p className="text-[13px] md:text-[14px] opacity-95 mb-4 max-w-lg">
                {season.tagline}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setUploadOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-white text-orange-700 font-bold text-[12.5px] shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  {friday ? <Plus size={14} /> : <Lock size={14} />}
                  {friday ? "Subir foto" : "Solo viernes"}
                </button>

                <div className="px-3.5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-medium flex items-center gap-1.5">
                  <Calendar size={12} />
                  {friday
                    ? "Puedes publicar hoy"
                    : `Próximo: ${getNextPostDay()}`}
                </div>

                <div className="px-3.5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-medium flex items-center gap-1.5">
                  <Sparkles size={12} />
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-16 text-text-tertiary text-[12px]">
              Cargando publicaciones...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{season.emoji}</div>
              <h3 className="text-[15px] font-bold text-text-primary mb-2">
                Aún no hay publicaciones
              </h3>
              <p className="text-[12px] text-text-secondary max-w-xs mx-auto mb-4">
                {friday
                  ? "Sé el primero en subir tu foto del evento."
                  : `El próximo día de publicación es ${getNextPostDay()}.`}
              </p>
              {friday && (
                <button
                  onClick={() => setUploadOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-accent text-bg text-[12.5px] font-bold hover:opacity-90 transition-opacity"
                >
                  Subir mi foto
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {posts.map((post) => (
                <EventPostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  onQuickLike={handleToggleLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EventUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={refetch}
        season={season}
      />

      {selectedPost && (
        <EventPostModal
          open={!!selectedPost}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike}
          onDelete={async (id) => {
            await deletePost(id);
            setSelectedPost(null);
          }}
        />
      )}
    </AppLayout>
  );
}
