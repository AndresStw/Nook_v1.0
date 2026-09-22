import { ArrowLeft } from "lucide-react";
import Logo from "../ui/Logo";
import WallOfVoices from "../ui/WallOfVoices";
import Stepper from "./Stepper";
import "../../assets/Css/landing.css";
import "../../assets/Css/login.css";
import "../../assets/Css/onboarding.css";

export default function OnboardingLayout({
  step,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  canContinue,
  nextLabel = "Continuar",
  loading = false,
}) {
  return (
    <main className="nook-auth nook-auth--onboarding">
  <WallOfVoices />

      <div className="nook-onboarding">
        {/* Header */}
        <div className="nook-onboarding__header">
          {onBack ? (
            <button
              onClick={onBack}
              className="nook-auth__back"
              style={{ position: "static" }}
            >
              <ArrowLeft size={14} />
              Volver
            </button>
          ) : (
            <div />
          )}

          <div className="nook-onboarding__logo">
            <Logo size={28} />
          </div>
        </div>

        {/* Stepper */}
        <div className="nook-onboarding-stepper-wrapper w-full flex justify-center">
          <Stepper currentStep={step} />
        </div>

        {/* Card central */}
        <div className="nook-onboarding__card">
          <h1 className="nook-onboarding__title">{title}</h1>
          {subtitle && <p className="nook-onboarding__subtitle">{subtitle}</p>}

          <div className="nook-onboarding__content">{children}</div>
        </div>

        {/* Footer con botón */}
        {onNext && (
          <div className="nook-onboarding__footer">
            <button
              onClick={onNext}
              disabled={!canContinue || loading}
              className="nook-auth__button"
            >
              {loading ? "Guardando..." : nextLabel}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
