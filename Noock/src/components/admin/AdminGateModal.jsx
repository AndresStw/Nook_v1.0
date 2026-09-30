import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, X, Loader2, Lock, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

//Componente
export default function AdminGateModal({ open, onClose }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc(
      "verify_admin_password",
      { p_password: password },
    );

    setLoading(false);

    if (rpcError || !data?.success) {
      setError(data?.error || rpcError?.message || "Contraseña incorrecta");
      setPassword("");
      return;
    }

    sessionStorage.setItem("nook_admin_token", data.token);
    setPassword("");
    setError(null);
    onClose();
    navigate("/admin-nook-kevin-2026");
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
              <Shield size={22} className="text-error" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Acceso restringido
              </h2>
              <p className="text-[11px] text-text-tertiary">
                Solo el equipo de soporte puede entrar aquí
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="text-[11px] font-semibold text-text-primary mb-2 block">
            Contraseña de administrador
          </label>
          <div className="relative mb-3">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••••••••••"
              className="w-full pl-10 pr-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11.5px] text-error bg-error/10 border border-error/20 rounded-lg p-2.5 mb-3">
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-xl bg-error text-white font-semibold text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield size={14} />
                Entrar al panel
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-text-tertiary text-center mt-4 leading-relaxed">
          La sesión dura 2 horas. Después te pedirá la contraseña de nuevo.
        </p>
      </div>
    </div>
  );
}
