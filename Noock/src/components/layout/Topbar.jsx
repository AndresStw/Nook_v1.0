import {
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Settings,
  User,
  Shield,
  Volume2,
  VolumeX,
  Bug,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import Logo from "../ui/Logo";
import AdminGateModal from "../admin/AdminGateModal";
import { useSound } from "../../hooks/useSound";
import { useNotifications } from "../../hooks/useNotifications";
import LogoutAnimation from "../auth/LogoutAnimation";
import ReportBugButton from "../ui/ReportBugButton";

const THEMES = [
  { id: "menta", name: "Menta", color: "#14E5C0" },
  { id: "ambar", name: "Ámbar", color: "#E89B3C" },
  { id: "violeta", name: "Violeta", color: "#A855F7" },
  { id: "coral", name: "Coral", color: "#F26B5E" },
  { id: "azul", name: "Azul hielo", color: "#3FBFB0" },
  { id: "dorado", name: "Dorado", color: "#D9A017" },
  { id: "rosa", name: "Rosa suave", color: "#E879B9" },
  { id: "default", name: "Default", color: "#173D38" },
];

const ADMIN_EMAILS = ["nook.admin.bogota@gmail.com"];

//Componente
export default function TopBar() {
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const { signOut, profile, user: authUser } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const menuRef = useRef(null);
  const { muted, toggleMute, play } = useSound();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const isAdmin =
    authUser?.email &&
    ADMIN_EMAILS.includes(authUser.email) &&
    profile?.role === "founder";
  const [bugOpen, setBugOpen] = useState(false);

  //Hook #1
  // Cargar avatar
  useEffect(() => {
    if (!profile?.id) return;
    setAvatarLoading(true);
    supabase
      .from("photos")
      .select("url")
      .eq("user_id", profile.id)
      .eq("position", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.url) setAvatarUrl(data.url);
        setAvatarLoading(false);
      });
  }, [profile?.id]);

  //Hook #2
  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setShowThemes(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  const handleSignOut = () => {
    play("logout");
    setShowLogoutAnim(true);
  };

  const handleLogoutComplete = async () => {
    await signOut();
    navigate("/login");
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt="Yo" className="topbar__avatar" />;
    }
    if (avatarLoading) {
      return <div className="topbar__avatar topbar__avatar--skeleton" />;
    }
    if (profile?.name) {
      return (
        <div className="topbar__avatar topbar__avatar--placeholder">
          {profile.name[0].toUpperCase()}
        </div>
      );
    }
    return <div className="topbar__avatar topbar__avatar--skeleton" />;
  };

  if (showLogoutAnim) {
    return (
      <LogoutAnimation
        userName={profile?.name?.split(" ")[0] || ""}
        onComplete={handleLogoutComplete}
      />
    );
  }

  return (
    <>
      <header className="topbar">
        {/* Logo solo en mobile */}
        <Link to="/feed" className="md:hidden shrink-0">
          <Logo size={26} />
        </Link>

        {/* Buscador solo en desktop */}
        <form
          onSubmit={handleSubmit}
          className="topbar__search hidden md:block"
        >
          <Search size={15} className="topbar__search-icon" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar personas, intereses, ciudades..."
            className="topbar__search-input"
          />
        </form>

        <div className="topbar__actions">
          <button
            onClick={() => navigate("/search")}
            className="topbar__icon-btn md:hidden"
            aria-label="Buscar"
          >
            <Search size={17} strokeWidth={1.8} />
          </button>
          {/* Campana de notificaciones  */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="topbar__icon-btn"
              title="Notificaciones"
            >
              <Bell size={17} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] max-h-[480px] bg-bg-surface border border-border rounded-2xl shadow-elevated overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft shrink-0">
                  <div className="text-[13px] font-bold text-text-primary">
                    Notificaciones
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10.5px] text-accent-hover font-medium hover:underline"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <div className="text-3xl mb-2">🔔</div>
                      <div className="text-[12px] text-text-secondary">
                        No tienes notificaciones
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-border-soft hover:bg-bg-alt transition-colors ${
                          n.read_at ? "" : "bg-accent/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                            {n.type === "report_warning" && <span>⚠️</span>}
                            {n.type === "verification" && <span>✅</span>}
                            {n.type === "info" && <span>ℹ️</span>}
                            {n.type === "congrats" && <span>🎉</span>}
                            {n.type === "system" && <span>📢</span>}
                            {n.type === "founder_reply" && <span>💬</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-semibold text-text-primary mb-0.5 leading-snug">
                              {n.title}
                            </div>
                            <div className="text-[11.5px] text-text-secondary leading-snug line-clamp-3">
                              {n.content}
                            </div>
                            <div className="text-[10px] text-text-tertiary mt-1">
                              {new Date(n.created_at).toLocaleString("es-CO", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {!n.read_at && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleMute}
            className="topbar__icon-btn"
            title={muted ? "Activar sonidos" : "Silenciar"}
          >
            {muted ? (
              <VolumeX size={17} strokeWidth={1.8} />
            ) : (
              <Volume2 size={17} strokeWidth={1.8} />
            )}
          </button>

          <div className="topbar__avatar-wrap" ref={menuRef}>
            <button
              className="topbar__avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {renderAvatar()}
              <ChevronDown
                size={14}
                className={`topbar__chevron ${menuOpen ? "topbar__chevron--open" : ""}`}
              />
            </button>

            {menuOpen && !showThemes && (
              <div className="topbar__dropdown">
                <div className="topbar__dropdown-header">
                  <div className="topbar__dropdown-name">
                    {profile?.name || "Usuario"}
                  </div>
                  <div className="topbar__dropdown-email">
                    {authUser?.email}
                  </div>
                </div>

                <button
                  className="topbar__dropdown-item"
                  onClick={() => {
                    navigate("/me");
                    setMenuOpen(false);
                  }}
                >
                  <User size={14} /> Mi perfil
                </button>

                <button
                  className="topbar__dropdown-item"
                  onClick={() => setShowThemes(true)}
                >
                  <span
                    className="topbar__dropdown-color"
                    style={{
                      background:
                        THEMES.find((t) => t.id === currentTheme)?.color ||
                        "#14E5C0",
                    }}
                  />
                  Color de la app
                  <ChevronDown size={12} className="ml-auto -rotate-90" />
                </button>

                <button
                  className="topbar__dropdown-item"
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                >
                  <Settings size={14} /> Ajustes
                </button>

                <button
                  className="topbar__dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setBugOpen(true);
                  }}
                >
                  <Bug size={14} /> Reportar un problema
                </button>

                {/* Admin - solo para el founder */}
                {isAdmin && (
                  <>
                    <div className="topbar__dropdown-divider" />
                    <button
                      className="topbar__dropdown-item topbar__dropdown-item--admin"
                      onClick={() => {
                        setMenuOpen(false);
                        setAdminModalOpen(true);
                      }}
                    >
                      <Shield size={14} />
                      Administrador
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-error/15 text-error">
                        ROOT
                      </span>
                    </button>
                  </>
                )}

                <div className="topbar__dropdown-divider" />

                <button
                  className="topbar__dropdown-item topbar__dropdown-item--danger"
                  onClick={handleSignOut}
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}

            {menuOpen && showThemes && (
              <div className="topbar__dropdown">
                <button
                  className="topbar__dropdown-back"
                  onClick={() => setShowThemes(false)}
                >
                  <ChevronDown size={14} className="rotate-90" />
                  Atrás
                </button>

                <div className="topbar__dropdown-title">Color de la app</div>

                <div className="topbar__themes">
                  {THEMES.map((t) => {
                    const selected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        className={`topbar__theme ${selected ? "topbar__theme--active" : ""}`}
                        onClick={() => setTheme(t.id)}
                        title={t.name}
                      >
                        <span
                          className="topbar__theme-dot"
                          style={{ background: t.color }}
                        />
                        <span className="topbar__theme-name">{t.name}</span>
                        {selected && <Check size={11} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <AdminGateModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Modal de reporte controlado desde el TopBar */}
      <ReportBugButton open={bugOpen} onClose={() => setBugOpen(false)} />
    </>
  );
}
