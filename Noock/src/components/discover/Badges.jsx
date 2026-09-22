import { CheckCircle2, Crown, Sparkles, Circle } from 'lucide-react'

const BADGE_DEFS = {
  founder: {
    icon: Crown,
    tooltip: 'Fundador',
    special: true, // ← activa la animación
  },
  verified: {
    icon: CheckCircle2,
    tooltip: 'Alguien real detrás de esta foto.',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  new: {
    icon: Sparkles,
    tooltip: 'Recién llegó a Nook.',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
  active: {
    icon: Circle,
    tooltip: 'Anda por aquí seguido.',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
}

export default function Badges({ profile }) {
  if (!profile) return null

  const badges = profile.badges || []
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((key) => {
        const b = BADGE_DEFS[key]
        if (!b) return null
        const Icon = b.icon

        // Insignia especial (fundador) con animación
        if (b.special) {
          return (
            <div
              key={key}
              title={b.tooltip}
              className="founder-crown founder-ring relative w-8 h-8 rounded-full flex items-center justify-center cursor-help text-amber-900 transition-transform hover:scale-110"
            >
              <Icon size={14} strokeWidth={2.5} />
            </div>
          )
        }

        // Insignias normales
        return (
          <div
            key={key}
            title={b.tooltip}
            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-help ${b.bg} ${b.color} transition-transform hover:scale-110`}
          >
            <Icon size={13} />
          </div>
        )
      })}
    </div>
  )
}