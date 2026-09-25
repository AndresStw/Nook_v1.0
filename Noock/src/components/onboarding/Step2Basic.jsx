import { useState, useEffect } from "react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { User, MapPin, Calendar, AlertCircle } from "lucide-react";
import { COLOMBIAN_CITIES, isValidCity } from "../../lib/cities";

export default function Step2Basic({ onNext, onBack }) {
  const { user } = useAuth();
  const { basic, setBasic } = useOnboardingStore();
  const [errors, setErrors] = useState({});

  // Pre-cargar nombre del registro
  useEffect(() => {
    if (!basic.name && user?.user_metadata?.name) {
      setBasic("name", user.user_metadata.name);
    }
  }, [user]);

  const canContinue =
    basic.name?.trim().length >= 2 &&
    basic.city?.trim() &&
    isValidCity(basic.city) &&
    basic.birth_date;

  const handleNext = async () => {
    const errs = {};
    if (!basic.name || basic.name.trim().length < 2)
      errs.name = "Mínimo 2 letras";
    if (!basic.city || !isValidCity(basic.city)) errs.city = "Elige una ciudad";
    if (!basic.birth_date) errs.birth_date = "Requerido";

    // Validar mayoría de edad
    if (basic.birth_date) {
      const age = calculateAge(basic.birth_date);
      if (age < 18) errs.birth_date = "Debes tener al menos 18 años";
      if (age > 100) errs.birth_date = "Fecha inválida";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Guardar directo en la DB
    await supabase
      .from("users")
      .update({
        name: basic.name.trim(),
        city: basic.city.trim(),
        birth_date: basic.birth_date,
      })
      .eq("id", user.id);

    onNext();
  };

  return (
    <OnboardingLayout
      step={2}
      title="Cuéntanos de ti"
      subtitle="Estos datos son obligatorios. Tu edad no se podrá cambiar después."
      onBack={onBack}
      onNext={handleNext}
      canContinue={canContinue}
    >
      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
            Nombre o alias
          </label>
          <div className="relative">
            <User
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={basic.name || ""}
              onChange={(e) => setBasic("name", e.target.value)}
              maxLength={40}
              placeholder="Cómo quieres que te llamen"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] bg-bg-alt border text-text-primary focus:outline-none focus:border-accent ${
                errors.name ? "border-error" : "border-border"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.name}
            </p>
          )}
        </div>

        {/* Ciudad */}
        <div>
          <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
            Ciudad
          </label>
          <div className="relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              list="onboarding-cities"
              value={basic.city || ""}
              onChange={(e) => setBasic("city", e.target.value)}
              placeholder="Elige tu ciudad"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] bg-bg-alt border text-text-primary focus:outline-none focus:border-accent ${
                errors.city ? "border-error" : "border-border"
              }`}
            />
            <datalist id="onboarding-cities">
              {COLOMBIAN_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {errors.city && (
            <p className="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.city}
            </p>
          )}
        </div>

        {/* Fecha nacimiento */}
        <div>
          <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
            Fecha de nacimiento
            <span className="text-[10px] font-normal text-text-tertiary ml-2">
              🔒 No se podrá cambiar
            </span>
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="date"
              value={basic.birth_date || ""}
              onChange={(e) => setBasic("birth_date", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] bg-bg-alt border text-text-primary focus:outline-none focus:border-accent ${
                errors.birth_date ? "border-error" : "border-border"
              }`}
            />
          </div>
          {errors.birth_date && (
            <p className="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.birth_date}
            </p>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}

function calculateAge(birthDate) {
  const d = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
