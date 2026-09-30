import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import BottomNav from "./BottomNav";

export default function AppLayout({ children, user }) {
  return (
    <>
      {/* Aviso landscape móvil */}
      <div className="nook-landscape-warning">
        <div className="text-4xl mb-3">📱</div>
        <div className="text-[15px] font-bold text-text-primary mb-2">
          Gira tu teléfono
        </div>
        <div className="text-[12px] text-text-secondary max-w-xs">
          Nook se ve mejor en vertical. Rota tu dispositivo para continuar.
        </div>
      </div>

      <div className="h-dvh w-screen bg-bg flex overflow-hidden nook-app-content">
        {/* Sidebar solo en desktop */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar user={user} />

          {/* Padding bottom en móvil para que la bottom nav no tape contenido */}
          <main
            className="flex-1 min-h-0 overflow-hidden px-3 md:px-5 md:pb-4"
            style={{
              paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            }}
          >
            <div className="w-full h-full">{children}</div>
          </main>
        </div>

        {/* Bottom nav solo en móvil */}
        <BottomNav />
      </div>
    </>
  );
}
