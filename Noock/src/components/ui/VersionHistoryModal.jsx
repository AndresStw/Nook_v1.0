// src/components/ui/VersionHistoryModal.jsx
//prettier-ignore
import { X, Plus, TrendingUp, Wrench, AlertTriangle, Sparkles,} from "lucide-react";
import { CHANGELOG, CURRENT_VERSION } from "../../lib/changelog";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

//funcion
const SECTION_CONFIG = {
  added: {
    icon: Plus,
    label: "Nuevo",
    color: "#0FC7A6",
    bg: "rgba(20, 229, 192, 0.10)",
  },

  improved: {
    icon: TrendingUp,
    label: "Mejorado",
    color: "#3B82F6",
    bg: "rgba(96, 165, 250, 0.10)",
  },

  fixed: {
    icon: Wrench,
    label: "Arreglado",
    color: "#16A34A",
    bg: "rgba(74, 222, 128, 0.12)",
  },
};

//Componente
export default function VersionHistoryModal({ open, onClose }) {
  if (!open) return null;

  //Hook#1
  useEffect(() => {
    if (!open) return;
    supabase
      .rpc("claim_discovery", { p_discovery_key: "view_changelog" })
      .then(({ data, error }) => {
        if (!error && data?.success) {
          window.dispatchEvent(
            new CustomEvent("nook:discovery", {
              detail: { key: "view_changelog", pi: data.pi_earned },
            }),
          );
        }
      });
  }, [open]);

  return (
    <div
      className="fixed inset-0 z-250 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border-soft shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center">
              <Sparkles size={20} className="text-accent-hover" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-text-primary leading-tight">
                Historial de versiones
              </h2>
              <p className="text-[11.5px] text-text-tertiary mt-0.5">
                Estás en{" "}
                <span className="font-bold text-accent-hover">
                  v{CURRENT_VERSION}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {CHANGELOG.map((release, idx) => {
            const isCurrent = release.version === CURRENT_VERSION;
            return (
              <article
                key={release.version}
                className={`relative pb-6 ${
                  idx < CHANGELOG.length - 1
                    ? "border-b border-border-soft"
                    : ""
                }`}
              >
                {/* Línea de tiempo (círculo + línea vertical) */}
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        isCurrent
                          ? "bg-accent border-accent"
                          : "bg-bg-surface border-border"
                      }`}
                    />
                    {idx < CHANGELOG.length - 1 && (
                      <div className="w-px flex-1 bg-border-soft mt-1" />
                    )}
                  </div>

                  {/* Contenido de la versión */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[15px] font-bold text-text-primary leading-tight">
                        v{release.version}
                      </h3>
                      {release.label && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-bg">
                          {release.label}
                        </span>
                      )}
                      <span className="text-[10.5px] text-text-tertiary ml-auto">
                        {new Date(release.date).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-[13px] font-semibold text-text-primary mb-1">
                      {release.title}
                    </div>
                    {release.summary && (
                      <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
                        {release.summary}
                      </p>
                    )}

                    {/* Secciones: added / improved / fixed */}
                    <div className="space-y-3">
                      {["added", "improved", "fixed"].map((key) => {
                        const items = release[key];
                        if (!items || items.length === 0) return null;
                        const cfg = SECTION_CONFIG[key];
                        const Icon = cfg.icon;
                        return (
                          <div key={key}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                <Icon size={11} strokeWidth={2.5} />
                              </div>
                              <span
                                className="text-[10.5px] font-bold uppercase tracking-wider"
                                style={{ color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            <ul className="space-y-1 ml-1">
                              {items.map((item, i) => (
                                <li
                                  key={i}
                                  className="text-[12.5px] text-text-primary leading-snug flex gap-2"
                                >
                                  <span
                                    className="shrink-0 mt-1.5 w-1 h-1 rounded-full"
                                    style={{ background: cfg.color }}
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      {/* Bugs conocidos */}
                      {release.knownBugs && release.knownBugs.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-100 text-amber-700">
                              <AlertTriangle size={11} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700">
                              Bugs conocidos
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {release.knownBugs.map((bug, i) => (
                              <li
                                key={i}
                                className="text-[12px] text-text-primary leading-snug flex gap-2"
                              >
                                <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-amber-500" />
                                <span>{bug}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10.5px] text-amber-700/80 mt-2 italic">
                            ¿Encontraste uno? Repórtalo con el botón 🐛
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Cierre */}
          <div className="text-center pt-2 pb-1">
            <p className="text-[11px] text-text-tertiary">
              Nook se construye todos los días. Gracias por estar aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
