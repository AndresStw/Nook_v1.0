import { useState } from "react";
import { useNavigate } from "react-router-dom";
//prettier-ignore
import { MessageCircle, Heart, Clock, CheckCheck, Archive,Sparkles,} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import PiBadge from "../components/ui/PiBadge";
import { useConnections } from "../hooks/useConnections";
import { useDiscovery } from "../hooks/useDiscovery";

//Componente
export default function Connections() {
  const navigate = useNavigate();
  const { groups, loading } = useConnections();
  const [activeTab, setActiveTab] = useState("active");
  useDiscovery("visit_connections");

  const tabs = [
    { id: "new", label: "Nuevos", icon: Sparkles, count: groups.new.length },
    {
      id: "active",
      label: "Activos",
      icon: MessageCircle,
      count: groups.active.length,
    },
    {
      id: "archived",
      label: "Archivados",
      icon: Clock,
      count: groups.archived.length,
    },
  ];

  const currentList = groups[activeTab] || [];

  return (
    <AppLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-text-primary mb-0.5">
            Conexiones
          </h1>
          <p className="text-[11px] md:text-[12px] text-text-secondary">
            {groups.new.length + groups.active.length} conexiones activas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 shrink-0 border-b border-border-soft overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
                activeTab === id
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={14} />
              {label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === id
                      ? "bg-text-primary text-bg"
                      : "bg-bg-alt text-text-tertiary"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && (
            <div className="text-center py-12 text-text-tertiary text-[12px]">
              Cargando conexiones...
            </div>
          )}

          {!loading && currentList.length === 0 && (
            <EmptyState tab={activeTab} />
          )}

          {!loading && currentList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4">
              {currentList.map((conn) => (
                <ConnectionCard
                  key={conn.match_id}
                  conn={conn}
                  onOpen={() => navigate(`/messages?match=${conn.match_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ConnectionCard({ conn, onOpen }) {
  const lastActive = conn.other_last_active
    ? new Date(conn.other_last_active)
    : null;
  const isOnline =
    lastActive && Date.now() - lastActive.getTime() < 5 * 60 * 1000;

  const timeAgo = conn.last_message_at
    ? formatTimeAgo(new Date(conn.last_message_at))
    : formatTimeAgo(new Date(conn.match_created_at));

  return (
    <button
      onClick={onOpen}
      className="bg-bg-surface border border-border rounded-2xl p-3 shadow-soft hover:shadow-card hover:border-accent/40 transition-all text-left w-full"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {conn.other_photo ? (
            <img
              src={conn.other_photo}
              alt={conn.other_name}
              className="w-14 h-14 rounded-full object-cover"
              style={{
                objectPosition: conn.other_photo_focal
                  ? `${conn.other_photo_focal.x}% ${conn.other_photo_focal.y}%`
                  : "50% 50%",
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[18px]">
              {conn.other_name?.[0] || "?"}
            </div>
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg-surface" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Nombre + badges (fila 1) */}
          <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
            <div className="text-[13.5px] font-semibold text-text-primary truncate">
              {conn.other_name}
            </div>
            {conn.other_vip && (
              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full text-amber-700 bg-amber-100 shrink-0 whitespace-nowrap">
                VIP
              </span>
            )}
            <div className="text-[10px] text-text-tertiary shrink-0 ml-auto">
              {timeAgo}
            </div>
          </div>

          {/* PI Badge (fila 2 separada) */}
          <div className="flex items-center gap-2 mb-1">
            <PiBadge pi={conn.other_pi || 0} size="xs" />
            {conn.total_messages > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <CheckCheck size={10} className="text-accent" />
                <span>{conn.total_messages}</span>
              </div>
            )}
            {conn.total_messages === 0 && (
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <Sparkles size={10} className="text-accent" />
                <span>Match nuevo</span>
              </div>
            )}
          </div>

          {/* Último mensaje + unread */}
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-[12px] truncate ${
                conn.unread_count > 0
                  ? "text-text-primary font-medium"
                  : "text-text-secondary"
              }`}
            >
              {conn.last_message || "Di hola 👋"}
            </p>
            {conn.unread_count > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-text-primary text-bg text-[10px] font-semibold flex items-center justify-center shrink-0">
                {conn.unread_count > 9 ? "9+" : conn.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ tab }) {
  const messages = {
    new: {
      icon: Sparkles,
      title: "Sin conexiones nuevas",
      text: "Cuando tengas un match nuevo, aparecerá aquí.",
    },
    active: {
      icon: MessageCircle,
      title: "Sin conversaciones activas",
      text: "Empieza a hablar con alguien para verlas aquí.",
    },
    archived: {
      icon: Archive,
      title: "Sin conversaciones archivadas",
      text: "Las conversaciones que archives aparecerán aquí.",
    },
  };
  const msg = messages[tab];
  const Icon = msg.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <div className="w-12 h-12 rounded-full bg-bg-alt flex items-center justify-center mb-3">
        <Icon size={20} className="text-text-tertiary" />
      </div>
      <h3 className="text-[14px] font-semibold text-text-primary mb-1">
        {msg.title}
      </h3>
      <p className="text-[12px] text-text-secondary max-w-xs">{msg.text}</p>
    </div>
  );
}

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
