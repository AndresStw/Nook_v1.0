import { useState } from "react";
import { MessageCircle, Heart, Clock, CheckCheck } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

const tabs = [
  { id: "new", label: "Nuevas", icon: Heart, count: 3 },
  { id: "active", label: "Activas", icon: MessageCircle, count: 8 },
  { id: "archived", label: "Archivadas", icon: Clock, count: 0 },
];

const mockConnections = [
  {
    id: 1,
    name: "Valentina",
    age: 23,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
    lastMessage: "¿Te gustaría ir algún día?",
    time: "10:30 p.m.",
    unread: 2,
    online: true,
    status: "new",
  },
  {
    id: 2,
    name: "Camila",
    age: 24,
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    lastMessage: "Jajaja me encanta esa idea",
    time: "9:12 p.m.",
    unread: 0,
    online: true,
    status: "active",
  },
  {
    id: 3,
    name: "Isabella",
    age: 25,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    lastMessage: "¿Qué tal estuvo tu día?",
    time: "8:45 p.m.",
    unread: 1,
    online: false,
    status: "active",
  },
  {
    id: 4,
    name: "Laura",
    age: 24,
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    lastMessage: "Buena noche ✨",
    time: "Ayer",
    unread: 0,
    online: false,
    status: "active",
  },
  {
    id: 5,
    name: "Andrés",
    age: 27,
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    lastMessage: "Entonces quedamos para el sábado",
    time: "Ayer",
    unread: 0,
    online: true,
    status: "active",
  },
  {
    id: 6,
    name: "Sofía",
    age: 26,
    photo:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80",
    lastMessage: "Me encantó la canción que me mandaste",
    time: "Lunes",
    unread: 0,
    online: false,
    status: "active",
  },
  {
    id: 7,
    name: "Mateo",
    age: 29,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    lastMessage: "Sí, vamos a ver qué pasa",
    time: "Lunes",
    unread: 0,
    online: false,
    status: "archived",
  },
];

export default function Connections() {
  const [activeTab, setActiveTab] = useState("active");

  const filtered = mockConnections.filter((c) => c.status === activeTab);

  return (
    <AppLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="shrink-0">
          <h1 className="text-xl font-bold text-text-primary mb-0.5">
            Conexiones
          </h1>
          <p className="text-[12px] text-text-secondary">
            Personas con las que has conectado
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 shrink-0 border-b border-border-soft">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
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
          {filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-4">
              {filtered.map((conn) => (
                <ConnectionCard key={conn.id} conn={conn} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ConnectionCard({ conn }) {
  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-3 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={conn.photo}
            alt={conn.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          {conn.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg-surface" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[13px] font-semibold text-text-primary truncate">
              {conn.name}, {conn.age}
            </div>
            <div className="text-[10px] text-text-tertiary shrink-0 ml-2">
              {conn.time}
            </div>
          </div>

          <p
            className={`text-[12px] truncate ${
              conn.unread > 0
                ? "text-text-primary font-medium"
                : "text-text-secondary"
            }`}
          >
            {conn.lastMessage}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
              <CheckCheck size={11} className="text-accent" />
              <span>Conversando</span>
            </div>

            {conn.unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-text-primary text-bg text-[10px] font-semibold flex items-center justify-center">
                {conn.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }) {
  const messages = {
    new: {
      title: "Sin conexiones nuevas",
      text: "Cuando alguien te corresponda, aparecerá aquí.",
    },
    active: {
      title: "Sin conversaciones activas",
      text: "Empieza a hablar con alguien para verlo aquí.",
    },
    archived: {
      title: "Sin conversaciones archivadas",
      text: "Las conversaciones que archives aparecerán aquí.",
    },
  };
  const msg = messages[tab];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <div className="w-12 h-12 rounded-full bg-bg-alt flex items-center justify-center mb-3">
        <Heart size={20} className="text-text-tertiary" />
      </div>
      <h3 className="text-[14px] font-semibold text-text-primary mb-1">
        {msg.title}
      </h3>
      <p className="text-[12px] text-text-secondary max-w-xs">{msg.text}</p>
    </div>
  );
}
