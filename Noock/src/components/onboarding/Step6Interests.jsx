import { useEffect, useState } from "react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { supabase } from "../../lib/supabase";

export default function Step5Interests({ onNext, onBack }) {
  const { selectedInterestIds, toggleInterest } = useOnboardingStore();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("interests")
        .select("*")
        .order("name");
      setInterests(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const canContinue = selectedInterestIds.length >= 3;
  const count = selectedInterestIds.length;

  return (
    <OnboardingLayout
      step={6}
      title="¿Qué te mueve?"
      subtitle={
        canContinue
          ? `${count} seleccionados`
          : `Elige al menos 3 · ${count} seleccionados`
      }
      onBack={onBack}
      onNext={onNext}
      canContinue={canContinue}
    >
      {loading ? (
        <div className="text-center py-8 text-text-tertiary text-[12px]">
          Cargando...
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
          {interests.map((interest) => {
            const selected = selectedInterestIds.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  selected
                    ? "bg-accent text-bg border border-accent"
                    : "bg-bg-alt text-text-secondary border border-border hover:border-accent/40 hover:text-text-primary"
                }`}
              >
                <span>{interest.emoji}</span>
                {interest.name}
              </button>
            );
          })}
        </div>
      )}
    </OnboardingLayout>
  );
}
