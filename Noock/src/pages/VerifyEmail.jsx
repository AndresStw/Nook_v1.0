import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/ui/Logo";
import WallOfVoices from "../components/ui/WallOfVoices";
import "../assets/Css/landing.css";
import "../assets/Css/login.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Si por alguna razón ya está verificado  al feed
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  // Cooldown del botón de reenviar (60s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Polling: cada 5s pregunta si ya verificó (por si el usuario confirma en otra pestaña)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const {
        data: { user: freshUser },
      } = await supabase.auth.getUser();
      if (freshUser?.email_confirmed_at) {
        navigate("/feed", { replace: true });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResend = async () => {
    if (resending || cooldown > 0 || !user?.email) return;
    setResending(true);
    setFeedback(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setResending(false);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    setFeedback({
      type: "ok",
      message: "Correo reenviado. Revisa tu bandeja.",
    });
    setCooldown(60);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <main className="nook-auth">
      <WallOfVoices />

      <div className="nook-auth__card">
        <div className="nook-auth__logo">
          <Logo size={38} />
        </div>

        <h1 className="nook-auth__title">Verifica tu correo</h1>
        <p className="nook-auth__subtitle">
          Te enviamos un enlace a <strong>{user?.email}</strong>
        </p>

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Mail size={28} className="text-accent-hover" />
          </div>
        </div>

        <div className="p-3 bg-bg-alt border border-border-soft rounded-xl mb-5">
          <p className="text-[11.5px] text-text-secondary leading-relaxed text-center">
            Abre el correo y haz clic en el enlace de confirmación para activar
            tu cuenta. Si no lo ves, revisa spam.
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 text-[11.5px] rounded-lg p-2.5 mb-3 ${
              feedback.type === "ok"
                ? "text-accent-hover bg-accent/10 border border-accent/20"
                : "text-error bg-error/10 border border-error/20"
            }`}
          >
            {feedback.type === "ok" ? (
              <CheckCircle2 size={13} />
            ) : (
              <AlertCircle size={13} />
            )}
            {feedback.message}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="nook-auth__button"
        >
          {resending ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Enviando...
            </>
          ) : cooldown > 0 ? (
            <>Espera {cooldown}s para reenviar</>
          ) : (
            <>
              <RefreshCw size={14} />
              Reenviar correo
            </>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="w-full mt-3 flex items-center justify-center gap-2 text-[12px] text-text-tertiary hover:text-error transition-colors py-2"
        >
          <LogOut size={12} />
          Cerrar sesión / usar otra cuenta
        </button>

        <p className="nook-auth__footer">
          ¿Ya verificaste? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
