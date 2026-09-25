import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import WallOfVoices from "../components/ui/WallOfVoices";
import "../assets/Css/landing.css";

export default function Landing() {
  return (
    <main className="nook-landing">
      <WallOfVoices />

      <div className="nook-landing__content">
        <div className="nook-landing__logo">
          <Logo size={58} />
        </div>

        <p className="nook-landing__tagline">
          Conexiones reales.
          <br />
          Personas reales.
        </p>

        <p className="nook-landing__description">
          Aquí no se trata de deslizar,
          <br />
          se trata de conectar.
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
          Un lugar para conectar de verdad.
        </div>
      </div>

      <div className="nook-landing__bottom">
        <span className="nook-landing__mini-logo">
          <Logo size={23} />
        </span>
        <span>Conexiones reales. Personas reales.</span>
      </div>
    </main>
  );
}
