import { Sparkles, Star, Crown } from "lucide-react";

const TIERS = [
  {
    min: 10000,
    key: "legend",
    label: "Legendario",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.15)",
    icon: Crown,
  },
  {
    min: 2000,
    key: "vip",
    label: "VIP",
    color: "#D9A017",
    bg: "rgba(217,160,23,0.15)",
    icon: Star,
  },
  {
    min: 500,
    key: "active",
    label: "Activo",
    color: "#14E5C0",
    bg: "rgba(20,229,192,0.15)",
    icon: Sparkles,
  },
  {
    min: 0,
    key: "rookie",
    label: "Nuevo",
    color: "#8FA8A2",
    bg: "rgba(143,168,162,0.15)",
    icon: Sparkles,
  },
];

function getTier(pi) {
  return TIERS.find((t) => pi >= t.min) || TIERS[TIERS.length - 1];
}

function formatPi(pi) {
  if (pi >= 10000) return `${(pi / 1000).toFixed(1)}k`;
  if (pi >= 1000) return `${(pi / 1000).toFixed(1)}k`;
  return pi.toString();
}

export default function PiBadge({ pi = 0, size = "md", variant = "solid" }) {
  const tier = getTier(pi);
  const Icon = tier.icon;

  const sizes = {
    xs: { padding: "3px 7px", font: "10px", icon: 9, gap: 3 },
    sm: { padding: "4px 9px", font: "11px", icon: 10, gap: 4 },
    md: { padding: "5px 11px", font: "12px", icon: 11, gap: 5 },
    lg: { padding: "7px 14px", font: "13px", icon: 13, gap: 6 },
  };
  const s = sizes[size] || sizes.md;

  const isOverlay = variant === "overlay";

  return (
    <span
      title={`${pi.toLocaleString("es-CO")} PI · ${tier.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        padding: s.padding,
        borderRadius: "999px",
        fontSize: s.font,
        fontWeight: 700,
        color: isOverlay ? "white" : tier.color,
        background: isOverlay ? "rgba(0,0,0,0.55)" : tier.bg,
        backdropFilter: isOverlay ? "blur(8px)" : "none",
        WebkitBackdropFilter: isOverlay ? "blur(8px)" : "none",
        border: isOverlay ? "1px solid rgba(255,255,255,0.15)" : "none",
        lineHeight: 1,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      <Icon size={s.icon} strokeWidth={2.5} />
      {formatPi(pi)} PI
    </span>
  );
}
