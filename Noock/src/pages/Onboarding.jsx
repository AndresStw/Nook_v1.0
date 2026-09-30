import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboardingStore";
import Step1Welcome from "../components/onboarding/Step1Welcome";
import Step2Basic from "../components/onboarding/Step2Basic";
import Step3Photos from "../components/onboarding/Step3Photos";
import Step4Interests from "../components/onboarding/Step6Interests"; // reuso
import Step5Security from "../components/onboarding/Step8Security";
import Step6SecurityRules from "../components/onboarding/Step9SecurityRules";
import Step7Complete from "../components/onboarding/Step10Complete"; // reuso

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { step, nextStep, prevStep } = useOnboardingStore();

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/feed", { replace: true });
    }
  }, [profile, navigate]);

  const props = { onNext: nextStep, onBack: step > 1 ? prevStep : null };

  switch (step) {
    case 1:
      return <Step1Welcome {...props} />;
    case 2:
      return <Step2Basic {...props} />;
    case 3:
      return <Step3Photos {...props} />;
    case 4:
      return <Step4Interests {...props} />;
    case 5:
      return <Step5Security {...props} />;
    case 6:
      return <Step6SecurityRules {...props} />;
    case 7:
      return <Step7Complete onBack={prevStep} />;
    default:
      return <Step1Welcome {...props} />;
  }
}
