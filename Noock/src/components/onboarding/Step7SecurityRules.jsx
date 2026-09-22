import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  Home,
  Camera,
  MessageCircle,
  MapPin,
  AlertTriangle,
  UserX,
  Sparkles,
  Video,
  Heart,
  Lock,
  ShieldAlert,
} from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboardingStore } from "../../stores/onboardingStore";

const TIMER_SECONDS = 60;

const RULES = [
  {
    icon: Wallet,
    color: "text-error",
    bg: "bg-error/10",
    title: "Nunca envíes dinero",
    text: "Si alguien te lo pide, es estafa. Reporta de inmediato.",
  },
  {
    icon: Home,
    color: "text-error",
    bg: "bg-error/10",
    title: "Nunca compartas tu dirección",
    text: "Ni tu trabajo, ni tu barrio exacto, ni tu rutina diaria.",
  },
  {
    icon: Camera,
    color: "text-amber-600",
    bg: "bg-amber-100",
    title: "Usa fotos exclusivas",
    text: "Que no estén en tus redes sociales ni se puedan buscar en Google.",
  },
  {
    icon: MessageCircle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    title: "Mantén la conversación aquí",
    text: "Si insisten en ir a WhatsApp, desconfía. Puede ser estafador.",
  },
  {
    icon: MapPin,
    color: "text-accent-hover",
    bg: "bg-accent/15",
    title: "Antes de una cita",
    text: "Dile a un amigo dónde vas, comparte ubicación, queda en lugar público. Llega y sal por tu cuenta.",
  },
  {
    icon: AlertTriangle,
    color: "text-error",
    bg: "bg-error/10",
    title: "Si algo se siente mal, reporta",
    text: 'No importa si es "solo un mensaje". Confía en tu instinto.',
  },
  {
    icon: UserX,
    color: "text-error",
    bg: "bg-error/10",
    title: "No des datos personales",
    text: "Teléfono, dirección, cédula ni información bancaria.",
  },
  {
    icon: Sparkles,
    color: "text-violet-600",
    bg: "bg-violet-100",
    title: "Desconfía de la perfección",
    text: "Fotos de modelo, perfil nuevo con carisma extremo, historias perfectas. Puede ser catfishing.",
  },
  {
    icon: Video,
    color: "text-blue-600",
    bg: "bg-blue-100",
    title: "Verifica antes de la cita",
    text: "Videollamada previa, redes sociales reales, consistencia en las historias.",
  },
  {
    icon: Lock,
    color: "text-error",
    bg: "bg-error/10",
    title: "Si te piden algo raro",
    text: "Dinero, fotos íntimas o contraseñas. Bloquea y reporta sin dudar.",
  },
];

const VULNERABLE_RULES = [
  {
    icon: MapPin,
    color: "text-accent-hover",
    bg: "bg-accent/15",
    title: "Comparte tu ubicación en tiempo real",
    text: "Con un amigo o familiar de confianza durante toda la cita.",
  },
  {
    icon: ShieldAlert,
    color: "text-accent-hover",
    bg: "bg-accent/15",
    title: "Ten un plan de salida",
    text: "Cómo llegar, cómo salir, dinero para el transporte.",
  },
  {
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-100",
    title: "Confía en tu instinto",
    text: "Si algo se siente mal, vete. No tienes que ser educada con quien te incomoda.",
  },
  {
    icon: AlertTriangle,
    color: "text-error",
    bg: "bg-error/10",
    title: "Reporta el acoso",
    text: 'No importa si es "pequeño". Cada reporte ayuda a proteger a otras.',
  },
];

export default function Step7SecurityRules({ onNext, onBack }) {
  const { setSafetyRead } = useOnboardingStore();
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const remaining = Math.max(0, TIMER_SECONDS - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) setSafetyRead(true);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [setSafetyRead]);

  const canContinue = timeLeft === 0;
  const progress = ((TIMER_SECONDS - timeLeft) / TIMER_SECONDS) * 100;

  return (
    <OnboardingLayout
      step={7}
      title="Antes de empezar"
      subtitle="Estas reglas te protegen. Léelas con calma."
      onBack={onBack}
      onNext={onContinue}
      canContinue={canContinue}
    >
      {/* Timer + barra de progreso */}
      <div className="mb-4 sticky -top-1 z-10 bg-bg-surface/95 backdrop-blur-sm pt-1 pb-3 rounded-b-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
            Tiempo de lectura
          </span>
          <span
            className={`text-[13px] font-bold tabular-nums ${
              timeLeft <= 10 ? "text-error" : "text-text-primary"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Recomendaciones generales */}
      <div className="space-y-2.5">
        {RULES.map((rule, i) => (
          <RuleCard key={i} rule={rule} />
        ))}
      </div>

      {/* Separador */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
          Especialmente si eres mujer o persona vulnerable
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Recomendaciones específicas */}
      <div className="space-y-2.5">
        {VULNERABLE_RULES.map((rule, i) => (
          <RuleCard key={i} rule={rule} highlight />
        ))}
      </div>

      {/* Nota final */}
      <div className="mt-5 p-3 bg-error/5 border border-error/20 rounded-xl text-center">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          <strong className="text-error">Si estás en peligro real,</strong>{" "}
          llama a la línea de emergencias{" "}
          <strong className="text-text-primary">123</strong> y usa el Botón de
          Pánico en Nook.
        </p>
      </div>
    </OnboardingLayout>
  );

  function onContinue() {
    if (canContinue) onNext();
  }
}

function RuleCard({ rule, highlight = false }) {
  const Icon = rule.icon;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        highlight
          ? "bg-accent/5 border-accent/20"
          : "bg-bg-alt border-border-soft"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rule.bg}`}
      >
        <Icon size={15} className={rule.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-text-primary mb-0.5 leading-snug">
          {rule.title}
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          {rule.text}
        </p>
      </div>
    </div>
  );
}
