// src/components/onboarding/Step1Welcome.jsx
import { Shield, MessageCircle, Sparkles, Eye } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

export default function Step1Welcome({ onNext }) {
  return (
    <OnboardingLayout
      step={1}
      title="Bienvenido a Nook"
      subtitle="Esto no es un swipe más. Aquí primero hablas, luego decides."
      onNext={onNext}
      canContinue={true}
      nextLabel="Vamos"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/8 border border-accent/25">
          <Eye size={18} className="text-accent-hover shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Aquí las fotos se esconden
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              No vas a ver caras hasta que ambos se elijan. Sin el filtro de la
              primera impresión.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <MessageCircle size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Conoces por lo que dicen
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Lo único visible de cada persona son sus respuestas y sus
              intereses. Ahí está la conexión real.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Citas a ciegas sin límite
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              En el Feed tienes 15 swipes al día. Pero las Citas a Ciegas no
              tienen tope: puedes hablar con quien quieras, todas las veces.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt border border-border-soft">
          <Shield size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-0.5">
              Seguridad primero
            </div>
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Botón de pánico siempre visible. Reportes anónimos. Cero
              tolerancia al acoso.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-text-tertiary text-center italic mt-3">
          En los próximos pasos vas a completar tu perfil. Tómate tu tiempo con
          las respuestas — son tu foto.
        </p>
      </div>
    </OnboardingLayout>
  );
}
