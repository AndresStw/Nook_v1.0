import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
//prettier-ignore
import { ArrowLeft, Lock, Trash2, LogOut, FileText, Shield } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import LegalModal from "../components/legal/LegalModal";
import PrivacyContent from "../components/legal/PrivacyContent";
import TermsContent from "../components/legal/TermsContent";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [legalModal, setLegalModal] = useState(null);

  // Abrir modal desde query param (?legal=privacy o ?legal=terms)
  useEffect(() => {
    const param = searchParams.get("legal");
    if (param === "privacy" || param === "terms") {
      setLegalModal(param);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) alert("Error: " + error.message);
    else alert("Te enviamos un correo para cambiar tu contraseña.");
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "¿Eliminar tu cuenta? Esta acción es PERMANENTE y no se puede deshacer.\n\n" +
        "Se borrarán tu perfil, fotos, mensajes y todo tu historial. " +
        "Si quieres volver, tendrás que registrarte de nuevo desde cero.",
    );
    if (!confirmed) return;

    const finalConfirm = confirm("¿Estás completamente seguro?");
    if (!finalConfirm) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        alert("No hay sesión activa");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (error || data?.error) {
        alert("Error: " + (error?.message || data.error));
        return;
      }

      await signOut();
      alert(
        "Tu cuenta fue eliminada. Gracias por haber sido parte de Nook. 💚",
      );
      navigate("/");
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Algo salió mal. Contacta con soporte con el botón 🐛.");
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

            {/* Nuevos items legales */}
            <button
              onClick={() => setLegalModal("privacy")}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-bg-surface border border-border rounded-xl hover:bg-bg-alt transition-colors text-left"
            >
              <FileText size={16} className="text-text-secondary" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-primary">
                  Política de privacidad
                </div>
                <div className="text-[11px] text-text-secondary">
                  Lee y gana 300 PI
                </div>
              </div>
            </button>

            <button
              onClick={() => setLegalModal("terms")}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-bg-surface border border-border rounded-xl hover:bg-bg-alt transition-colors text-left"
            >
              <Shield size={16} className="text-text-secondary" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-primary">
                  Políticas y tratamiento de datos
                </div>
                <div className="text-[11px] text-text-secondary">
                  Lee y gana 300 PI
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

      <LegalModal
        open={legalModal === "privacy"}
        documentKey="privacy"
        title="Política de privacidad"
        onClose={() => setLegalModal(null)}
      >
        <PrivacyContent />
      </LegalModal>

      <LegalModal
        open={legalModal === "terms"}
        documentKey="terms"
        title="Políticas y tratamiento de datos"
        onClose={() => setLegalModal(null)}
      >
        <TermsContent />
      </LegalModal>
    </AppLayout>
  );
}
