import { useState } from "react";
import { Search, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ChatPanel from "../components/chat/ChatPanel";
import { useConversations } from "../hooks/useConversations";
import { useBlindChats } from "../hooks/useBlindChats";

export default function Messages() {
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const { blindChats, loading: loadingBlinds } = useBlindChats();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.other_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedConv = conversations.find((c) => c.match_id === selectedId);
  const otherUser = selectedConv
    ? {
        id: selectedConv.other_user_id,
        name: selectedConv.other_name,
        photo: selectedConv.other_photo,
        pi: selectedConv.other_pi || 0,
        vip: selectedConv.other_vip_level,
      }
    : null;

  return (
    <AppLayout>
      <div className="h-full grid grid-cols-[320px_1fr] gap-4">
        <div className="bg-bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-soft">
          <div className="p-3.5 border-b border-border-soft shrink-0">
            <h2 className="text-[14px] font-bold text-text-primary mb-2.5">
              Mensajes
            </h2>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="w-full pl-9 pr-3 py-2 bg-bg-alt rounded-lg text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Blind chats activos */}
            {!loadingBlinds && blindChats.length > 0 && (
              <div className="px-3 pt-3 pb-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 px-1">
                  Citas a ciegas
                </div>
                {blindChats.map((bc) => (
                  <button
                    key={bc.id}
                    onClick={() => navigate(`/blind/${bc.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-alt transition-colors text-left mb-1"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/40 to-accent flex items-center justify-center text-base shrink-0">
                      🎭
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-text-primary truncate">
                        {bc.other_alias}
                      </div>
                      <div className="text-[10px] text-text-tertiary truncate">
                        {bc.status === "active" && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={9} />
                            En curso
                          </span>
                        )}
                        {bc.status === "finished" &&
                          "Terminada - falta decidir"}
                        {bc.status === "matched" && "¡Match!"}
                        {bc.status === "passed" && "Pasó"}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="border-b border-border-soft my-2" />
              </div>
            )}

            {/* Chats normales */}
            {loading && (
              <div className="text-center text-text-tertiary text-[11px] py-6">
                Cargando...
              </div>
            )}

            {!loading && filtered.length === 0 && blindChats.length === 0 && (
              <div className="text-center text-text-tertiary text-[11px] py-6 px-4">
                No tienes conversaciones todavía
              </div>
            )}

            {filtered.map((conv) => (
              <ChatListItem
                key={conv.match_id}
                conv={conv}
                active={selectedId === conv.match_id}
                onClick={() => setSelectedId(conv.match_id)}
              />
            ))}
          </div>
        </div>

        <div className="min-h-0">
          {selectedId ? (
            <ChatPanel matchId={selectedId} otherUser={otherUser} />
          ) : (
            <div className="h-full flex items-center justify-center bg-bg-surface border border-border rounded-2xl">
              <div className="text-center">
                <MessageCircle
                  size={32}
                  className="text-text-tertiary mx-auto mb-2"
                />
                <p className="text-[13px] text-text-secondary">
                  Selecciona una conversación
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ChatListItem({ conv, active, onClick }) {
  const time = conv.last_message_at
    ? new Date(conv.last_message_at).toLocaleTimeString("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 transition-colors text-left border-l-2 ${
        active
          ? "bg-bg-alt border-accent"
          : "border-transparent hover:bg-bg-alt/60"
      }`}
    >
      <div className="relative shrink-0">
        {conv.other_photo ? (
          <img
            src={conv.other_photo}
            alt={conv.other_name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[13px]">
            {conv.other_name?.[0] || "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-[13px] font-semibold text-text-primary truncate">
            {conv.other_name}
          </div>
          <div className="text-[10px] text-text-tertiary shrink-0 ml-2">
            {time}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-[11.5px] truncate ${
              conv.unread_count > 0
                ? "text-text-primary font-medium"
                : "text-text-secondary"
            }`}
          >
            {conv.last_message || "Di hola 👋"}
          </p>
          {conv.unread_count > 0 && (
            <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-text-primary text-bg text-[9px] font-semibold flex items-center justify-center shrink-0 ml-2">
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
