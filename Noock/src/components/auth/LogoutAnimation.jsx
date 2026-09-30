import { useEffect, useState } from "react";
import Logo from "../ui/Logo";

export default function LogoutAnimation({ userName = "", onComplete }) {
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");

  const [isMobile] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
  });

  const frase = userName ? `Nos vemos pronto, ${userName}` : "Nos vemos pronto";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), isMobile ? 400 : 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isMobile]);

  useEffect(() => {
    if (phase < 2) return;
    let index = 0;
    const speed = isMobile ? 40 : 55;
    const interval = setInterval(() => {
      if (index <= frase.length) {
        setTypedText(frase.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), isMobile ? 400 : 800);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [phase, frase, onComplete, isMobile]);

  return (
    <div className="fixed inset-0 z-[500] bg-bg flex flex-col items-center justify-center overflow-hidden">
      {/* Blob de fondo */}
      <div
        className={`absolute w-72 h-72 rounded-full bg-accent/10 blur-3xl transition-all duration-1000 ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      />

      <div
        className={`relative text-accent transition-all duration-700 ease-out ${
          phase >= 1
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-75 -rotate-12"
        }`}
      >
        <Logo size={isMobile ? 60 : 56} />
      </div>

      <p className="relative mt-8 text-[13px] text-text-secondary max-w-xs text-center leading-relaxed min-h-[30px] px-6">
        {typedText}
        {phase === 2 && typedText.length < frase.length && (
          <span className="inline-block w-[1px] h-[14px] bg-accent ml-0.5 animate-pulse align-middle" />
        )}
      </p>

      {typedText.length >= frase.length && (
        <div className="relative mt-6 text-2xl animate-pulse">💚</div>
      )}
    </div>
  );
}
