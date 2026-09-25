// ============================================
// NOOK — Validaciones de perfil (v5)
// Cubre: keywords, keywords+handle, handles sueltos,
// frases de redirección, emojis cámara, emails
// ============================================

function normalize(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.\-_*•·,;:!¡?¿"'()\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collapseSpacedLetters(text) {
  return text.replace(/\b(?:\w\s){3,}\w\b/g, (m) => m.replace(/\s+/g, ""));
}

function stripEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
}

function unmaskLeet(text) {
  return text
    .replace(/1/g, "i")
    .replace(/4/g, "a")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a");
}

// ============================================
// LISTAS
// ============================================

const SOCIAL_TERMS = [
  "instagram",
  "insta",
  "igram",
  "instgram",
  "instagran",
  "instagrm",
  "insgram",
  "instta",
  "intagram",
  "instá",
  "instà",
  "whatsapp",
  "whatsaap",
  "whastapp",
  "wasap",
  "guasap",
  "wasat",
  "telegram",
  "tlgrm",
  "tiktok",
  "tiktk",
  "tik tok",
  "snapchat",
  "snapch",
  "facebook",
  "fbook",
  "facebok",
  "twitter",
  "onlyfans",
  "fansly",
  "privacy",
  "linktree",
  "linktr",
  "link en bio",
  "linkbio",
  "link de mi bio",
  "link de la bio",
  "bio link",
  "sigueme",
  "sigueme en",
  "agregame",
  "agrégame",
  "buscame en",
  "búscame en",
  "buscame como",
  "búscame como",
  "me encuentras en",
  "me encuentras como",
  "escribeme al",
  "escribeme a",
  "escríbeme al",
  "escríbeme a",
  "mi user es",
  "mi usuario es",
  "mi user",
  "mi usuario",
  "mi numero es",
  "mi cel es",
  "paso mi numero",
  "paso mi cel",
  "te paso mi numero",
  "te doy mi numero",
  "mi redes",
  "mis redes",
  "mi celular",
  "mi telefono",
  "mi whats",
  "mi wha",
  "mi wpp",
  "la camarita",
  "la app de fotos",
  "app de fotos",
  "perfil de fotos",
  "colorcitos",
  "las fotitos",
  "mi perfil de la camara",
  "redes sociales",
  "mis redes sociales",
];

const SHORT_TERMS = [
  "ig",
  "ins",
  "inst",
  "wp",
  "wpp",
  "wsp",
  "tk",
  "tt",
  "sc",
  "fb",
  "tg",
  "of",
  "tlg",
  "snap",
  "tele",
  "whats",
  "wapp",
  "face",
  "arroba",
];

const AMIGO_TERMS = ["amix", "amixs", "amixes", "amigx", "amigxs", "amigues"];

// Frases que indican "te paso mi contacto"
const CONTACT_PHRASES = [
  "busca",
  "buscame",
  "búscame",
  "sigueme",
  "sígueme",
  "agrega",
  "agregame",
  "agrégame",
  "encuentra",
  "me encuentras",
  "encuentrame",
  "encuéntrame",
  "escribe",
  "escribeme",
  "escríbeme",
  "mi user",
  "mi usuario",
  "mi insta",
  "mi ig",
  "mi snap",
];

// ============================================
// REGEX
// ============================================

const URL_REGEX =
  /(https?:\/\/|www\.|\.com\b|\.co\b|\.net\b|\.org\b|\.io\b|\.me\b|\.gg\b|\.tv\b|\.app\b|\.link\b|\.xyz\b|\.site\b)/i;
const AT_REGEX = /@\s*[a-zA-Z0-9_.]{2,}/; // Detecta @usuario y @ usuario
const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_REGEX = /(\+?57)?[ -]?3[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{4}/;
const PHONE_INTERNATIONAL_REGEX = /\+\d{1,3}[ -]?\d{6,}/;
const PHONE_SPACED_REGEX = /(?:\d[ .\-]?){9,}/;

// Emojis cámara/video/foto
const CAMERA_EMOJIS = /[📷📸🎥📹🖼📱💻]/;

// Keyword + handle pegado
const KEYWORD_HANDLE_REGEX = new RegExp(
  `\\b(instagram|insta|inst|ins|ig|${AMIGO_TERMS.join("|")})\\b[^a-z0-9]{0,3}[a-z][a-z0-9._]{3,}`,
  "i",
);

// Frase de contacto + handle (aunque sea con "es" o similar)
const CONTACT_HANDLE_REGEX = new RegExp(
  `\\b(${CONTACT_PHRASES.map(escapeRegex).join("|")})\\b[^a-z]{0,8}(como|es|:|a)?\\s+[a-z][a-z0-9._]{3,}`,
  "i",
);

// ============================================
// Handle suelto al final
// ============================================
function detectHandleAtEnd(text) {
  if (!text) return null;
  const cleaned = stripEmojis(text).trim();
  if (!cleaned) return null;

  const words = cleaned.split(/\s+/);
  const last = words[words.length - 1];
  if (!last || last.length < 5 || last.length > 30) return null;

  const candidate = last.replace(/[.,!?;:]+$/, "").toLowerCase();

  // Regla A: tiene _ o . Y contiene números
  if (
    /^[a-z][a-z0-9]*[._][a-z0-9._]+$/.test(candidate) &&
    /\d/.test(candidate)
  ) {
    return last;
  }
  // Regla B: nombre + números al final
  if (/^[a-z]{5,}\d{2,}$/.test(candidate)) {
    return last;
  }
  // Regla C: NUEVA — nombre alargado con punto (ej: "dani.rojas")
  if (/^[a-z]{3,}\.[a-z]{3,}$/.test(candidate)) {
    return last;
  }

  return null;
}

// ============================================
// Handle con emoji cámara al lado
// Detecta: "📸 vivdelrojas", "vivdelrojas 📸"
// ============================================
function detectCameraEmojiHandle(text) {
  if (!text || !CAMERA_EMOJIS.test(text)) return null;
  const cleaned = text.replace(CAMERA_EMOJIS, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 4);
  for (const w of words) {
    const candidate = w.replace(/[.,!?;:]+$/, "").toLowerCase();
    // handle con _ o . + números, o nombre+números
    if (
      (/^[a-z][a-z0-9]*[._][a-z0-9._]+$/.test(candidate) &&
        /\d/.test(candidate)) ||
      /^[a-z]{5,}\d{2,}$/.test(candidate)
    ) {
      return w;
    }
  }
  return null;
}

// ============================================
// Detector de términos
// ============================================
function containsSocialTerm(text) {
  const cleaned = stripEmojis(text);
  const normalized = normalize(cleaned);
  const collapsed = normalize(collapseSpacedLetters(normalized));
  const unmasked = normalize(unmaskLeet(collapsed));
  const variants = [normalized, collapsed, unmasked];

  for (const term of SOCIAL_TERMS) {
    const nt = normalize(term);
    if (nt.length >= 5) {
      for (const v of variants) {
        if (v.includes(nt)) return term;
      }
    }
    const re = new RegExp(`(^|[\\s])${escapeRegex(nt)}([\\s]|$)`, "i");
    for (const v of variants) {
      if (re.test(v)) return term;
    }
  }

  for (const term of SHORT_TERMS) {
    const nt = normalize(term);
    const re = new RegExp(`(^|[\\s])${escapeRegex(nt)}([\\s]|$)`, "i");
    for (const v of variants) {
      if (re.test(v)) return term;
    }
  }

  return null;
}

// ============================================
// VALIDADORES
// ============================================
export function validateBio(bio) {
  if (!bio || bio.trim().length === 0) return { valid: true };

  if (bio.length > 500) {
    return {
      valid: false,
      ruleId: "bio_too_long",
      error: "La bio no puede superar 500 caracteres",
    };
  }

  if (URL_REGEX.test(bio)) {
    return {
      valid: false,
      ruleId: "bio_url",
      error: "La bio no puede incluir enlaces web",
    };
  }

  if (EMAIL_REGEX.test(bio)) {
    return {
      valid: false,
      ruleId: "bio_email",
      error: "La bio no puede incluir correos electrónicos",
    };
  }

  if (AT_REGEX.test(bio)) {
    return {
      valid: false,
      ruleId: "bio_at_user",
      error: "La bio no puede incluir @usuarios",
    };
  }

  // Emoji cámara + handle sospechoso
  const cameraHandle = detectCameraEmojiHandle(bio);
  if (cameraHandle) {
    return {
      valid: false,
      ruleId: "bio_camera_handle",
      error:
        "La bio no puede combinar emojis de cámara con usuarios de otras apps",
    };
  }

  // Emoji cámara solo (sin handle) → aviso preventivo
  if (CAMERA_EMOJIS.test(bio) && !cameraHandle) {
    // No bloqueamos por emoji solo, dejamos pasar
  }

  // Keyword + handle pegado
  if (KEYWORD_HANDLE_REGEX.test(bio)) {
    return {
      valid: false,
      ruleId: "bio_social_network",
      error: "La bio no puede incluir redes sociales ni usuarios de otras apps",
    };
  }

  // Frase de contacto + handle
  if (CONTACT_HANDLE_REGEX.test(bio)) {
    return {
      valid: false,
      ruleId: "bio_contact_handle",
      error: "La bio no puede incluir formas de contacto externas",
    };
  }

  // Handle suelto al final
  const handleAtEnd = detectHandleAtEnd(bio);
  if (handleAtEnd) {
    return {
      valid: false,
      ruleId: "bio_handle_suspicious",
      error: "La bio no puede terminar con un usuario sospechoso de red social",
    };
  }

  // Detección estándar
  const socialTerm = containsSocialTerm(bio);
  if (socialTerm) {
    return {
      valid: false,
      ruleId: "bio_social_network",
      error: `La bio no puede incluir referencias a "${socialTerm}"`,
    };
  }

  if (
    PHONE_REGEX.test(bio) ||
    PHONE_INTERNATIONAL_REGEX.test(bio) ||
    PHONE_SPACED_REGEX.test(bio)
  ) {
    return {
      valid: false,
      ruleId: "bio_phone",
      error: "La bio no puede incluir números de teléfono",
    };
  }

  return { valid: true };
}

export function validateName(name) {
  if (!name || name.trim().length < 2) {
    return {
      valid: false,
      ruleId: "name_too_short",
      error: "El nombre debe tener al menos 2 caracteres",
    };
  }
  if (name.trim().length > 40) {
    return {
      valid: false,
      ruleId: "name_too_long",
      error: "El nombre es muy largo (máx. 40)",
    };
  }
  if (
    URL_REGEX.test(name) ||
    AT_REGEX.test(name) ||
    EMAIL_REGEX.test(name) ||
    containsSocialTerm(name)
  ) {
    return {
      valid: false,
      ruleId: "name_has_social",
      error: "El nombre no puede incluir enlaces ni redes",
    };
  }
  return { valid: true };
}

export function validateTagline(tagline) {
  if (!tagline || tagline.length === 0) return { valid: true };
  if (tagline.length > 60) {
    return {
      valid: false,
      ruleId: "tagline_too_long",
      error: "La tagline es muy larga (máx. 60)",
    };
  }
  if (
    URL_REGEX.test(tagline) ||
    AT_REGEX.test(tagline) ||
    EMAIL_REGEX.test(tagline) ||
    PHONE_REGEX.test(tagline) ||
    containsSocialTerm(tagline) ||
    KEYWORD_HANDLE_REGEX.test(tagline) ||
    CONTACT_HANDLE_REGEX.test(tagline) ||
    detectHandleAtEnd(tagline) ||
    detectCameraEmojiHandle(tagline)
  ) {
    return {
      valid: false,
      ruleId: "tagline_has_social",
      error: "La tagline no puede incluir enlaces, redes ni teléfonos",
    };
  }
  return { valid: true };
}

export function validateCity(city) {
  if (!city || city.trim().length === 0) return { valid: true };
  if (city.length > 30) {
    return {
      valid: false,
      ruleId: "city_too_long",
      error: "El nombre de la ciudad es muy largo",
    };
  }
  return { valid: true };
}
