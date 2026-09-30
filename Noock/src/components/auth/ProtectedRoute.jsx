import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfileCompletion } from "../../hooks/useProfileCompletion";
import { hasActiveEscape } from "../../lib/profileCompletion";

//Componente
export default function ProtectedRoute({
  children,
  requireOnboarding = true,
  requireVerification = true,
  requireCompleteProfile = false, //  Bloquea si < 75% (con escape de 24h)
}) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Solo cargar completitud cuando se necesita
  const { isComplete, loading: completionLoading } = useProfileCompletion(
    user?.id,
    profile?.onboarding_completed,
    profile?.role === "founder",
  );

  // 1. Cargando auth
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary text-[13px]">Cargando...</div>
      </div>
    );
  }

  // 2. Sin sesión → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Email no verificado → verify-email
  if (
    requireVerification &&
    !user.email_confirmed_at &&
    location.pathname !== "/verify-email"
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  // 4. Sin perfil (trigger falló)
  if (!profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md text-center">
          <h2 className="text-[15px] font-bold text-text-primary mb-2">
            Perfil no encontrado
          </h2>
          <p className="text-[12px] text-text-secondary mb-4">
            Hubo un problema creando tu perfil. Contacta al fundador.
          </p>
        </div>
      </div>
    );
  }

  // 5. Sin onboarding → onboarding
  if (requireOnboarding && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // 6. Perfil incompleto (< 75%)  bloquear con escape
  if (
    requireCompleteProfile &&
    profile.onboarding_completed &&
    profile.role !== "founder" && // founder nunca se bloquea
    completionLoading
  ) {
    // Mostrar spinner mientras calcula (evita flash de contenido)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary text-[13px]">Cargando...</div>
      </div>
    );
  }

  if (
    requireCompleteProfile &&
    profile.onboarding_completed &&
    profile.role !== "founder" &&
    !isComplete &&
    !hasActiveEscape() &&
    location.pathname !== "/me"
  ) {
    return <Navigate to="/me?blocked=1" replace />;
  }

  return children;
}
