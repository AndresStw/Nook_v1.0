import { Shield, Heart, Sparkles } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

export default function Step1Welcome({ onNext }) {
  return (
    <OnboardingLayout
      step={1}
      title="Bienvenido a Nook"
      subtitle="Antes de empezar, queremos contarte cómo funciona esto."
      onNext={onNext}
      canContinue={true}
      nextLabel="Vamos"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Heart size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Conexiones reales
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Aquí no se trata de deslizar. Se trata de conversar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Chispazos diarios
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Aleatoriamente te emparejamos con alguien para una cita a ciegas
              de 5 minutos.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Shield size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Tu seguridad primero
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Botón de pánico siempre visible. Reportes anónimos. Cero
              tolerancia al acoso.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-text-tertiary text-center italic mt-3">
          En los próximos pasos vas a completar tu perfil.
        </p>
      </div>
    </OnboardingLayout>
  );
}
