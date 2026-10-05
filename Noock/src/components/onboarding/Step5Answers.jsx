// src/components/onboarding/Step5Answers.jsx
import { useEffect, useState } from "react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { supabase } from "../../lib/supabase";
import { Sparkles } from "lucide-react";

//Componente
export default function Step4Answers({ onNext, onBack }) {
  const { selectedQuestionIds, answers, setAnswer } = useOnboardingStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  //Hook #1
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .in("id", selectedQuestionIds);
      const ordered = selectedQuestionIds
        .map((id) => data?.find((q) => q.id === id))
        .filter(Boolean);
      setQuestions(ordered);
      setLoading(false);
    };
    if (selectedQuestionIds.length === 3) load();
  }, [selectedQuestionIds]);

  const allAnswered = selectedQuestionIds.every(
    (id) => (answers[id] || "").trim().length >= 3,
  );

  return (
    <OnboardingLayout
      step={5}
      title="Estas respuestas son tu foto"
      subtitle="Nadie va a ver tu cara hasta que ambos se elijan. Lo único que verán de ti es lo que escribas aquí."
      onBack={onBack}
      onNext={onNext}
      canContinue={allAnswered}
    >
      {loading ? (
        <div className="text-center py-8 text-text-tertiary text-[12px]">
          Cargando...
        </div>
      ) : (
        <>
          <div className="p-3 rounded-xl bg-accent/8 border border-accent/25 mb-4">
            <div className="flex items-start gap-2.5">
              <Sparkles
                size={14}
                className="text-accent-hover shrink-0 mt-0.5"
              />
              <p className="text-[11.5px] text-text-secondary leading-relaxed">
                Sé auténtico, no perfecto. Las respuestas honestas conectan más
                que las que suenan bonitas.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-h-105 overflow-y-auto pr-1">
            {questions.map((q) => {
              const value = answers[q.id] || "";
              return (
                <div key={q.id}>
                  <label className="text-[11px] text-text-secondary italic mb-1.5 block leading-snug">
                    {q.text}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    maxLength={150}
                    rows={3}
                    placeholder="Tu respuesta..."
                    className="w-full px-3 py-2 bg-bg-alt border border-border rounded-xl text-[12.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
                  />
                  <div className="text-[10px] text-text-tertiary text-right mt-0.5">
                    {value.length} / 150
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </OnboardingLayout>
  );
}
