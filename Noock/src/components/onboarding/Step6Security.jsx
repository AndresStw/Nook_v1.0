import { Shield, AlertCircle } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'

export default function Step6Security({ onNext, onBack }) {
  return (
    <OnboardingLayout
      step={6}
      title="Tu Botón de Pánico"
      subtitle="Es el botón más importante de Nook. Memorízalo."
      onBack={onBack}
      onNext={onNext}
      canContinue={true}
      nextLabel="Entendido"
    >
      <div className="flex justify-center mb-5">
        <div className="relative">
          <svg viewBox="0 0 40 40" width="72" height="72">
            <polygon
              points="12,2 28,2 38,12 38,28 28,38 12,38 2,28 2,12"
              fill="#DC2626"
              stroke="white"
              strokeWidth="3"
            />
            <text
              x="20"
              y="26"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              !
            </text>
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Shield size={16} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[12.5px] font-semibold text-text-primary mb-0.5">
              Aparece en cada perfil y chat
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Arriba a la derecha, siempre visible. Un toque y estás a salvo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
          <div>
            <div className="text-[12.5px] font-semibold text-text-primary mb-0.5">
              Sin preguntas. Sin esperas.
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Un toque y bloqueas a la persona. Nunca sabrá que fuiste tú.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-accent/8 border border-accent/20 text-center">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Nook nunca te va a juzgar.</strong>
            <br />
            Si algo se siente mal, úsalo.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}