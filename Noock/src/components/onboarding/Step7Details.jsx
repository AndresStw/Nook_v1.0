import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import {
  SEXUAL_ORIENTATION,
  MARITAL_STATUS,
  HAS_KIDS,
  SMOKES,
  DRINKS,
  PERSONALITY,
  RELIGION,
  LANGUAGES,
  formatHeight,
} from "../../lib/profileLabels";


//Componente
export default function Step6Details({ onNext, onBack }) {
  const { details, setDetail, toggleLanguage } = useOnboardingStore();

  // Mínimo: al menos 1 campo llenado o todos en "prefiero no decir"
  const filledCount = [
    details.sexual_orientation,
    details.marital_status,
    details.has_kids,
    details.personality,
    details.smokes,
    details.drinks,
    details.religion,
    details.height_cm,
    details.languages?.length > 0 ? "yes" : null,
  ].filter(Boolean).length;

  const canContinue = true; // siempre puede continuar, es opcional

  return (
    <OnboardingLayout
      step={7}
      title="Cuéntanos un poco más"
      subtitle="Todo es opcional. Elige lo que quieras compartir."
      onBack={onBack}
      onNext={onNext}
      canContinue={canContinue}
    >
      <div className="space-y-3">
        <SelectField
          label="Orientación sexual"
          value={details.sexual_orientation}
          onChange={(v) => setDetail("sexual_orientation", v)}
          options={SEXUAL_ORIENTATION}
        />
        <SelectField
          label="Estado civil"
          value={details.marital_status}
          onChange={(v) => setDetail("marital_status", v)}
          options={MARITAL_STATUS}
        />
        <SelectField
          label="Hijos"
          value={details.has_kids}
          onChange={(v) => setDetail("has_kids", v)}
          options={HAS_KIDS}
        />
        <SelectField
          label="Personalidad"
          value={details.personality}
          onChange={(v) => setDetail("personality", v)}
          options={PERSONALITY}
        />
        <SelectField
          label="Fuma"
          value={details.smokes}
          onChange={(v) => setDetail("smokes", v)}
          options={SMOKES}
        />
        <SelectField
          label="Bebe"
          value={details.drinks}
          onChange={(v) => setDetail("drinks", v)}
          options={DRINKS}
        />
        <SelectField
          label="Religión"
          value={details.religion}
          onChange={(v) => setDetail("religion", v)}
          options={RELIGION}
        />

        {/* Altura */}
        <div>
          <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 block">
            Altura (cm)
          </label>
          <input
            type="number"
            min={100}
            max={250}
            value={details.height_cm || ""}
            onChange={(e) =>
              setDetail(
                "height_cm",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            placeholder="Ej: 172"
            className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent"
          />
          {details.height_cm && (
            <p className="text-[10px] text-text-tertiary mt-1">
              Se mostrará como:{" "}
              <span className="text-text-primary font-medium">
                {formatHeight(details.height_cm)}
              </span>
            </p>
          )}
        </div>

        {/* Idiomas */}
        <div>
          <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 block">
            Idiomas
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang) => {
              const selected = details.languages?.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    selected
                      ? "bg-accent text-bg border-accent"
                      : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-text-tertiary text-center pt-2">
          {filledCount === 0
            ? "Puedes continuar sin llenar nada."
            : `${filledCount} ${filledCount === 1 ? "dato" : "datos"} completo${filledCount === 1 ? "" : "s"}`}
        </p>
      </div>
    </OnboardingLayout>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 bg-bg-alt border border-border rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="">— Sin especificar —</option>
        {Object.entries(options).map(([key, lbl]) => (
          <option key={key} value={key}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}
