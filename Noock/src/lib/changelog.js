// src/lib/changelog.js
// ============================================
// NOOK — Historial de versiones
// ============================================

export const CURRENT_VERSION = "1.6.1-beta";

export const CHANGELOG = [
  {
    version: "1.6.1-beta",
    date: "2026-10-15",
    label: "Pivote de identidad",
    title: "Primero hablas, luego decides",
    summary:
      "Nook deja de ser un swipe más. Ahora las fotos se esconden hasta el match, hay un límite diario de 15 swipes, y las Citas a Ciegas pasan a ser el camino principal.",
    added: [
      "🔒 Fotos borrosas hasta el match — en Feed, Explore y perfiles públicos",
      "🎯 Límite de 15 swipes/día (juntos entre Feed y Explore)",
      "💬 Blind Chat como acción principal: botón 'Hablar primero' en Feed y Explore",
      "⭐ Respuestas destacadas — 1 principal + 2 secundarias visibles en el Feed",
      "🔔 Notificación en /feed con cartas del fundador (delay 6s, cooldown 24h)",
      "📊 Panel de métricas admin: retención D1, conversión a mensaje, participación en eventos",
      "🎃 Auto-archivado post-evento: aviso 3 días antes + opción de descarga",
      "📜 Modales de Políticas y Privacidad con +300 PI por lectura",
      "🎁 Recompensa diaria por login con racha escalonada (+10 a +30 PI)",
    ],
    improved: [
      "Landing y onboarding reescritos para reflejar la nueva identidad",
      "Copy de 'respuestas son tu foto' en Step5Answers y MyProfile",
      "Perfil público oculta video y galería hasta el match",
      "Blind chat creado desde Feed/Explore sin consumir swipe",
      "Chat post-match muestra fotos claras (el revelado ya ocurrió)",
      "Sincronización estricta de respuestas (máx 150 caracteres en todos lados)",
      "Botón 'Hablar primero' con like silencioso — sin consumir swipe",
    ],
    fixed: [
      "Bug de HTML inválido en EventPostCard (<button> anidado)",
      "Bug de límite inconsistente: MyProfile tenía 30 chars, onboarding 150",
      "403 en maybe_trigger_chispazo (permisos + SECURITY DEFINER)",
      "Doble disparo del chispazo en StrictMode (sessionStorage flag)",
      "useNavigate faltante en Explore (crasheaba al clickear el banner)",
      "handleAbandon en BlindChatView sin feedback diferenciado por razón",
      "Imports huérfanos y divs vacíos en Feed",
    ],
    knownBugs: [
      "En iOS Safari, el teclado a veces tapa el input en chats ciegos",
      "El dropdown de temas puede cortarse en pantallas muy pequeñas",
      "La descarga de múltiples archivos archivados puede tardar en Safari",
    ],
  },
  {
    version: "1.6.0-beta",
    date: "2026-09-30",
    label: "Beta release",
    title: "Chispazos y sistema de PI",
    summary:
      "Citas a ciegas, verificación de perfil, temas personalizables y un sistema de reputación que premia el respeto.",
    added: [
      "Chispazo: cita a ciegas de 5 minutos sin ver fotos",
      "Sistema de PI (Puntos de Interacción) con niveles",
      "Verificación de perfil con selfie + gesto único",
      "8 temas de color personalizables",
      "Botón de pánico en chats y perfiles",
      "Historial de versiones (estás aquí 👋)",
    ],
    improved: [
      "Detección de redes sociales en bio y primeros mensajes",
      "Moderación de reportes con sistema de 3 corazones",
      "Notificaciones en tiempo real",
      "Perfil completo (75%) requerido para interactuar",
    ],
    fixed: [
      "Bug al enviar mensajes con respuesta citada",
      "Fotos cortadas en vista móvil (punto focal)",
      "Logout que no limpiaba el estado correctamente",
    ],
    knownBugs: [
      "En iOS Safari, el teclado a veces tapa el input en chats ciegos",
      "Fotos tardan en cargar con conexiones lentas",
      "El dropdown de temas puede cortarse en pantallas muy pequeñas",
    ],
  },
  {
    version: "1.5.0-beta",
    date: "2026-09-15",
    title: "Eventos y Fundador",
    summary: "Primera estructura de eventos y panel de administrador.",
    added: [
      "Estructura base de eventos dentro de la app",
      "Panel de administrador (solo fundador)",
      "Mensajes directos al fundador con contexto técnico",
      "Sistema de reportes con múltiples categorías",
    ],
    improved: ["Gestión de conexiones agrupadas (nuevos, activos, archivados)"],
    fixed: [
      "Error al cambiar tema después del logout",
      "Fotos que no se actualizaban en tiempo real",
    ],
    knownBugs: [],
  },
  {
    version: "1.0.0-alpha",
    date: "2026-08-20",
    title: "Nace Nook 🌱",
    summary: "Primera versión funcional con lo básico del concepto.",
    added: [
      "Registro e inicio de sesión",
      "Onboarding guiado de 7 pasos",
      "Feed con swipe de perfiles",
      "Matches y chat básico",
      "Preguntas y respuestas para romper el hielo",
      "Intereses para conectar con gente afín",
    ],
    improved: [],
    fixed: [],
    knownBugs: [],
  },
];
