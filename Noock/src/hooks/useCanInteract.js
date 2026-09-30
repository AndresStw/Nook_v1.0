// src/hooks/useCanInteract.js
// Hook que dice si el usuario puede interactuar (likes, mensajes)
// Está bloqueado si:
//   - No completó el 75% del perfil
//   - Y tiene un escape activo, PERO es de solo lectura (restricted)
import { useProfileCompletion } from "./useProfileCompletion";
import { hasActiveEscape, isEscapeRestricted } from "../lib/profileCompletion";

export function useCanInteract(userId, isOnboardingComplete, isFounder) {
  const { isComplete, loading } = useProfileCompletion(
    userId,
    isOnboardingComplete,
    isFounder,
  );

  // Mientras carga, no bloqueamos nada
  if (loading) return { canInteract: true, reason: null, loading: true };

  // Founder: siempre puede
  if (isFounder) return { canInteract: true, reason: null, loading: false };

  // Perfil completo (>= 75%): siempre puede
  if (isComplete) return { canInteract: true, reason: null, loading: false };

  // Perfil incompleto:
  // - Sin escape → bloqueado total (ya lo maneja ProtectedRoute)
  // - Con escape restricted → puede ver, pero no interactuar
  // - Con escape no restricted → puede interactuar
  if (!hasActiveEscape()) {
    return { canInteract: false, reason: "blocked", loading: false };
  }

  if (isEscapeRestricted()) {
    return { canInteract: false, reason: "readonly", loading: false };
  }

  return { canInteract: true, reason: null, loading: false };
}
