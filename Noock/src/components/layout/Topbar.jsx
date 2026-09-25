import {
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

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

export default function TopBar({ user }) {
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const menuRef = useRef(null);

  // Cargar foto principal del usuario
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

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setShowThemes(false);
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Render del avatar con estados
  const renderAvatar = () => {
    // 1. Foto cargada
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={profile?.name || "Yo"}
          className="topbar__avatar"
        />
      );
    }

    // 2. Cargando
    if (avatarLoading) {
      return <div className="topbar__avatar topbar__avatar--skeleton" />;
    }

    // 3. Sin foto: inicial del nombre
    if (profile?.name) {
      return (
        <div className="topbar__avatar topbar__avatar--placeholder">
          {profile.name[0].toUpperCase()}
        </div>
      );
    }

    // 4. Fallback
    return <div className="topbar__avatar topbar__avatar--skeleton" />;
  };

  return (
    <header className="topbar">
      <form onSubmit={handleSubmit} className="topbar__search">
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
        <button className="topbar__icon-btn" title="Notificaciones">
          <Bell size={17} strokeWidth={1.8} />
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
                <div className="topbar__dropdown-email">{user?.email}</div>
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
  );
}
