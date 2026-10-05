//Solo manejo una funcion acas
import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { REPORT_REASONS } from "../../lib/halloween";

//Componente
export default function EventReportModal({ open, postId, onClose, onSuccess }) {
  const [reason, setReason] = useState(null);
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  //Funcion para manejar el envio del reporte
  const handleSubmit = async () => {
    if (!reason) {
      setError("Elige un motivo");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("report_event_post", {
      p_post_id: postId,
      p_reason: reason,
      p_context: context.trim() || null,
    });

    setSubmitting(false);

    if (rpcError || data?.error) {
      setError(rpcError?.message || data?.error || "Error al reportar");
      return;
    }

    onSuccess?.(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-text-primary">
              Reportar publicación
            </h2>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Tu reporte es anónimo
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setReason(r.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center gap-3 ${
                  reason === r.id
                    ? "border-error bg-error/5"
                    : "border-border hover:bg-bg-alt"
                }`}
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="text-[12.5px] font-medium text-text-primary">
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
              Cuéntanos más (opcional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 300))}
              rows={2}
              placeholder="¿Qué pasó?"
              className="w-full px-3.5 py-2.5 bg-bg-alt border border-border rounded-xl text-[12.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-error/10 border border-error/20 text-[11.5px] text-error flex items-center gap-2">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="w-full py-3 rounded-xl bg-error text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Enviar reporte"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
