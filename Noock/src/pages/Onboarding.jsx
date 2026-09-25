import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboardingStore";
import Step1Welcome from "../components/onboarding/Step1Welcome";
import Step2Basic from "../components/onboarding/Step2Basic";
import Step3Photos from "../components/onboarding/Step3Photos";
import Step4Questions from "../components/onboarding/Step4Questions";
import Step5Answers from "../components/onboarding/Step5Answers";
import Step6Interests from "../components/onboarding/Step6Interests";
import Step7Details from "../components/onboarding/Step7Details";
import Step8Security from "../components/onboarding/Step8Security";
import Step9SecurityRules from "../components/onboarding/Step9SecurityRules";
import Step10Complete from "../components/onboarding/Step10Complete";

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
      return <Step4Questions {...props} />;
    case 5:
      return <Step5Answers {...props} />;
    case 6:
      return <Step6Interests {...props} />;
    case 7:
      return <Step7Details {...props} />;
    case 8:
      return <Step8Security {...props} />;
    case 9:
      return <Step9SecurityRules {...props} />;
    case 10:
      return <Step10Complete onBack={prevStep} />;
    default:
      return <Step1Welcome {...props} />;
  }
}
