import { useEffect, useState } from "react";
import { soundManager } from "../lib/sounds";

export function useSound() {
  const [muted, setMutedState] = useState(soundManager.isMuted());
  const [volume, setVolumeState] = useState(soundManager.getVolume());

  // Inicializar el manager al montar
  useEffect(() => {
    soundManager.init();
  }, []);

  const play = (name) => soundManager.play(name);

  const toggleMute = () => {
    const newValue = !muted;
    soundManager.setMuted(newValue);
    setMutedState(newValue);
  };

  const setVolume = (value) => {
    soundManager.setVolume(value);
    setVolumeState(value);
  };

  return { play, muted, toggleMute, volume, setVolume };
}
