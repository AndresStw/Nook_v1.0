import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Check,
  X,
  Eye,
  Loader2,
  ArrowLeft,
  LogOut,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { supabase } from "../lib/supabase";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("verifications");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [piRunning, setPiRunning] = useState(false);
  const [piResult, setPiResult] = useState(null);

  const showToast = (message, type = "ok") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_verification_requests", {
      p_status: "pending",
    });
    if (error) {
      console.error(error);
      showToast("Error cargando solicitudes", "error");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    setProcessing(true);
    const { error } = await supabase.rpc("approve_verification", {
      p_request_id: requestId,
    });
    setProcessing(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Usuario verificado ✅", "ok");
    setSelected(null);
    loadRequests();
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      showToast("Escribe una razón", "error");
      return;
    }

    setProcessing(true);
    const { error } = await supabase.rpc("reject_verification", {
      p_request_id: requestId,
      p_reason: rejectReason.trim(),
    });
    setProcessing(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Solicitud rechazada", "ok");
    setSelected(null);
    setRejectReason("");
    loadRequests();
  };

  const handleCloseAdminSession = async () => {
    const token = sessionStorage.getItem("nook_admin_token");
    if (token) {
      await supabase.rpc("close_admin_session", { p_token: token });
    }
    sessionStorage.removeItem("nook_admin_token");
    navigate("/feed");
  };

  const handleRunPiCalculation = async () => {
    if (piRunning) return;
    if (
      !confirm(
        "¿Ejecutar el cálculo diario de PI para todos los usuarios activos?",
      )
    )
      return;

    setPiRunning(true);
    setPiResult(null);

    const { data, error } = await supabase.rpc("calculate_pi_daily");

    setPiRunning(false);

    if (error) {
      showToast("Error ejecutando cálculo: " + error.message, "error");
      return;
    }

    setPiResult(data);
    showToast(`✅ ${data.users_processed} usuarios actualizados`, "ok");
  };

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/feed")}
              className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center">
                <Shield size={16} className="text-error" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">
                  Panel del fundador
                </h1>
                <p className="text-[11px] text-text-tertiary">
                  Acceso root · {requests.length} verificaciones pendientes
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseAdminSession}
              className="flex items-center gap-1.5 text-[11px] text-error hover:bg-error/10 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={13} />
              Cerrar sesión admin
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border-soft">
            <button
              onClick={() => setTab("verifications")}
              className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
                tab === "verifications"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Shield size={13} />
              Verificaciones
              {requests.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error text-white">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("tools")}
              className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
                tab === "tools"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles size={13} />
              Herramientas
            </button>
          </div>

          {/* === TAB VERIFICACIONES === */}
          {tab === "verifications" && (
            <>
              {loading && (
                <div className="text-center py-12">
                  <Loader2
                    size={24}
                    className="animate-spin text-accent mx-auto"
                  />
                </div>
              )}

              {!loading && requests.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-[14px] font-bold text-text-primary mb-1">
                    Todo al día
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    No hay verificaciones pendientes
                  </p>
                </div>
              )}

              {!loading && requests.length > 0 && (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelected(req)}
                      className="w-full flex items-center gap-4 p-4 bg-bg-surface border border-border rounded-xl hover:border-accent/40 transition-colors text-left"
                    >
                      <img
                        src={req.selfie_url}
                        alt="Selfie"
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      {req.photos?.[0]?.url && (
                        <img
                          src={req.photos[0].url}
                          alt="Perfil"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-text-primary mb-0.5">
                          {req.name || "Sin nombre"}, {req.age}
                        </div>
                        <div className="text-[11px] text-text-tertiary mb-1">
                          📍 {req.city || "Sin ciudad"} · {req.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="px-2 py-0.5 bg-error/10 text-error rounded-full font-medium">
                            {req.report_count} reportes
                          </span>
                          <span className="px-2 py-0.5 bg-bg-alt text-text-tertiary rounded-full">
                            {req.pi} PI
                          </span>
                        </div>
                      </div>
                      <Eye size={16} className="text-text-tertiary shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* === TAB HERRAMIENTAS === */}
          {tab === "tools" && (
            <div className="space-y-4">
              <div className="bg-bg-surface border border-border rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-accent-hover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-text-primary mb-1">
                      Calcular PI diario
                    </h3>
                    <p className="text-[12px] text-text-secondary leading-relaxed">
                      Recalcula los PI de todos los usuarios activos basándose
                      en su actividad del día. En producción esto corre
                      automáticamente a las 3am. Mientras tanto, ejecútalo
                      manualmente cuando quieras.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRunPiCalculation}
                  disabled={piRunning}
                  className="w-full py-3 rounded-xl bg-accent text-bg font-semibold text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {piRunning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Ejecutar cálculo ahora
                    </>
                  )}
                </button>

                {piResult && (
                  <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                    <div className="text-[12px] font-semibold text-accent-hover mb-3">
                      ✅ Cálculo completado
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-[20px] font-bold text-text-primary">
                          {piResult.users_processed}
                        </div>
                        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
                          Usuarios
                        </div>
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-success">
                          +{piResult.pi_given}
                        </div>
                        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
                          PI dados
                        </div>
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-error">
                          -{piResult.pi_lost}
                        </div>
                        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
                          PI quitados
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-text-tertiary text-center mt-3">
                      Última ejecución:{" "}
                      {new Date(piResult.ran_at).toLocaleString("es-CO")}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-bg-surface border border-border rounded-xl p-6">
                <h3 className="text-[14px] font-bold text-text-primary mb-2">
                  ⚠️ Recordatorio
                </h3>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  Ejecuta esto <strong>1 vez al día</strong> idealmente en la
                  noche. Los usuarios verán sus PI actualizados la próxima vez
                  que abran la app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle verificación */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-1">
                    Verificar a {selected.name || "usuario"}
                  </h2>
                  <p className="text-[12px] text-text-secondary">
                    Compara la selfie con sus fotos de perfil
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">
                    Selfie de verificación
                  </div>
                  <img
                    src={selected.selfie_url}
                    alt="Selfie"
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">
                    Su foto principal
                  </div>
                  {selected.photos?.[0]?.url ? (
                    <img
                      src={selected.photos[0].url}
                      alt="Perfil"
                      className="w-full aspect-square object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-bg-alt rounded-2xl flex items-center justify-center text-text-tertiary text-[12px]">
                      Sin foto
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl mb-5">
                <div className="text-[10px] uppercase tracking-wider text-accent-hover font-semibold mb-1">
                  Seña que debía hacer
                </div>
                <div className="text-[13px] text-text-primary font-medium">
                  {selected.gesture_code}
                </div>
              </div>

              {selected.photos?.length > 1 && (
                <div className="mb-5">
                  <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">
                    Todas sus fotos
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p.url}
                        alt={`Foto ${i + 1}`}
                        className="aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2 block">
                  Razón (solo si rechazas)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: La seña no coincide..."
                  className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(selected.id)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-error/10 text-error font-semibold text-[13px] hover:bg-error/15 disabled:opacity-50"
                >
                  <X size={14} className="inline mr-1" />
                  Rechazar
                </button>
                <button
                  onClick={() => handleApprove(selected.id)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-accent text-bg font-semibold text-[13px] hover:opacity-90 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 size={14} className="inline animate-spin" />
                  ) : (
                    <Check size={14} className="inline mr-1" />
                  )}
                  Verificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-full font-semibold text-[12.5px] shadow-xl ${
            feedback.type === "ok" ? "bg-ink text-cream" : "bg-error text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </AppLayout>
  );
}
