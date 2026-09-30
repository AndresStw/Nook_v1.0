// src/lib/profileCompletion.js
// Calcula el % de completitud + maneja el sistema de escapes progresivos
import { supabase } from "./supabase";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const ESCAPE_UNTIL_KEY = "nook_profile_escape_until";
const ESCAPE_COUNT_KEY = "nook_profile_escape_count";
const ESCAPE_RESTRICTED_KEY = "nook_profile_escape_restricted";

// Configuración de escapes progresivos
// index 0 → 1er escape, index 1 → 2do, index 2 → 3er
const ESCAPE_CONFIG = [
  { hours: 24, restricted: false }, // 1er escape: 24h, acceso completo
  { hours: 6, restricted: false }, // 2do escape: 6h, acceso completo
  { hours: 2, restricted: true }, // 3er escape: 2h, solo lectura
  // 4to+ → no hay escape
];

let cachedResult = null;
let cachedAt = 0;

export async function calculateCompletion(userId) {
  if (!userId) return { percent: 0, isComplete: false };

  const now = Date.now();
  if (
    cachedResult &&
    cachedResult.userId === userId &&
    now - cachedAt < CACHE_TTL
  ) {
    return cachedResult.data;
  }

  const [photosRes, interestsRes, answersRes, profileRes] = await Promise.all([
    supabase.from("photos").select("id").eq("user_id", userId),
    supabase.from("user_interests").select("interest_id").eq("user_id", userId),
    supabase
      .from("user_answers")
      .select("is_displayed, answer")
      .eq("user_id", userId),
    supabase
      .from("users")
      .select("name, tagline, bio, city, birth_date")
      .eq("id", userId)
      .single(),
  ]);

  const photosCount = Math.min((photosRes.data || []).length, 3);
  const interestsCount = Math.min((interestsRes.data || []).length, 5);
  const questionsCount = Math.min(
    (answersRes.data || []).filter(
      (a) => a.is_displayed && a.answer && a.answer.trim().length >= 3,
    ).length,
    3,
  );

  const p = profileRes.data || {};
  const basicFilled = [p.name, p.tagline, p.bio, p.city, p.birth_date].filter(
    Boolean,
  ).length;

  const totalTargets = 3 + 5 + 5 + 3; // 16
  const totalDone = photosCount + interestsCount + questionsCount + basicFilled;
  const percent = Math.round((totalDone / totalTargets) * 100);

  const data = {
    percent,
    isComplete: percent >= 75,
    photosCount,
    interestsCount,
    questionsCount,
    basicFilled,
  };

  cachedResult = { userId, data };
  cachedAt = now;

  return data;
}

export function invalidateCompletionCache() {
  cachedResult = null;
  cachedAt = 0;
}

// ============================================
// SISTEMA DE ESCAPES PROGRESIVOS
// ============================================

/**
 * Cuántos escapes ha usado el usuario (persistido en localStorage)
 */
export function getEscapeCount() {
  const count = localStorage.getItem(ESCAPE_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * ¿Quedan escapes disponibles?
 */
export function hasEscapesAvailable() {
  return getEscapeCount() < ESCAPE_CONFIG.length;
}

/**
 * ¿Hay un escape activo ahora mismo?
 */
export function hasActiveEscape() {
  const until = localStorage.getItem(ESCAPE_UNTIL_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

/**
 * ¿El escape activo es de solo lectura (no puede interactuar)?
 */
export function isEscapeRestricted() {
  if (!hasActiveEscape()) return false;
  return localStorage.getItem(ESCAPE_RESTRICTED_KEY) === "true";
}

/**
 * Cuánto tiempo queda del escape actual (ms)
 */
export function getEscapeTimeLeft() {
  const until = localStorage.getItem(ESCAPE_UNTIL_KEY);
  if (!until) return 0;
  const left = parseInt(until, 10) - Date.now();
  return left > 0 ? left : 0;
}

/**
 * Cuál será el próximo escape (para mostrarle al usuario qué esperar)
 */
export function getNextEscapeConfig() {
  const count = getEscapeCount();
  if (count >= ESCAPE_CONFIG.length) return null;
  return ESCAPE_CONFIG[count];
}

/**
 * Activar un escape. Retorna info del escape aplicado, o null si no quedan.
 */
export function setEscape() {
  const count = getEscapeCount();
  if (count >= ESCAPE_CONFIG.length) return null;

  const config = ESCAPE_CONFIG[count];
  const until = Date.now() + config.hours * 60 * 60 * 1000;

  localStorage.setItem(ESCAPE_UNTIL_KEY, String(until));
  localStorage.setItem(ESCAPE_COUNT_KEY, String(count + 1));
  localStorage.setItem(ESCAPE_RESTRICTED_KEY, String(config.restricted));

  return {
    hours: config.hours,
    restricted: config.restricted,
    remaining: ESCAPE_CONFIG.length - (count + 1),
  };
}

/**
 * Limpiar el escape actual (no cuenta como "usado", solo lo revoca).
 * Útil para cuando el usuario completa el perfil.
 */
export function clearCurrentEscape() {
  localStorage.removeItem(ESCAPE_UNTIL_KEY);
  localStorage.removeItem(ESCAPE_RESTRICTED_KEY);
}

/**
 * Reset completo (solo para debugging o cuando se complete el perfil).
 */
export function resetEscapeState() {
  localStorage.removeItem(ESCAPE_UNTIL_KEY);
  localStorage.removeItem(ESCAPE_COUNT_KEY);
  localStorage.removeItem(ESCAPE_RESTRICTED_KEY);
}
