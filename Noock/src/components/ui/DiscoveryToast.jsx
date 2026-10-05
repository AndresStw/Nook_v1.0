import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

//Componente
export default function DiscoveryToast() {
  const [toast, setToast] = useState(null);

  //hook #1 :CoolDown
  useEffect(() => {
    const handler = (e) => {
      const { key, pi } = e.detail;
      setToast({ key, pi });
      const timeout = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timeout);
    };
    window.addEventListener("nook:discovery", handler);
    return () => window.removeEventListener("nook:discovery", handler);
  }, []);

  if (!toast) return null;

  const labels = {
    visit_feed: "Visitaste el Feed",
    visit_explore: "Descubriste Explorar",
    visit_connections: "Exploraste Conexiones",
    visit_messages: "Abriste Mensajes",
    visit_profile: "Visitaste tu Perfil",
    visit_events: "Descubriste Eventos",
    view_changelog: "Leíste el Historial de versión",
    send_first_like: "Enviaste tu primer like",
    send_first_message: "Enviaste tu primer mensaje",
    first_match: "¡Hiciste tu primer match!",
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-500 animate-in">
      <div className="bg-bg-surface border border-accent/30 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-accent-hover" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-text-primary">
            ¡Descubrimiento!
          </div>
          <div className="text-[11.5px] text-text-secondary">
            {labels[toast.key] || "Nuevo logro"} · +{toast.pi} PI
          </div>
        </div>
        <button
          onClick={() => setToast(null)}
          className="w-7 h-7 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0"
        >
          <X size={14} className="text-text-tertiary" />
        </button>
      </div>
    </div>
  );
}
