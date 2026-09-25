import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Trash2, LogOut } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) alert("Error: " + error.message);
    else alert("Te enviamos un correo para cambiar tu contraseña.");
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "¿Eliminar tu cuenta? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    // Nota: eliminar auth.users requiere una Edge Function con service_role.
    // Por ahora solo marcamos el perfil como eliminado.
    const { error } = await supabase
      .from("users")
      .update({ banned: true })
      .eq("id", user.id);

    if (error) alert("Error: " + error.message);
    else {
      await signOut();
      navigate("/");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto pb-6">
          <button
            onClick={() => navigate("/me")}
            className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Volver al perfil
          </button>

          <h1 className="text-xl font-bold text-text-primary mb-5">Ajustes</h1>

          <div className="space-y-3">
            <button
              onClick={handlePasswordReset}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-bg-surface border border-border rounded-xl hover:bg-bg-alt transition-colors text-left"
            >
              <Lock size={16} className="text-text-secondary" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-primary">
                  Cambiar contraseña
                </div>
                <div className="text-[11px] text-text-secondary">
                  Te enviaremos un correo con el enlace
                </div>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-bg-surface border border-border rounded-xl hover:bg-bg-alt transition-colors text-left"
            >
              <LogOut size={16} className="text-text-secondary" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-primary">
                  Cerrar sesión
                </div>
                <div className="text-[11px] text-text-secondary">
                  Salir de tu cuenta en este dispositivo
                </div>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-bg-surface border border-error/30 rounded-xl hover:bg-error/5 transition-colors text-left"
            >
              <Trash2 size={16} className="text-error" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-error">
                  Eliminar cuenta
                </div>
                <div className="text-[11px] text-text-secondary">
                  Esta acción no se puede deshacer
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
