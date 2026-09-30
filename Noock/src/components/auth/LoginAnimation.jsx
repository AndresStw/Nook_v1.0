import { useEffect, useState } from "react";
import Logo from "../ui/Logo";

export default function LoginAnimation({ userName = "", onComplete }) {
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");

  // Detectar dispositivo
  const [isMobile] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod|Android/i.test(ua) || window.innerWidth < 768;
  });

  const tagline = isMobile
    ? "Conexiones reales. Personas reales."
    : "Aquí no se trata de deslizar, se trata de conectar.";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), isMobile ? 800 : 1200);
    const t3 = setTimeout(() => onComplete?.(), isMobile ? 2800 : 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete, isMobile]);

  useEffect(() => {
    if (phase < 2) return;
    let index = 0;
    const speed = isMobile ? 30 : 44;
    const interval = setInterval(() => {
      if (index <= tagline.length) {
        setTypedText(tagline.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [phase, tagline, isMobile]);

  // ============ VARIANTE MÓVIL: minimalista, rápido ============
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center overflow-hidden">
        {/* Fondo con pulso suave */}
        <div
          className={`absolute w-72 h-72 rounded-full bg-accent/10 blur-3xl transition-all duration-1000 ${
            phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />

        <div
          className={`relative text-accent transition-all duration-500 ease-out ${
            phase >= 1
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-75 translate-y-8"
          }`}
          style={{
            animation:
              phase >= 1 ? "breathe 2.5s ease-in-out infinite" : "none",
          }}
        >
          <Logo size={64} />
        </div>

        {userName && (
          <p
            className={`relative mt-5 text-[15px] font-semibold text-text-primary transition-all duration-500 delay-150 ${
              phase >= 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            Hola, {userName} 👋
          </p>
        )}

        <p className="relative mt-3 text-[12.5px] text-text-tertiary max-w-[240px] text-center leading-relaxed min-h-[36px] px-6">
          {typedText}
          {phase === 2 && typedText.length < tagline.length && (
            <span className="inline-block w-[1px] h-[13px] bg-accent ml-0.5 animate-pulse align-middle" />
          )}
        </p>

        {phase === 2 && typedText.length >= tagline.length && (
          <div className="relative mt-8 flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        )}
      </div>
    );
  }

  // ============ VARIANTE DESKTOP: la original ============
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center">
      <div
        className={`text-accent transition-all duration-700 ease-out ${
          phase >= 1
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-4"
        }`}
      >
        <Logo size={56} />
      </div>

      {userName && (
        <p
          className={`mt-4 text-[14px] text-text-secondary transition-all duration-700 delay-200 ${
            phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Hola, {userName}
        </p>
      )}

      <p className="mt-8 text-[13px] text-text-tertiary max-w-xs text-center leading-relaxed min-h-[40px] px-6">
        {typedText}
        {phase === 2 && typedText.length < tagline.length && (
          <span className="inline-block w-[1px] h-[14px] bg-accent ml-0.5 animate-pulse align-middle" />
        )}
      </p>

      {phase === 2 && typedText.length >= tagline.length && (
        <div className="mt-10 flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      )}
    </div>
  );
}
