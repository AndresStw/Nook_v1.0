import { NavLink } from "react-router-dom";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";// iconos
import { useUnreadCount } from "../../hooks/useUnreadCount";

//Componente
export default function BottomNav() {
  const unreadCount = useUnreadCount();
  const navItems = [
    { to: "/feed", icon: Home, label: "Inicio" },
    { to: "/explore", icon: Search, label: "Explorar" },
    { to: "/connections", icon: Heart, label: "Conexiones" },
    { to: "/messages", icon: MessageCircle, label: "Mensajes", badge: unreadCount, },
    { to: "/me", icon: User, label: "Perfil" },
  ];

  //md:hidden es para moviles si nbo tiene el md es para web
  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
              isActive ? "text-accent" : "text-text-secondary"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-error text-white text-[8px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
