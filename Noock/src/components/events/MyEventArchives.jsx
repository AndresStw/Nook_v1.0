// src/components/events/MyEventArchives.jsx
import { useState, useEffect } from "react";
//prettier-ignore
import { Download, Loader2, Archive, Calendar, AlertCircle, 
Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyEventArchives() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_my_event_archives",
      );

      if (rpcError || data?.error) {
        setError(rpcError?.message || data.error);
      } else {
        setPosts(data?.posts || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleDownload = async (post) => {
    try {
      const res = await fetch(post.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nook-${post.season_name.toLowerCase()}-${post.id.slice(0, 8)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando:", err);
      alert("No pudimos descargar la imagen. Intenta de nuevo.");
    }
  };

  const handleDownloadAll = async () => {
    for (const post of posts) {
      await handleDownload(post);
      // Pequeña pausa para no saturar al navegador
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 size={18} className="animate-spin text-accent mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-[12px] text-error flex items-center gap-2">
        <AlertCircle size={13} />
        {error}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__header-title">
          <Archive size={16} /> Mis archivos del evento
        </div>
        <span className="profile-card__counter">
          <ImageIcon size={10} /> {posts.length}
        </span>
      </div>

      <p className="text-[12px] text-text-secondary mb-4 leading-relaxed">
        Estas fotos son de eventos pasados. Ya no aparecen en el feed, pero
        puedes descargarlas cuando quieras.
      </p>

      {/* Botón descargar todo (si hay más de 1) */}
      {posts.length > 1 && (
        <button
          onClick={handleDownloadAll}
          className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/15 text-accent-hover border border-accent/30 text-[12.5px] font-semibold hover:bg-accent/20 transition-colors"
        >
          <Download size={13} />
          Descargar todas ({posts.length})
        </button>
      )}

      {/* Grid de miniaturas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-bg-alt group"
          >
            <img
              src={post.image_url}
              alt={post.caption || "Post archivado"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            {/* Gradiente para legibilidad */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Emoji del evento */}
            {post.season_emoji && (
              <div className="absolute top-2 left-2 text-[16px] drop-shadow-lg">
                {post.season_emoji}
              </div>
            )}

            {/* Info inferior */}
            <div className="absolute inset-x-0 bottom-0 p-2 text-white">
              <div className="text-[10px] font-semibold truncate mb-1">
                {post.season_name}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-white/80">
                <Calendar size={9} />
                {new Date(post.created_at).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>

            {/* Overlay de descarga al hover */}
            <button
              onClick={() => handleDownload(post)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Descargar"
            >
              <div className="bg-white/95 text-text-primary rounded-full px-3.5 py-2 flex items-center gap-1.5 text-[11px] font-semibold shadow-xl">
                <Download size={12} />
                Descargar
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
