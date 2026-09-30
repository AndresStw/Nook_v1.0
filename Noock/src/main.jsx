import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { soundManager } from "./lib/sounds";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import App from "./App.jsx";

// Inicializar manager de sonidos ANTES de renderizar
soundManager.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
