import { useState } from "react";
import {
  Bug,
  X,
  Send,
  Check,
  Loader2,
  AlertCircle,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const CATEGORIES = [
  {
    id: "bug",
    label: "Algo se rompió",
    description: "Un error, pantalla en blanco, algo no funciona",
    icon: Bug,
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.08)",
  },
  {
    id: "idea",
    label: "Tengo una idea",
    description: "Algo que podría mejorar Nook",
    icon: Lightbulb,
    color: "#D9A017",
    bg: "rgba(217, 160, 23, 0.08)",
  },
  {
    id: "queja",
    label: "Algo me incomodó",
    description: "Un usuario, un texto, algo que no me gustó",
    icon: AlertCircle,
    color: "#A855F7",
    bg: "rgba(168, 85, 247, 0.08)",
  },
];

export default function ReportBugButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setCategory(null);
    setContent("");
    setError(null);
    setSent(false);
  };

  const handleClose = () => {
    if (sending) return;
    setOpen(false);
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!category) {
      setError("Elige una categoría");
      return;
    }
    if (content.trim().length < 5) {
      setError("Cuéntanos un poco más (mínimo 5 letras)");
      return;
    }

    setSending(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("No autenticado");
      setSending(false);
      return;
    }

    // Contexto auto-capturado
    const contextData = {
      url: window.location.href,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language,
      timestamp: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("founder_messages")
      .insert({
        from_user: user.id,
        category,
        content: content.trim(),
        context_data: contextData,
      });

    if (insertError) {
      console.error("Error enviando reporte:", insertError);
      setError("No pudimos enviar tu mensaje. Intenta de nuevo.");
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className="report-bug-btn"
        title="Reportar un bug o idea"
        aria-label="Reportar"
      >
        <Bug size={20} strokeWidth={2.2} />
      </button>

      {/* Modal */}
      {open && (
        <div className="report-bug-overlay" onClick={handleClose}>
          <div
            className="report-bug-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              // Estado de éxito
              <div className="report-bug-success">
                <div className="report-bug-success__icon">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h2>¡Gracias!</h2>
                <p>Tu mensaje llegó al fundador. Lo va a revisar pronto.</p>
                <button onClick={handleClose} className="report-bug-close-btn">
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="report-bug-header">
                  <div>
                    <h2 className="report-bug-title">
                      <MessageCircle size={18} />
                      Habla con el fundador
                    </h2>
                    <p className="report-bug-subtitle">
                      Cuéntanos lo que piensas. Se envía directo a Kevin.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="report-bug-x"
                    aria-label="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Categorías */}
                <div className="report-bug-categories">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const selected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`report-bug-cat ${selected ? "report-bug-cat--active" : ""}`}
                        style={{
                          borderColor: selected
                            ? cat.color
                            : "var(--color-border)",
                          background: selected ? cat.bg : "transparent",
                        }}
                      >
                        <div
                          className="report-bug-cat__icon"
                          style={{
                            background: cat.bg,
                            color: cat.color,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="report-bug-cat__text">
                          <div className="report-bug-cat__label">
                            {cat.label}
                          </div>
                          <div className="report-bug-cat__desc">
                            {cat.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Textarea */}
                <div className="report-bug-field">
                  <label className="report-bug-label">
                    Cuéntanos qué pasó
                    <span className="report-bug-counter">
                      {content.length}/500
                    </span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder={
                      category === "bug"
                        ? "Ej: le di like a alguien y me sacó al login..."
                        : category === "idea"
                          ? "Ej: podrían agregar un modo de filtros por ciudad..."
                          : "Ej: alguien me escribió algo incómodo..."
                    }
                    className="report-bug-textarea"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="report-bug-error">
                    <AlertCircle size={12} />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={sending || !category || content.trim().length < 5}
                  className="report-bug-submit"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Enviar al fundador
                    </>
                  )}
                </button>

                <p className="report-bug-hint">
                  Adjuntamos automáticamente la URL y tu navegador para que el
                  fundador pueda reproducir el bug.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
