import { useEffect, useState } from "react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { supabase } from "../../lib/supabase";

export default function Step4Answers({ onNext, onBack }) {
  const { selectedQuestionIds, answers, setAnswer } = useOnboardingStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .in("id", selectedQuestionIds);
      // Ordenar igual que selectedQuestionIds
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
      title="Responde con honestidad"
      subtitle="Respuestas cortas y auténticas funcionan mejor que párrafos largos."
      onBack={onBack}
      onNext={onNext}
      canContinue={allAnswered}
    >
      {loading ? (
        <div className="text-center py-8 text-text-tertiary text-[12px]">
          Cargando...
        </div>
      ) : (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
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
      )}
    </OnboardingLayout>
  );
}
