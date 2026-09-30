import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/ui/Logo";
import WallOfVoices from "../components/ui/WallOfVoices";
import "../assets/Css/landing.css";
import "../assets/Css/login.css";
import { useOnboardingStore } from "../stores/onboardingStore";
import { supabase } from "../lib/supabase";
import { useSound } from "../hooks/useSound";
import { APP_VERSION } from "../lib/version";

//Componente
export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { reset: resetOnboarding } = useOnboardingStore();
  const { play } = useSound();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      //  Pre-check: email bloqueado
      const { data: isBanned, error: banError } = await supabase.rpc(
        "is_email_banned",
        { p_email: email.trim().toLowerCase() },
      );

      if (!banError && isBanned) {
        setError(
          "Este email está bloqueado en Nook. Si crees que es un error, contacta al fundador.",
        );
        setLoading(false);
        return;
      }

      // Registro — puede devolver session O no (si requiere confirmación)
      const result = await signUp(email, password, name);
      play("register");
      resetOnboarding();

      // Retraso
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Si Supabase requiere confirmación de email, no hay session
      if (!result?.session) {
        navigate("/verify-email", { replace: true });
        return;
      }

      // Si ya tenía sesión (auto-confirm), va directo al onboarding
      navigate("/onboarding");
    } catch (err) {
      console.error("Error registro:", err);
      const msg = err?.message || "Error desconocido";

      if (msg.includes("NOOK-403")) {
        setError("Este email está bloqueado en Nook.");
      } else if (msg.includes("NOOK-429")) {
        setError("Demasiados registros desde tu red. Intenta más tarde.");
      } else if (msg.includes("User already registered")) {
        setError(
          "Este email ya está registrado. Inicia sesión o recupera tu contraseña.",
        );
      } else if (msg.includes("Database error saving new user")) {
        setError("No pudimos crear tu cuenta. Intenta con otro email.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nook-auth">
      <WallOfVoices />

      <Link to="/" className="nook-auth__back">
        <ArrowLeft size={14} />
        Volver
      </Link>

      <div className="nook-auth__card">
        <div className="nook-auth__logo">
          <Logo size={38} />
        </div>

        <h1 className="nook-auth__title">Crea tu cuenta</h1>
        <p className="nook-auth__subtitle">Un lugar para conectar de verdad</p>

        <form onSubmit={handleSubmit} className="nook-auth__form">
          <div className="nook-auth__field">
            <User size={16} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          <div className="nook-auth__field">
            <Mail size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="nook-auth__field">
            <Lock size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Crea una contraseña"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="nook-auth__error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="nook-auth__button"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="nook-auth__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
        <p className="nook-auth__version">{APP_VERSION}</p>
      </div>
    </main>
  );
}
