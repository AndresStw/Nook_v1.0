// ============================================
// NOOK — Sound Manager
// Singleton que precarga y reproduce audio Noock\src\lib\sounds.js
// ============================================

const SOUND_FILES = {
  message: "/sounds/message.mp3",
  message_sent: "/sounds/message_sent.mp3",
  login: "/sounds/login.wav",
  register: "/sounds/register.mp3",
  logout: "/sounds/logout.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  warning: "/sounds/warning.mp3",
  match: "/sounds/match.mp3",
  blind_chat: "/sounds/blind_chat.mp3",
  pi_reward: "/sounds/pi_reward.mp3",
  notification: "/sounds/notification.mp3",
};

// Volumen por tipo (0.0 - 1.0)
const VOLUMES = {
  message: 0.5,
  message_sent: 0.4,
  login: 0.6,
  register: 0.6,
  logout: 0.4,
  success: 0.5,
  error: 0.6,
  warning: 0.7,
  match: 0.7,
  blind_chat: 0.6,
  pi_reward: 0.5,
  notification: 0.5,
};

class SoundManager {
  constructor() {
    this.sounds = {};
    this.unlocked = false;
    this.muted = false;
    this.masterVolume = 1.0;
    this.initialized = false;
  }

  // Precarga todos los sonidos (lazy, no bloquea)
  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Cargar preferencia de mute desde localStorage
    const savedMuted = localStorage.getItem("nook_sound_muted");
    if (savedMuted === "true") this.muted = true;

    const savedVolume = localStorage.getItem("nook_sound_volume");
    if (savedVolume) this.masterVolume = parseFloat(savedVolume);

    // Crear un Audio por cada sonido
    Object.entries(SOUND_FILES).forEach(([key, url]) => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = "auto";
      audio.volume = (VOLUMES[key] ?? 0.5) * this.masterVolume;
      audio.load();
      this.sounds[key] = audio;
    });

    // Desbloquear con la primera interacción del usuario
    const unlock = () => {
      this.unlocked = true;
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
  }

  // Reproducir sonido
  play(name) {
    if (this.muted || !this.unlocked) return;
    const audio = this.sounds[name];
    if (!audio) {
      console.warn(`🔇 Sound "${name}" no encontrado`);
      return;
    }

    try {
      // Reset para permitir solapamiento
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // Ignorar errores de autoplay silenciosamente
        });
      }
    } catch (err) {
      console.warn(`🔇 Error reproduciendo "${name}"`, err);
    }
  }

  // Mute global
  setMuted(value) {
    this.muted = value;
    localStorage.setItem("nook_sound_muted", String(value));
  }

  isMuted() {
    return this.muted;
  }

  // Volumen global (0.0 - 1.0)
  setVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    localStorage.setItem("nook_sound_volume", String(this.masterVolume));

    // Actualizar todos los audios
    Object.entries(this.sounds).forEach(([key, audio]) => {
      audio.volume = (VOLUMES[key] ?? 0.5) * this.masterVolume;
    });
  }

  getVolume() {
    return this.masterVolume;
  }
}

// Exportar instancia única
export const soundManager = new SoundManager();
