export default function Stepper({ currentStep, totalSteps = 7 }) {
  return (
    <div className="nook-onboarding-stepper flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              isDone ? "bg-accent" : isActive ? "bg-accent/60" : "bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}
