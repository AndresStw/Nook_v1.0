import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAILS = ["nook.admin.bogota@gmail.com"];

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = sessionStorage.getItem("nook_admin_token");
      if (!token) {
        setHasSession(false);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase.rpc("check_admin_session", {
        p_token: token,
      });

      if (error || !data) {
        sessionStorage.removeItem("nook_admin_token");
        setHasSession(false);
      } else {
        setHasSession(true);
      }
      setChecking(false);
    };

    if (!loading && user) check();
    else if (!loading) setChecking(false);
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary text-[13px]">Verificando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!ADMIN_EMAILS.includes(user.email) || profile?.role !== "founder") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-bg-surface border border-error/30 rounded-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-3">🚫</div>
          <h2 className="text-lg font-bold text-error mb-2">Acceso denegado</h2>
          <p className="text-[12px] text-text-secondary">
            Esta sección es privada.
          </p>
        </div>
      </div>
    );
  }

  if (!hasSession) return <Navigate to="/feed" replace />;

  return children;
}
