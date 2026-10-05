import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import WallOfVoices from "../components/ui/WallOfVoices";
import "../assets/Css/landing.css";
import { APP_VERSION } from "../lib/version";

export default function Landing() {
  return (
    <main className="nook-landing">
      <WallOfVoices />

      <div className="nook-landing__content">
        <div className="nook-landing__logo">
          <Logo size={58} />
        </div>

        <p className="nook-landing__tagline">
          Primero hablas.
          <br />
          Luego decides.
        </p>

        <p className="nook-landing__description">
          Aquí las fotos están borrosas hasta que ambos se eligen.
          <br />
          Te conocen por lo que dices, no por cómo te ves.
        </p>

        <div className="nook-landing__actions">
          <Link to="/register" className="nook-button nook-button--primary">
            Crear cuenta
            <span aria-hidden="true">→</span>
          </Link>

          <Link to="/login" className="nook-button nook-button--secondary">
            Ya tengo una cuenta
          </Link>
        </div>

        <div className="nook-landing__footer">
          <span className="nook-landing__footer-heart">♡</span>
          Sin fotos hasta el match. Sin juicios antes.
        </div>
      </div>

      <div className="nook-landing__bottom">
        <span className="nook-landing__mini-logo">
          <Logo size={23} />
        </span>
        <span>Conexiones reales. Personas reales.</span>
        <span className="nook-landing__version">· {APP_VERSION}</span>
      </div>
    </main>
  );
}
