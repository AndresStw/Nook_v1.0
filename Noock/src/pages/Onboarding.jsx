import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboardingStore";

import Step1Welcome from "../components/onboarding/Step1Welcome";
import Step2Photos from "../components/onboarding/Step2Photos";
import Step3Questions from "../components/onboarding/Step3Questions";
import Step4Answers from "../components/onboarding/Step4Answers";
import Step5Interests from "../components/onboarding/Step5Interests";
import Step6Security from "../components/onboarding/Step6Security";
import Step7SecurityRules from "../components/onboarding/Step7SecurityRules";
import Step8Complete from "../components/onboarding/Step8Complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { step, nextStep, prevStep, reset } = useOnboardingStore();

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/feed", { replace: true });
    }
  }, [profile]);

  const props = { onNext: nextStep, onBack: step > 1 ? prevStep : null };

  switch (step) {
    case 1:
      return <Step1Welcome {...props} />;
    case 2:
      return <Step2Photos {...props} />;
    case 3:
      return <Step3Questions {...props} />;
    case 4:
      return <Step4Answers {...props} />;
    case 5:
      return <Step5Interests {...props} />;
    case 6:
      return <Step6Security {...props} />;
    case 7:
      return <Step7SecurityRules {...props} />;
    case 8:
      return <Step8Complete onBack={prevStep} />;
    default:
      return <Step1Welcome {...props} />;
  }
}
