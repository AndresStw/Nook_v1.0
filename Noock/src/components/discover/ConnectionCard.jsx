import { Plane, Music, Film } from 'lucide-react'

export default function ConnectionCard({ match, onSendMessage, onKeepExploring }) {
  if (!match) return null

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-soft flex flex-col items-center justify-center text-center h-full overflow-hidden">
      {/* Círculos Venn */}
      <div className="relative w-20 h-20 mb-5 shrink-0">
        {/* Círculo izquierdo — acento con opacidad */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/25 border border-accent" />
        
        {/* Círculo derecho — acento sólido */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/80" />
        
        {/* Corazón en la intersección */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="text-bg drop-shadow-md relative z-10"
          >
            <path
              d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-1.5 shrink-0">
        ¡Hay conexión!
      </h3>

      <p className="text-[12.5px] text-text-secondary leading-snug mb-5 max-w-[210px] shrink-0">
        Ambos sienten lo mismo. Ahora, la mejor parte: conocerse de verdad.
      </p>

      <div className="w-full space-y-2 mb-5 shrink-0">
        <button
          onClick={onSendMessage}
          className="w-full py-2.5 bg-accent text-bg rounded-lg font-medium text-[13px] hover:opacity-90 transition-opacity"
        >
          Enviar mensaje
        </button>
        <button
          onClick={onKeepExploring}
          className="w-full py-2.5 bg-transparent border border-text-primary text-text-primary rounded-lg font-medium text-[13px] hover:bg-bg-alt transition-colors"
        >
          Seguir conociendo
        </button>
      </div>

      <div className="w-full text-left mb-4 shrink-0">
        <h4 className="text-[9px] font-semibold text-text-primary mb-1.5 uppercase tracking-wider">
          Intereses en común
        </h4>
        <div className="flex flex-wrap gap-1">
          <Tag icon={Plane} label="Viajes" />
          <Tag icon={Music} label="Música" />
          <Tag icon={Film} label="Cine" />
        </div>
      </div>

      <p className="text-[10px] text-text-tertiary shrink-0">
        La conexión no es casualidad. <span className="text-accent">♥</span>
      </p>
    </div>
  )
}

function Tag({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-bg-alt border border-border rounded-full text-text-secondary">
      <Icon size={10} strokeWidth={1.8} />
      {label}
    </span>
  )
}