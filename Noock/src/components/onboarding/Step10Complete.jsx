import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { soundManager } from "../../lib/sounds";

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
      // 1. Guardar intereses (lo único que queda del onboarding)
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

      // 2. Marcar onboarding como completado
      const { error: uErr } = await supabase
        .from("users")
        .update({
          onboarding_completed: true,
          verified: true,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (uErr) throw uErr;

      // 3. Refrescar perfil y resetear store
      await refetchProfile();
      store.reset();

      // 4. Reproducir sonido de éxito antes de redirigir
      soundManager.play("success");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 5. Redirigir a Mi Perfil con flag para mostrar banner
      window.location.href = "/me?fromOnboarding=1";
    } catch (err) {
      console.error("🚨 NOOK-502: Error completando onboarding", err);
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      step={7}
      title="Todo listo 🎉"
      subtitle="Ya eres parte de Nook. Un lugar donde se conecta de verdad."
      onBack={onBack}
      onNext={handleComplete}
      canContinue={true}
      loading={saving}
      nextLabel="Completar mi perfil"
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
