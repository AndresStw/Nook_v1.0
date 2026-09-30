import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/ui/Logo";
import WallOfVoices from "../components/ui/WallOfVoices";
import "../assets/Css/landing.css";
import "../assets/Css/login.css";
import { useSound } from "../hooks/useSound";
import LoginAnimation from "../components/auth/LoginAnimation";
import { APP_VERSION } from "../lib/version";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth(); //  profile
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { play } = useSound();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      play("login");
      setShowAnimation(true); //  solo activa la animación
      // Ya NO navegamos aquí: la animación maneja la redirección
    } catch (err) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  //  Callback cuando termina la animación
  const handleAnimationComplete = () => {
    navigate("/feed");
  };

  //  Render de la animación (reemplaza todo el login mientras corre)
  if (showAnimation) {
    return (
      <LoginAnimation
        userName={profile?.name?.split(" ")[0] || ""}
        onComplete={handleAnimationComplete}
      />
    );
  }

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

        <h1 className="nook-auth__title">Bienvenido de vuelta</h1>
        <p className="nook-auth__subtitle">
          Entra para seguir conociendo gente real
        </p>

        <form onSubmit={handleSubmit} className="nook-auth__form">
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
              placeholder="Tu contraseña"
              autoComplete="current-password"
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="nook-auth__footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
        <p className="nook-auth__version">{APP_VERSION}</p>
      </div>
    </main>
  );
}
