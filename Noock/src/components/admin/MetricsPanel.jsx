// src/components/admin/MetricsPanel.jsx
import { useState, useEffect } from "react";
//prettier-ignore
import { Users, MessageCircle, PartyPopper, TrendingUp, RefreshCw, 
Loader2, Activity, AlertCircle, Target } from "lucide-react";
import { supabase } from "../../lib/supabase";

//Componente
export default function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("get_admin_metrics"); //DB Confirmada

    if (rpcError) {
      setError(rpcError.message);
      setMetrics(null);
    } else if (data?.error) {
      setError(data.error);
      setMetrics(null);
    } else {
      setMetrics(data);
    }
    setLoading(false);
  };

  //Hook#1
  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 size={22} className="animate-spin text-accent mx-auto" />
        <p className="text-[12px] text-text-tertiary mt-2">
          Calculando métricas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={28} className="text-error mx-auto mb-2" />
        <p className="text-[13px] font-semibold text-text-primary mb-1">
          No pudimos cargar las métricas
        </p>
        <p className="text-[11.5px] text-text-secondary mb-3">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-accent text-bg text-[12px] font-semibold hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-5">
      {/* Header + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary">
            Métricas de crecimiento
          </h3>
          <p className="text-[11.5px] text-text-secondary mt-0.5">
            Calculado en tiempo real desde la base de datos
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-alt text-text-primary text-[11.5px] font-medium hover:bg-border transition-colors"
        >
          <RefreshCw size={12} />
          Refrescar
        </button>
      </div>

      {/* KPI principales: Retención + Conversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RetentionCard data={metrics.retention_d1} />
        <ConversionCard data={metrics.conversion} />
      </div>

      {/* Participación en eventos */}
      <EventCard data={metrics.events} />

      {/* Actividad general */}
      <ActivityCard data={metrics.totals} />
    </div>
  );
}

/* ============================================
   Tarjetas
============================================ */

function RetentionCard({ data }) {
  const pct = data.percent;
  const target = 40; // meta razonable D1
  const reached = pct >= target;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <TrendingUp size={15} className="text-accent-hover" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-primary">
            Retención D1
          </div>
          <div className="text-[10px] text-text-tertiary">
            Usuarios que vuelven al día siguiente
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div
          className="text-4xl font-bold leading-none tabular-nums"
          style={{
            color: reached
              ? "var(--color-accent)"
              : "var(--color-text-primary)",
          }}
        >
          {pct}%
        </div>
        <div className="text-[11px] text-text-tertiary pb-1">
          {data.returned} de {data.base} volvieron
        </div>
      </div>

      {/* Barra con meta */}
      <div className="relative">
        <div className="h-2 bg-bg-alt rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: reached
                ? "var(--color-accent)"
                : "var(--color-warning)",
            }}
          />
        </div>
        {/* Marca de meta */}
        <div
          className="absolute top-0 bottom-0 w-px bg-text-tertiary"
          style={{ left: `${target}%` }}
          title={`Meta: ${target}%`}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-text-tertiary">0%</span>
        <span className="text-[10px] text-text-tertiary">Meta: {target}%</span>
        <span className="text-[10px] text-text-tertiary">100%</span>
      </div>

      {data.base === 0 && (
        <p className="text-[10.5px] text-text-tertiary italic mt-3">
          Sin datos suficientes. Necesitas usuarios registrados hace 24-48h.
        </p>
      )}
    </div>
  );
}

function ConversionCard({ data }) {
  const pct = data.percent;
  const target = 50;
  const reached = pct >= target;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <MessageCircle size={15} className="text-accent-hover" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-primary">
            Conversión a primer mensaje
          </div>
          <div className="text-[10px] text-text-tertiary">
            Usuarios que enviaron al menos 1 mensaje
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div
          className="text-4xl font-bold leading-none tabular-nums"
          style={{
            color: reached
              ? "var(--color-accent)"
              : "var(--color-text-primary)",
          }}
        >
          {pct}%
        </div>
        <div className="text-[11px] text-text-tertiary pb-1">
          {data.users_with_message} con mensaje Â· {data.users_never_messaged}{" "}
          sin mensaje
        </div>
      </div>

      <div className="relative">
        <div className="h-2 bg-bg-alt rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: reached
                ? "var(--color-accent)"
                : "var(--color-warning)",
            }}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-px bg-text-tertiary"
          style={{ left: `${target}%` }}
          title={`Meta: ${target}%`}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-text-tertiary">0%</span>
        <span className="text-[10px] text-text-tertiary">Meta: {target}%</span>
        <span className="text-[10px] text-text-tertiary">100%</span>
      </div>
    </div>
  );
}

function EventCard({ data }) {
  const participants = data.active_participants;
  const posts = data.total_posts;
  const hasData = participants > 0 || posts > 0;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <PartyPopper size={15} className="text-amber-700" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-primary">
            Participación en evento activo
          </div>
          <div className="text-[10px] text-text-tertiary">
            Temporada en curso Â· posts aprobados y en revisión
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-bg-alt rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
              Participantes únicos
            </div>
            <div className="text-2xl font-bold text-text-primary tabular-nums">
              {participants}
            </div>
          </div>
          <div className="p-3 bg-bg-alt rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
              Total posts
            </div>
            <div className="text-2xl font-bold text-text-primary tabular-nums">
              {posts}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl mb-1">🎃</div>
          <p className="text-[11.5px] text-text-tertiary">
            Nadie ha participado todavía en el evento activo.
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ data }) {
  const max = Math.max(data.users, 1);

  const rows = [
    { label: "Activos hoy", value: data.active_today, icon: Activity },
    { label: "Activos 7 días", value: data.active_7d, icon: Activity },
    { label: "Activos 30 días", value: data.active_30d, icon: Activity },
    { label: "Total usuarios", value: data.users, icon: Users },
  ];

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <Activity size={15} className="text-accent-hover" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-primary">
            Actividad de la comunidad
          </div>
          <div className="text-[10px] text-text-tertiary">
            Distribución de usuarios activos
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {rows.map((row) => (
          <ActivityRow
            key={row.label}
            label={row.label}
            value={row.value}
            max={max}
          />
        ))}
      </div>

      {/* Nuevos registros */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-soft">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <Target size={15} className="text-accent-hover" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary">
              Nuevos hoy
            </div>
            <div className="text-[18px] font-bold text-text-primary leading-tight tabular-nums">
              +{data.new_today}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <Target size={15} className="text-accent-hover" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary">
              Nuevos 7 días
            </div>
            <div className="text-[18px] font-bold text-text-primary leading-tight tabular-nums">
              +{data.new_7d}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ label, value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-[11.5px] text-text-secondary shrink-0">
        {label}
      </div>
      <div className="flex-1 h-2 bg-bg-alt rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <div className="w-12 text-right text-[12.5px] font-bold text-text-primary tabular-nums shrink-0">
        {value}
      </div>
    </div>
  );
}
