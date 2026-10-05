import { useState, useEffect } from "react";
import { useSound } from "../hooks/useSound";
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
  Flag,
  MessageCircle,
  AlertTriangle,
  Ban,
  Image as ImageIcon,
  Send,
  Bug,
  Lightbulb,
  Heart,
  Users,
  TrendingUp,
  Bell,
  Mail,
  Plus,
  Trash2,
  ShieldOff,
  Download, //Nuevo para el CVG de reportes
  BarChart3,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { supabase } from "../lib/supabase";
import { exportToCsv, buildFilename } from "../lib/exportCsv";
import MetricsPanel from "../components/admin/MetricsPanel";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("verifications");
  const [stats, setStats] = useState(null);
  const { play } = useSound();

  // Estados de verificación
  const [verifications, setVerifications] = useState([]);
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Estados de reportes
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportNotes, setReportNotes] = useState("");

  // Estados de mensajes al fundador
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [piToAward, setPiToAward] = useState(0);

  // Filtros de mensajes
  const [messageFilterCategory, setMessageFilterCategory] = useState("all");
  const [messageFilterStatus, setMessageFilterStatus] = useState("all");

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Estados de herramientas
  const [piRunning, setPiRunning] = useState(false);
  const [piResult, setPiResult] = useState(null);

  // Estados de banned_emails
  const [bannedEmails, setBannedEmails] = useState([]);
  const [showBanForm, setShowBanForm] = useState(false);
  const [newBanEmail, setNewBanEmail] = useState("");
  const [newBanReason, setNewBanReason] = useState("");

  const showToast = (message, type = "ok") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // ============================================
  // CARGA DE DATOS
  // ============================================
  const loadStats = async () => {
    const { data, error } = await supabase.rpc("get_admin_stats");
    if (!error && data) setStats(data);
  };

  const loadVerifications = async () => {
    const { data, error } = await supabase.rpc("get_verification_requests", {
      p_status: "pending",
    });
    if (error) {
      console.error(error);
      showToast("Error cargando verificaciones", "error");
    } else {
      setVerifications(data || []);
    }
  };

  const loadReports = async () => {
    const { data, error } = await supabase.rpc("get_reports", {
      p_status: "pending",
    });
    if (error) {
      console.error(error);
      showToast("Error cargando reportes", "error");
    } else {
      setReports(data || []);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase.rpc("get_founder_messages", {
      p_category: null,
    });
    if (error) {
      console.error(error);
      showToast("Error cargando mensajes", "error");
    } else {
      setMessages(data || []);
    }
  };

  const loadBannedEmails = async () => {
    const { data, error } = await supabase.rpc("get_banned_emails");
    if (error) {
      console.error(error);
      showToast("Error cargando emails bloqueados", "error");
    } else {
      setBannedEmails(data || []);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      loadVerifications(),
      loadReports(),
      loadMessages(),
      loadBannedEmails(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ============================================
  // HANDLERS — VERIFICACIONES
  // ============================================
  const handleApproveVerification = async (requestId) => {
    setProcessing(true);
    const { error } = await supabase.rpc("approve_verification", {
      p_request_id: requestId,
    });
    setProcessing(false);

    if (error) return showToast(error.message, "error");
    showToast("Usuario verificado ✅", "ok");
    setSelectedVerif(null);
    loadAll();
  };

  const handleRejectVerification = async (requestId) => {
    if (!rejectReason.trim()) return showToast("Escribe una razón", "error");

    setProcessing(true);
    const { error } = await supabase.rpc("reject_verification", {
      p_request_id: requestId,
      p_reason: rejectReason.trim(),
    });
    setProcessing(false);

    if (error) return showToast(error.message, "error");
    showToast("Solicitud rechazada", "ok");
    setSelectedVerif(null);
    setRejectReason("");
    loadAll();
  };

  // ============================================
  // HANDLERS — REPORTES
  // ============================================
  const handleResolveReport = async (reportId, decision) => {
    setProcessing(true);
    const { data, error } = await supabase.rpc("resolve_report", {
      p_report_id: reportId,
      p_decision: decision,
      p_notes: reportNotes.trim() || null,
    });
    setProcessing(false);

    if (error) return showToast(error.message, "error");

    let msg = "";
    if (decision === "banned") {
      msg = "Usuario baneado 🚫";
    } else if (decision === "warned") {
      msg = `Advertencia enviada · ${data.hearts_left} corazones restantes ⚠️`;
    } else {
      msg = "Reporte descartado";
    }

    showToast(msg, "ok");
    play("warning");
    setSelectedReport(null);
    setReportNotes("");
    loadAll();
  };

  // ============================================
  // HANDLERS — MENSAJES
  // ============================================
  const handleMarkRead = async (messageId) => {
    await supabase.rpc("mark_founder_message_read", {
      p_message_id: messageId,
    });
    loadMessages();
  };

  const handleReplyMessage = async (messageId) => {
    if (!replyText.trim()) return showToast("Escribe una respuesta", "error");

    setProcessing(true);
    const { error } = await supabase.rpc("reply_founder_message", {
      p_message_id: messageId,
      p_reply: replyText.trim(),
      p_pi_awarded: piToAward,
    });
    setProcessing(false);

    if (error) return showToast(error.message, "error");
    showToast(
      `Respuesta enviada ${piToAward > 0 ? `(+${piToAward} PI)` : ""}`,
      "ok",
    );
    // Sonido de recompensa si se otorgaron PI
    if (piToAward > 0) {
      play("pi_reward");
    }
    setSelectedMessage(null);
    setReplyText("");
    setPiToAward(0);
    loadMessages();
  };

  // ============================================
  // HANDLERS — HERRAMIENTAS
  // ============================================
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

    if (error) return showToast("Error: " + error.message, "error");
    setPiResult(data);
    showToast(`✅ ${data.users_processed} usuarios actualizados`, "ok");
  };

  // ============================================
  // HANDLERS — EMAILS BLOQUEADOS
  // ============================================
  const handleBanEmail = async () => {
    if (!newBanEmail.trim()) return showToast("Escribe un email", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newBanEmail.trim())) {
      return showToast("Email inválido", "error");
    }

    setProcessing(true);
    const { data, error } = await supabase.rpc("ban_email", {
      p_email: newBanEmail.trim().toLowerCase(),
      p_reason: newBanReason.trim() || null,
    });
    setProcessing(false);

    if (error || data?.error) {
      return showToast(error?.message || data.error, "error");
    }

    showToast(`Email bloqueado: ${newBanEmail}`, "ok");
    setNewBanEmail("");
    setNewBanReason("");
    setShowBanForm(false);
    loadBannedEmails();
  };

  const handleUnbanEmail = async (email) => {
    if (!confirm(`¿Desbloquear ${email}?`)) return;

    setProcessing(true);
    const { error } = await supabase.rpc("unban_email", { p_email: email });
    setProcessing(false);

    if (error) return showToast(error.message, "error");
    showToast("Email desbloqueado", "ok");
    loadBannedEmails();
  };

  // ============================================
  // HANDLERS — EXPORTAR MENSAJES
  // ============================================
  const filteredMessages = messages.filter((m) => {
    if (
      messageFilterCategory !== "all" &&
      m.category !== messageFilterCategory
    ) {
      return false;
    }
    if (messageFilterStatus === "unread" && m.read_at) return false;
    if (messageFilterStatus === "read" && !m.read_at) return false;
    if (messageFilterStatus === "replied" && !m.replied_at) return false;
    if (messageFilterStatus === "pending" && m.replied_at) return false;
    return true;
  });

  const handleExportMessages = () => {
    if (filteredMessages.length === 0) {
      showToast("No hay mensajes para exportar", "error");
      return;
    }

    try {
      const categorySuffix =
        messageFilterCategory === "all" ? "" : messageFilterCategory;
      const filename = buildFilename("nook-mensajes", categorySuffix);

      exportToCsv(filename, filteredMessages, [
        { label: "ID", getValue: (m) => m.id },
        {
          label: "Fecha",
          getValue: (m) => new Date(m.created_at).toLocaleString("es-CO"),
        },
        { label: "Categoría", getValue: (m) => m.category },
        { label: "Usuario", getValue: (m) => m.user_name || "Anónimo" },
        { label: "Ciudad", getValue: (m) => m.user_city || "" },
        { label: "Mensaje", getValue: (m) => m.content || "" },
        { label: "Leído", getValue: (m) => (m.read_at ? "Sí" : "No") },
        { label: "Respondido", getValue: (m) => (m.replied_at ? "Sí" : "No") },
        { label: "Respuesta", getValue: (m) => m.reply_content || "" },
        { label: "PI otorgados", getValue: (m) => m.pi_awarded || 0 },
        { label: "URL", getValue: (m) => m.context_data?.url || "" },
        { label: "Ruta", getValue: (m) => m.context_data?.pathname || "" },
        {
          label: "Pantalla",
          getValue: (m) =>
            m.context_data?.viewport
              ? `${m.context_data.viewport.width}x${m.context_data.viewport.height}`
              : "",
        },
        {
          label: "Navegador",
          getValue: (m) => m.context_data?.userAgent || "",
        },
        { label: "Idioma", getValue: (m) => m.context_data?.language || "" },
      ]);

      showToast(`Exportados ${filteredMessages.length} mensajes`, "ok");
    } catch (err) {
      console.error("Error exportando:", err);
      showToast("Error al exportar: " + err.message, "error");
    }
  };

  const handleCloseAdminSession = async () => {
    const token = sessionStorage.getItem("nook_admin_token");
    if (token) await supabase.rpc("close_admin_session", { p_token: token });
    sessionStorage.removeItem("nook_admin_token");
    navigate("/feed");
  };

  // Helper: ícono por categoría
  const categoryIcon = (cat) => {
    const icons = {
      bug: Bug,
      idea: Lightbulb,
      queja: AlertTriangle,
      saludo: MessageCircle,
      gracias: Heart,
      amor: Heart,
    };
    const Icon = icons[cat] || MessageCircle;
    return <Icon size={12} />;
  };

  const categoryColor = (cat) => {
    const colors = {
      bug: "#DC2626",
      idea: "#D9A017",
      queja: "#A855F7",
      saludo: "#14E5C0",
      gracias: "#14E5C0",
      amor: "#E879B9",
    };
    return colors[cat] || "#8FA8A2";
  };

  const unreadCount = messages.filter((m) => !m.read_at).length;

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
                  Acceso root · {stats?.total_users || 0} usuarios totales
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

          {/* Stats rápidos */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
              <StatCard
                icon={Users}
                label="Usuarios"
                value={stats.total_users}
                color="accent"
              />
              <StatCard
                icon={TrendingUp}
                label="Activos 7d"
                value={stats.active_7d}
                color="success"
              />
              <StatCard
                icon={Flag}
                label="Reportes"
                value={stats.reports_pending}
                color="error"
              />
              <StatCard
                icon={Shield}
                label="Verificaciones"
                value={stats.verifications_pending}
                color="accent"
              />
              <StatCard
                icon={Bell}
                label="Mensajes nuevos"
                value={stats.founder_messages_unread}
                color="warning"
              />
              <StatCard
                icon={Ban}
                label="Baneados"
                value={stats.banned}
                color="error"
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border-soft overflow-x-auto">
            <TabButton
              active={tab === "verifications"}
              onClick={() => setTab("verifications")}
              icon={Shield}
              label="Verificaciones"
              badge={verifications.length}
              badgeColor="error"
            />
            <TabButton
              active={tab === "reports"}
              onClick={() => setTab("reports")}
              icon={Flag}
              label="Reportes"
              badge={reports.length}
              badgeColor="error"
            />
            <TabButton
              active={tab === "messages"}
              onClick={() => setTab("messages")}
              icon={MessageCircle}
              label="Mensajes"
              badge={unreadCount}
              badgeColor="accent"
            />
            <TabButton
              active={tab === "banned_emails"}
              onClick={() => setTab("banned_emails")}
              icon={ShieldOff}
              label="Emails bloqueados"
              badge={bannedEmails.length}
              badgeColor="error"
            />
            <TabButton
              active={tab === "tools"}
              onClick={() => setTab("tools")}
              icon={Sparkles}
              label="Herramientas"
            />
            <TabButton
              active={tab === "metrics"}
              onClick={() => setTab("metrics")}
              icon={BarChart3}
              label="Métricas"
            />
          </div>

          {loading && (
            <div className="text-center py-12">
              <Loader2 size={24} className="animate-spin text-accent mx-auto" />
            </div>
          )}

          {/* === TAB VERIFICACIONES === */}
          {!loading && tab === "verifications" && (
            <>
              {verifications.length === 0 ? (
                <EmptyState
                  icon="🎉"
                  title="Todo al día"
                  subtitle="No hay verificaciones pendientes"
                />
              ) : (
                <div className="space-y-3">
                  {verifications.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedVerif(req)}
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

          {/* === TAB REPORTES === */}
          {!loading && tab === "reports" && (
            <>
              {reports.length === 0 ? (
                <EmptyState
                  icon="✨"
                  title="Sin reportes"
                  subtitle="Nadie ha reportado a otros usuarios"
                />
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className="w-full flex items-start gap-4 p-4 bg-bg-surface border border-error/20 rounded-xl hover:border-error/40 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                        <Flag size={16} className="text-error" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-text-primary mb-1">
                          Reporte contra {rep.reported_name || "Usuario"}
                        </div>
                        <div className="text-[11px] text-text-secondary mb-2 line-clamp-2">
                          <strong>Razón:</strong> {rep.reason}
                          {rep.context && ` · ${rep.context}`}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] flex-wrap">
                          <span className="px-2 py-0.5 bg-bg-alt text-text-tertiary rounded-full">
                            Por: {rep.reporter_name || "Anónimo"}
                          </span>
                          <span className="px-2 py-0.5 bg-bg-alt text-text-tertiary rounded-full">
                            {new Date(rep.created_at).toLocaleDateString(
                              "es-CO",
                            )}
                          </span>
                        </div>
                      </div>
                      <Eye
                        size={16}
                        className="text-text-tertiary shrink-0 mt-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* === TAB MENSAJES === */}
          {!loading && tab === "messages" && (
            <>
              {/* Barra de filtros y export */}
              {messages.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <select
                    value={messageFilterCategory}
                    onChange={(e) => setMessageFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-bg-surface border border-border rounded-lg text-[12px] text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="bug">🐛 Bugs</option>
                    <option value="idea">💡 Ideas</option>
                    <option value="queja">⚠️ Quejas</option>
                    <option value="saludo">👋 Saludos</option>
                    <option value="gracias">💚 Gracias</option>
                    <option value="amor">💕 Amor</option>
                  </select>

                  <select
                    value={messageFilterStatus}
                    onChange={(e) => setMessageFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-bg-surface border border-border rounded-lg text-[12px] text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="unread">Sin leer</option>
                    <option value="pending">Sin responder</option>
                    <option value="replied">Respondidos</option>
                  </select>

                  <span className="text-[11px] text-text-tertiary">
                    {filteredMessages.length} de {messages.length}
                  </span>

                  <button
                    onClick={handleExportMessages}
                    disabled={filteredMessages.length === 0}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-bg text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={13} />
                    Exportar CSV
                  </button>
                </div>
              )}

              {filteredMessages.length === 0 && messages.length > 0 ? (
                <EmptyState
                  icon="🔍"
                  title="Sin mensajes con esos filtros"
                  subtitle="Prueba cambiando los filtros de arriba"
                />
              ) : messages.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="Sin mensajes"
                  subtitle="Todavía nadie te ha escrito"
                />
              ) : (
                <div className="space-y-2">
                  {filteredMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border transition-colors text-left ${
                        msg.read_at
                          ? "bg-bg-surface border-border"
                          : "bg-accent/5 border-accent/30"
                      } hover:border-accent/40`}
                    >
                      {msg.user_photo ? (
                        <img
                          src={msg.user_photo}
                          alt={msg.user_name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-bg-alt flex items-center justify-center text-text-tertiary text-[14px] shrink-0">
                          {msg.user_name?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              background: `${categoryColor(msg.category)}20`,
                              color: categoryColor(msg.category),
                            }}
                          >
                            {categoryIcon(msg.category)}
                            {msg.category}
                          </span>
                          <span className="text-[11px] font-semibold text-text-primary truncate">
                            {msg.user_name}
                          </span>
                          {!msg.read_at && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                          )}
                          {msg.replied_at && (
                            <span className="text-[9px] font-medium text-success shrink-0">
                              ✓ Respondido
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-text-secondary line-clamp-2 leading-snug">
                          {msg.content}
                        </p>
                        <div className="text-[10px] text-text-tertiary mt-1">
                          {new Date(msg.created_at).toLocaleString("es-CO")}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {/* === TAB EMAILS BLOQUEADOS === */}
          {!loading && tab === "banned_emails" && (
            <div className="space-y-4">
              {/* Header con botón de agregar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">
                    Emails bloqueados
                  </h3>
                  <p className="text-[11.5px] text-text-secondary mt-0.5">
                    Los usuarios con estos emails no podrán registrarse de nuevo
                  </p>
                </div>
                <button
                  onClick={() => setShowBanForm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Bloquear email
                </button>
              </div>

              {/* Lista */}
              {bannedEmails.length === 0 ? (
                <EmptyState
                  icon="🛡️"
                  title="Sin emails bloqueados"
                  subtitle="Todos los emails pueden registrarse"
                />
              ) : (
                <div className="space-y-2">
                  {bannedEmails.map((item) => (
                    <div
                      key={item.email}
                      className="flex items-center gap-3 p-3.5 bg-bg-surface border border-error/20 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                        <Mail size={16} className="text-error" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-text-primary truncate">
                          {item.email}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">
                          {item.reason || "Sin razón especificada"}
                        </div>
                        <div className="text-[10px] text-text-tertiary mt-1 flex items-center gap-2 flex-wrap">
                          <span>
                            🚫{" "}
                            {new Date(item.banned_at).toLocaleDateString(
                              "es-CO",
                            )}
                          </span>
                          {item.banned_by_name && (
                            <span>· por {item.banned_by_name}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnbanEmail(item.email)}
                        disabled={processing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-alt text-text-primary text-[11.5px] font-medium hover:bg-border transition-colors disabled:opacity-50 shrink-0"
                        title="Desbloquear"
                      >
                        <Trash2 size={12} />
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === TAB HERRAMIENTAS === */}
          {!loading && tab === "tools" && (
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
                      Recalcula los PI de todos los usuarios activos. En
                      producción corre a las 3am. Mientras tanto, ejecútalo
                      manualmente.
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
                        <div className="text-[10px] text-text-tertiary uppercase">
                          Usuarios
                        </div>
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-success">
                          +{piResult.pi_given}
                        </div>
                        <div className="text-[10px] text-text-tertiary uppercase">
                          PI dados
                        </div>
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-error">
                          -{piResult.pi_lost}
                        </div>
                        <div className="text-[10px] text-text-tertiary uppercase">
                          PI quitados
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === TAB MÉTRICAS === */}
          {!loading && tab === "metrics" && (
            <div className="bg-bg-surface border border-border rounded-2xl p-6">
              <MetricsPanel />
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL DE VERIFICACIÓN */}
      {/* ============================================ */}
      {selectedVerif && (
        <Modal
          onClose={() => setSelectedVerif(null)}
          title={`Verificar a ${selectedVerif.name || "usuario"}`}
          subtitle="Compara la selfie con sus fotos de perfil"
        >
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <Label>Selfie de verificación</Label>
              <img
                src={selectedVerif.selfie_url}
                alt="Selfie"
                className="w-full aspect-square object-cover rounded-2xl"
              />
            </div>
            <div>
              <Label>Su foto principal</Label>
              {selectedVerif.photos?.[0]?.url ? (
                <img
                  src={selectedVerif.photos[0].url}
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
            <Label>Seña que debía hacer</Label>
            <div className="text-[13px] text-text-primary font-medium">
              {selectedVerif.gesture_code}
            </div>
          </div>

          <div className="mb-4">
            <Label>Razón (solo si rechazas)</Label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: La seña no coincide..."
              className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleRejectVerification(selectedVerif.id)}
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-error/10 text-error font-semibold text-[13px] hover:bg-error/15 disabled:opacity-50"
            >
              <X size={14} className="inline mr-1" />
              Rechazar
            </button>
            <button
              onClick={() => handleApproveVerification(selectedVerif.id)}
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
        </Modal>
      )}

      {/* ============================================ */}
      {/* MODAL DE REPORTE */}
      {/* ============================================ */}
      {selectedReport && (
        <Modal
          onClose={() => setSelectedReport(null)}
          title={`Reporte contra ${selectedReport.reported_name || "usuario"}`}
          subtitle={`Reportado por ${selectedReport.reporter_name || "Alguien"} · ${new Date(selectedReport.created_at).toLocaleString("es-CO")}`}
        >
          <div className="p-4 bg-error/5 border border-error/20 rounded-xl mb-5">
            <Label>Razón del reporte</Label>
            <div className="text-[14px] text-text-primary font-semibold mb-2">
              {selectedReport.reason}
            </div>
            {selectedReport.context && (
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {selectedReport.context}
              </p>
            )}
          </div>

          {selectedReport.reported_photos?.length > 0 && (
            <div className="mb-5">
              <Label>Fotos del reportado</Label>
              <div className="grid grid-cols-3 gap-2">
                {selectedReport.reported_photos.map((p, i) => (
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

          <div className="grid grid-cols-2 gap-3 mb-5 text-[12px]">
            <div className="p-3 bg-bg-alt rounded-lg">
              <div className="text-text-tertiary text-[10px] uppercase mb-1">
                PI actual
              </div>
              <div className="font-bold text-text-primary">
                {selectedReport.reported_pi}
              </div>
            </div>
            <div className="p-3 bg-bg-alt rounded-lg">
              <div className="text-text-tertiary text-[10px] uppercase mb-1">
                Corazones
              </div>
              <div className="font-bold text-text-primary">
                {selectedReport.reported_hearts}/3
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label>Notas internas (opcional)</Label>
            <input
              type="text"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Ej: Ya van 3 reportes del mismo usuario..."
              className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                handleResolveReport(selectedReport.id, "dismissed")
              }
              disabled={processing}
              className="py-3 rounded-xl bg-bg-alt text-text-primary font-semibold text-[12.5px] hover:bg-border disabled:opacity-50"
              title="El reporte es falso o injusto"
            >
              <X size={13} className="inline mr-1" />
              Descartar
            </button>
            <button
              onClick={() => handleResolveReport(selectedReport.id, "warned")}
              disabled={processing}
              className="py-3 rounded-xl bg-amber-500/15 text-amber-700 font-semibold text-[12.5px] hover:bg-amber-500/25 disabled:opacity-50"
              title="−1 corazón + mensaje de advertencia"
            >
              <AlertTriangle size={13} className="inline mr-1" />
              Advertir
            </button>
            <button
              onClick={() => handleResolveReport(selectedReport.id, "banned")}
              disabled={processing}
              className="py-3 rounded-xl bg-error text-white font-semibold text-[12.5px] hover:opacity-90 disabled:opacity-50"
              title="Banear al usuario permanentemente"
            >
              {processing ? (
                <Loader2 size={13} className="inline animate-spin" />
              ) : (
                <Ban size={13} className="inline mr-1" />
              )}
              Banear
            </button>
          </div>
        </Modal>
      )}

      {/* ============================================ */}
      {/* MODAL DE MENSAJE AL FUNDADOR */}
      {/* ============================================ */}
      {selectedMessage && (
        <Modal
          onClose={() => setSelectedMessage(null)}
          title={`Mensaje de ${selectedMessage.user_name || "usuario"}`}
          subtitle={`${selectedMessage.user_city || "Sin ciudad"} · ${new Date(selectedMessage.created_at).toLocaleString("es-CO")}`}
        >
          {/* Categoría */}
          <div className="mb-4">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              style={{
                background: `${categoryColor(selectedMessage.category)}20`,
                color: categoryColor(selectedMessage.category),
              }}
            >
              {categoryIcon(selectedMessage.category)}
              {selectedMessage.category.toUpperCase()}
            </span>
          </div>

          {/* Contenido */}
          <div className="p-4 bg-bg-alt border border-border rounded-xl mb-4">
            <p className="text-[13.5px] text-text-primary leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </p>
          </div>

          {/* Contexto (URL, navegador) */}
          {selectedMessage.context_data && (
            <details className="mb-4">
              <summary className="text-[11px] text-text-tertiary cursor-pointer hover:text-text-primary mb-2">
                Ver contexto técnico (URL, navegador, pantalla)
              </summary>
              <div className="p-3 bg-bg-alt rounded-lg text-[10.5px] text-text-secondary font-mono space-y-1">
                <div>
                  <strong>URL:</strong>{" "}
                  {selectedMessage.context_data.url || "N/A"}
                </div>
                <div>
                  <strong>Ruta:</strong>{" "}
                  {selectedMessage.context_data.pathname || "N/A"}
                </div>
                <div>
                  <strong>Pantalla:</strong>{" "}
                  {selectedMessage.context_data.viewport?.width || "?"} ×{" "}
                  {selectedMessage.context_data.viewport?.height || "?"}
                </div>
                <div>
                  <strong>Navegador:</strong>{" "}
                  {selectedMessage.context_data.userAgent?.slice(0, 80) ||
                    "N/A"}
                  ...
                </div>
                <div>
                  <strong>Idioma:</strong>{" "}
                  {selectedMessage.context_data.language || "N/A"}
                </div>
              </div>
            </details>
          )}

          {/* Si ya fue respondido */}
          {selectedMessage.replied_at ? (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl mb-4">
              <Label>
                Tu respuesta (
                {new Date(selectedMessage.replied_at).toLocaleDateString(
                  "es-CO",
                )}
                )
              </Label>
              <p className="text-[12.5px] text-text-primary leading-relaxed">
                {selectedMessage.reply_content}
              </p>
              {selectedMessage.pi_awarded > 0 && (
                <div className="text-[11px] text-accent-hover font-medium mt-2">
                  + {selectedMessage.pi_awarded} PI otorgados
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Respuesta */}
              <div className="mb-4">
                <Label>Tu respuesta</Label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Gracias por avisar, ya lo reviso..."
                  className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* PI a otorgar */}
              <div className="mb-4">
                <Label>PI de recompensa (opcional)</Label>
                <div className="flex gap-2">
                  {[0, 5, 10, 20].map((pi) => (
                    <button
                      key={pi}
                      type="button"
                      onClick={() => setPiToAward(pi)}
                      className={`flex-1 py-2 rounded-lg border text-[12px] font-medium transition-colors ${
                        piToAward === pi
                          ? "bg-accent text-bg border-accent font-semibold"
                          : "bg-bg-alt border-border text-text-primary hover:border-accent/40"
                      }`}
                    >
                      {pi === 0 ? "Ninguno" : `+${pi} PI`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleMarkRead(selectedMessage.id)}
                  className="flex-1 py-3 rounded-xl bg-bg-alt text-text-primary font-semibold text-[13px] hover:bg-border"
                >
                  Marcar leído
                </button>
                <button
                  onClick={() => handleReplyMessage(selectedMessage.id)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-accent text-bg font-semibold text-[13px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Responder
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ============================================ */}
      {/* MODAL — BLOQUEAR EMAIL */}
      {/* ============================================ */}
      {showBanForm && (
        <Modal
          onClose={() => {
            setShowBanForm(false);
            setNewBanEmail("");
            setNewBanReason("");
          }}
          title="Bloquear email"
          subtitle="Este email no podrá registrarse en Nook"
        >
          <div className="mb-4">
            <Label>Email a bloquear</Label>
            <input
              type="email"
              value={newBanEmail}
              onChange={(e) => setNewBanEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              autoFocus
              className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="mb-5">
            <Label>Razón (opcional)</Label>
            <input
              type="text"
              value={newBanReason}
              onChange={(e) => setNewBanReason(e.target.value)}
              placeholder="Ej: Bot detectado, spam, reincidente..."
              className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="p-3 bg-error/5 border border-error/20 rounded-xl mb-5">
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              ⚠️ Si este email ya está registrado, el bloqueo solo aplicará si
              el usuario borra su cuenta. Los usuarios existentes no serán
              expulsados automáticamente.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowBanForm(false);
                setNewBanEmail("");
                setNewBanReason("");
              }}
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-bg-alt text-text-primary font-semibold text-[13px] hover:bg-border disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleBanEmail}
              disabled={processing || !newBanEmail.trim()}
              className="flex-1 py-3 rounded-xl bg-error text-white font-semibold text-[13px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Ban size={14} />
              )}
              Bloquear
            </button>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {feedback && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-300 px-5 py-3 rounded-full font-semibold text-[12.5px] shadow-xl ${
            feedback.type === "ok" ? "bg-ink text-cream" : "bg-error text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </AppLayout>
  );
}

// ============================================
// Sub-componentes
// ============================================

function StatCard({ icon: Icon, label, value, color = "accent" }) {
  const colors = {
    accent: "text-accent-hover bg-accent/10",
    error: "text-error bg-error/10",
    success: "text-success bg-success/10",
    warning: "text-amber-600 bg-amber-100",
  };
  return (
    <div className="p-3 bg-bg-surface border border-border rounded-xl">
      <div
        className={`w-7 h-7 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon size={13} />
      </div>
      <div className="text-[18px] font-bold text-text-primary leading-tight">
        {value}
      </div>
      <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
  badgeColor = "error",
}) {
  const badgeColors = {
    error: "bg-error text-white",
    accent: "bg-accent text-bg",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
        active
          ? "border-text-primary text-text-primary"
          : "border-transparent text-text-secondary hover:text-text-primary"
      }`}
    >
      <Icon size={13} />
      {label}
      {badge > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${badgeColors[badgeColor]}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-[14px] font-bold text-text-primary mb-1">{title}</p>
      <p className="text-[12px] text-text-secondary">{subtitle}</p>
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold mb-2">
      {children}
    </div>
  );
}

function Modal({ children, onClose, title, subtitle }) {
  return (
    <div
      className="fixed inset-0 z-200 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] text-text-secondary">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
