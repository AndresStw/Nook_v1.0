export const REPORT_REASONS = [
  { id: "inappropriate", label: "Contenido inapropiado", emoji: "🚫" },
  { id: "spam", label: "Spam o publicidad", emoji: "📢" },
  { id: "harassment", label: "Acoso o grosería", emoji: "😠" },
  { id: "fake", label: "Foto falsa o robada", emoji: "👤" },
  { id: "other", label: "Otro motivo", emoji: "❓" },
];

// Fallback si no hay temporada activa
export const FALLBACK_SEASON = {
  slug: "halloween-2026",
  name: "Halloween 2026",
  emoji: "🎃",
  tagline: "Sube tu disfraz los viernes. Vota siempre.",
  post_day: 5,
  max_posts_per_day: 3,
  theme_config: { primary: "#FF7518", secondary: "#8B00FF" },
};
