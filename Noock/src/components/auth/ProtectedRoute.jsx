import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary text-[13px]">Cargando...</div>
      </div>
    );
  }

  // Sin sesión → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sesión pero sin perfil → algo falló en el trigger
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

  // Sesión con perfil pero sin onboarding → onboarding
  if (requireOnboarding && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
