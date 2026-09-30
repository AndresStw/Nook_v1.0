import { useState, useEffect } from "react";
import OnboardingLayout from "./OnboardingLayout";
import WallOfVoices from "../ui/WallOfVoices";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { User, MapPin, Calendar, AlertCircle, Eye, EyeOff } from "lucide-react";
import { COLOMBIAN_CITIES, isValidCity } from "../../lib/cities";
import { GENDER_INTERNAL, SHOW_ME_OPTIONS } from "../../lib/profileLabels";
import "../../assets/Css/landing.css";
import "../../assets/Css/login.css";

//Componente
export default function Step2Basic({ onNext, onBack }) {
  const { user } = useAuth();
  const { basic, setBasic } = useOnboardingStore();
  const [errors, setErrors] = useState({});
  const [showAgeBlock, setShowAgeBlock] = useState(false);

  //Hook #1
  useEffect(() => {
    if (!basic.name && user?.user_metadata?.name) {
      setBasic("name", user.user_metadata.name);
    }
  }, [user]);

  const canContinue =
    basic.name?.trim().length >= 2 &&
    basic.city?.trim() &&
    isValidCity(basic.city) &&
    basic.birth_date &&
    basic.gender_internal &&
    basic.show_me?.length > 0;

  const toggleShowMe = (key) => {
    const current = basic.show_me || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setBasic("show_me", next);
    if (errors.show_me) setErrors((p) => ({ ...p, show_me: null }));
  };

  const handleNext = async () => {
    const errs = {};
    if (!basic.name || basic.name.trim().length < 2)
      errs.name = "Mínimo 2 letras";
    if (!basic.city || !isValidCity(basic.city)) errs.city = "Elige una ciudad";
    if (!basic.birth_date) errs.birth_date = "Requerido";
    if (!basic.gender_internal) errs.gender_internal = "Selecciona una opción";
    if (!basic.show_me || basic.show_me.length === 0)
      errs.show_me = "Elige al menos una opción";

    if (basic.birth_date) {
      const age = calculateAge(basic.birth_date);
      if (age < 18) {
        errs.birth_date = `Debes tener al menos 18 años. Tienes ${age}.`;
      } else if (age > 100) {
        errs.birth_date = "Fecha inválida";
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (errs.birth_date?.includes("18 años")) setShowAgeBlock(true);
      return;
    }

    const { data: ageCheck } = await supabase.rpc("check_age_eligibility", {
      p_birth_date: basic.birth_date,
    });

    if (!ageCheck?.valid) {
      setErrors({ birth_date: ageCheck?.error || "Edad no válida" });
      if (ageCheck?.age && ageCheck.age < 18) setShowAgeBlock(true);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        name: basic.name.trim(),
        city: basic.city.trim(),
        birth_date: basic.birth_date,
        gender_internal: basic.gender_internal,
        gender_public:
          basic.gender_internal === "prefiero_no_decir"
            ? false
            : (basic.gender_public ?? false),
        show_me: basic.show_me,
      })
      .eq("id", user.id);

    if (error) {
      setErrors({ birth_date: error.message });
      return;
    }

    onNext();
  };

  // Bloqueo por menor de edad 
  if (showAgeBlock) {
    return (
      <main className="nook-auth nook-auth--onboarding">
        <WallOfVoices />
        <div className="nook-onboarding">
          <div
            className="nook-onboarding__card"
            style={{ textAlign: "center" }}
          >
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="nook-onboarding__title mb-3">
              Lo sentimos, pero...
            </h1>
            <p className="text-[13px] text-text-secondary leading-relaxed mb-5">
              Debes tener al menos <strong>18 años</strong> para usar Nook. Es
              un requisito legal para tu propia protección.
            </p>
            <div className="p-3 bg-error/5 border border-error/20 rounded-xl mb-5">
              <p className="text-[11.5px] text-text-secondary leading-relaxed">
                Si crees que es un error, contacta con Soporte con el botón 🐛
                cuando cumplas la mayoría de edad.
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="w-full py-3 rounded-xl font-semibold text-[13px] bg-bg-alt text-text-primary border border-border hover:bg-border transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isWildCard = basic.gender_internal === "prefiero_no_decir";

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
              max={
                new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]
              }
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
          <p className="text-[10px] text-text-tertiary mt-1">
            Debes tener al menos 18 años para usar Nook.
          </p>
        </div>

        {/* ─── GÉNERO INTERNO ─── */}
        <div>
          <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
            ¿Cómo te identificas?
          </label>
          <select
            value={basic.gender_internal || ""}
            onChange={(e) => {
              setBasic("gender_internal", e.target.value || null);
              if (errors.gender_internal)
                setErrors((p) => ({ ...p, gender_internal: null }));
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-[13px] bg-bg-alt border text-text-primary focus:outline-none focus:border-accent ${
              errors.gender_internal ? "border-error" : "border-border"
            }`}
          >
            <option value="">— Selecciona —</option>
            {Object.entries(GENDER_INTERNAL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.gender_internal && (
            <p className="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.gender_internal}
            </p>
          )}
          <p className="text-[10px] text-text-tertiary mt-1">
            🔒 Esto es privado. Solo lo usa el algoritmo para conectarte mejor.
          </p>
        </div>

        {/* ─── GENDER PUBLIC TOGGLE ─── */}
        {basic.gender_internal && !isWildCard && (
          <button
            type="button"
            onClick={() => setBasic("gender_public", !basic.gender_public)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-alt hover:bg-bg-surface transition-colors text-left"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                basic.gender_public
                  ? "bg-accent/15 text-accent-hover"
                  : "bg-bg-surface text-text-tertiary"
              }`}
            >
              {basic.gender_public ? <Eye size={15} /> : <EyeOff size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-text-primary">
                Mostrar mi género en mi perfil
              </div>
              <div className="text-[11px] text-text-secondary">
                {basic.gender_public
                  ? "Visible para todos"
                  : "Solo el algoritmo lo sabe"}
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                basic.gender_public ? "bg-accent" : "bg-border"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  basic.gender_public ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        )}

        {/* ─── SHOW ME ─── */}
        <div>
          <label className="text-[11px] font-semibold text-text-primary mb-1.5 block">
            ¿A quién quieres conocer?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SHOW_ME_OPTIONS.map((key) => {
              const selected = basic.show_me?.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleShowMe(key)}
                  className={`text-[11.5px] px-3 py-1.5 rounded-full border transition-all ${
                    selected
                      ? "bg-accent text-bg border-accent font-semibold"
                      : "bg-bg-alt border-border text-text-secondary hover:border-accent/40"
                  }`}
                >
                  {GENDER_INTERNAL[key]}
                </button>
              );
            })}
          </div>
          {errors.show_me && (
            <p className="text-[11px] text-error mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.show_me}
            </p>
          )}
          <p className="text-[10px] text-text-tertiary mt-1">
            Solo verás a quienes también quieran verte a ti. 💚
          </p>
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
