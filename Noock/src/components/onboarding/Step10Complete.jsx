import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export default function Step7Complete({ onBack }) {
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();
  const store = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Guardar respuestas
      const answersPayload = store.selectedQuestionIds.map((qid) => ({
        user_id: user.id,
        question_id: qid,
        answer: store.answers[qid],
      }));

      if (answersPayload.length > 0) {
        const { error: aErr } = await supabase
          .from("user_answers")
          .upsert(answersPayload, { onConflict: "user_id,question_id" });
        if (aErr) throw aErr;
      }

      // 2. Guardar intereses
      const interestsPayload = store.selectedInterestIds.map((iid) => ({
        user_id: user.id,
        interest_id: iid,
      }));

      if (interestsPayload.length > 0) {
        const { error: iErr } = await supabase
          .from("user_interests")
          .upsert(interestsPayload, { onConflict: "user_id,interest_id" });
        if (iErr) throw iErr;
      }

      // 3. Marcar onboarding como completado + guardar detalles
      const { error: uErr } = await supabase
        .from("users")
        .update({
          onboarding_completed: true,
          verified: true,
          last_active_at: new Date().toISOString(),
          // Detalles del perfil
          sexual_orientation: store.details.sexual_orientation,
          marital_status: store.details.marital_status,
          has_kids: store.details.has_kids,
          personality: store.details.personality,
          smokes: store.details.smokes,
          drinks: store.details.drinks,
          religion: store.details.religion,
          height_cm: store.details.height_cm,
          languages: store.details.languages || [],
        })
        .eq("id", user.id);

      // 4. Refrescar perfil y resetear store
      await refetchProfile();
      store.reset();
      // Reload completo para asegurar que TODOS los useAuth obtengan perfil fresco
      window.location.href = "/feed";
    } catch (err) {
      console.error("🚨 NOOK-502: Error completando onboarding", err);
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      step={10}
      title="Todo listo 🎉"
      subtitle="Ya eres parte de Nook. Un lugar donde se conecta de verdad."
      onBack={onBack}
      onNext={handleComplete}
      canContinue={true}
      loading={saving}
      nextLabel="Entrar a Nook"
    >
      <div className="space-y-3">
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🎭</div>
        </div>

        <div className="p-3 rounded-xl bg-accent/8 border border-accent/20">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-text-secondary leading-relaxed">
              Recuerda: en Nook las fotos son solo el inicio.
              <strong className="text-text-primary">
                {" "}
                Lo que importa son las conversaciones.
              </strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-[11px] text-error text-center">
            {error}
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
