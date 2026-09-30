import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Heart, MessageCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSound } from "../../hooks/useSound";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import Logo from "../ui/Logo";
import LogoutAnimation from "../auth/LogoutAnimation";

//Componente
export default function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const { play } = useSound();
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const navItems = [
    { to: "/feed", icon: Home, label: "Inicio" },
    { to: "/explore", icon: Search, label: "Explorar" },
    { to: "/connections", icon: Heart, label: "Conexiones" },
    {
      to: "/messages",
      icon: MessageCircle,
      label: "Mensajes",
      badge: unreadCount,
    },
    { to: "/me", icon: User, label: "Perfil" },
  ];

  const handleLogout = () => {
    play("logout");
    setShowLogoutAnim(true);
  };

  const handleLogoutComplete = async () => {
    await signOut();
    navigate("/login");
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
    <aside className="w-[200px] shrink-0 bg-bg-surface border-r border-border flex flex-col justify-between p-4 h-screen">
      <div>
        <div className="mb-6 text-accent">
          <Logo size={28} />
        </div>

        <nav className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-[13px] font-medium ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-alt hover:text-text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {badge > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-accent text-bg text-[10px] flex items-center justify-center font-semibold px-1">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <p className="text-[10px] text-text-secondary leading-relaxed mb-4">
          Aquí no se trata de deslizar,
          <br />
          se trata de conectar.
        </p>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[11px] text-text-tertiary hover:text-error transition-colors mb-3"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>

        <div className="pt-3 border-t border-border-soft">
          <div className="flex items-center justify-between">
            <div className="text-accent">
              <Logo size={17} />
            </div>
            <div className="text-[8px] leading-tight text-text-tertiary text-right">
              <div>Conexiones reales.</div>
              <div>Personas reales.</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
