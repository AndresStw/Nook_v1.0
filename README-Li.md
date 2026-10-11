<div align="center">

# 🌿 Nook

**Conexiones reales. Personas reales.**

Una app de citas que apuesta por lo contrario al swipe.
Aquí primero hablas, luego decides.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-1.6.1--beta-14E5C0.svg)](./src/lib/changelog.js)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8.svg)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E.svg)](https://supabase.com)

</div>

---

## 🌱 ¿Qué es Nook?

Nook no es otro Tinder. Es una postura.

La mayoría de las apps de citas te hacen elegir por foto, en 3 segundos, sin contexto. Nook invierte ese orden: **esconde las fotos hasta que ambos se eligen**, y pone en el centro las respuestas, los intereses y las conversaciones.

> _"Primero hablas, luego decides."_

### El pivote de identidad

A partir de la versión **1.6.1-beta**, Nook da un giro explícito:

| Antes | Ahora |
| :--- | :--- |
| Fotos claras por defecto | 🔒 Fotos **borrosas** hasta el match |
| Like / Pass ilimitado | 🎯 **15 swipes/día** máximo |
| Blind Chat como feature secundaria | 💬 Blind Chat como **camino principal** |
| "Otro Tinder más" | "Aquí te conocen por lo que dices" |

---

## ✨ Features principales

### 🎭 Citas a ciegas (Blind Chat)
El corazón de Nook. Dos usuarios se emparejan sin ver fotos, con un límite de tiempo (5 min) y una decisión de doble consentimiento: solo si **ambos aceptan** se revelan las fotos y se abre un chat real.

- ⏱️ Fases: `reading` → `deciding` → `revealing` → `result`
- 🤝 Doble consentimiento (match solo si ambos votan sí)
- 🚨 Botón de pánico con razones (`left_bored`, `left_rude`, `left_emergency`)
- 🔒 Moderación 3 capas: filtros automáticos + reputación + reportes

### 🌫️ Fotos borrosas hasta el match
En Feed, Explore y perfiles públicos, las fotos se muestran con `blur(24px)` hasta que hay match activo. La foto se revela con un fade suave de 600ms.

### 🎯 Límite diario de swipes
15 swipes por día (juntos entre Feed y Explore). Al agotarlos, la app empuja hacia Blind Chat, que no tiene límite.

### ⭐ Respuestas destacadas
En el Feed, cada perfil muestra **1 respuesta destacada + 2 secundarias** elegidas por el usuario. Las respuestas son, literalmente, su foto.

### 💎 Sistema de PI (Puntos de Interacción)
- Login diario escalonado por racha (10 → 30 PI)
- Desbloqueos: fotos extra a 3.000 PI, video de presentación a 5.000 PI
- Descubrimientos one-time (visitar secciones, leer changelog, políticas)
- Recompensa por lectura de documentos legales (+300 PI por 2 min)

### 🎃 Eventos de temporada
Sistema de eventos configurables desde la DB (`event_seasons`). Halloween 2026 con posts, likes, comentarios, reportes y auto-archivado post-evento.

### 🛡️ Seguridad primero
- Onboarding con 60s obligatorios de reglas de seguridad
- Detección de redes sociales en bio y primeros mensajes
- Sistema de 3 corazones (perder 1 por reporte confirmado, ban a 0)
- Reportes anónimos con múltiples categorías
- Verificación con selfie + gesto único

### 🎨 Personalización
8 temas de color (menta, ámbar, violeta, coral, azul, dorado, rosa, default).

---

## 🧱 Stack técnico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 19 + Vite |
| **Estilos** | Tailwind CSS v4 (CSS-first) |
| **Estado global** | Zustand |
| **Backend** | Supabase (Postgres + Auth + Realtime + Storage) |
| **Routing** | React Router v6 |
| **Iconos** | lucide-react |
| **Sonidos** | SoundManager propio (preload + unlock) |
| **Deploy** | Vercel |

---

## 🚀 Instalación local

### Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9 (o pnpm/yarn)
- Cuenta de **Supabase** con un proyecto creado

### Pasos

```bash
# 1. Clonar
git clone https://github.com/<tu-usuario>/Noock.git
cd Noock

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env.local con tus credenciales de Supabase
cp .env.example .env.local
# Editar .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 4. Levantar en desarrollo
npm run dev
```

La app estará en `http://localhost:5173`.

---

## 🔑 Variables de entorno

Creá `.env.local` en la raíz con:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

> ⚠️ **Nunca** subas `.env.local` al repo. Ya está en `.gitignore`.

---

## 🗄️ Base de datos

Nook usa **Supabase (Postgres)**. Las migraciones y RPCs están pensadas para correr en el SQL Editor.

### Orden sugerido de aplicación

1. **Schema base** (tablas: `users`, `photos`, `interests`, `questions`, `matches`, `messages`, etc.)
2. **RLS policies** (todas las tablas tienen RLS habilitado)
3. **RPCs** de perfiles, likes, matches, chats
4. **RPCs de Blind Chat** (`start_blind_chat`, `respond_blind_invite`, `expire_blind_invite`, `respond_to_blind_chat`, `abandon_blind_chat`, `get_blind_chats`, `get_blind_profile`, `maybe_trigger_chispazo`)
5. **RPCs de PI** (`claim_daily_login`, `claim_discovery`, `claim_legal_read`, etc.)
6. **RPCs de eventos** (`can_post_event_today`, `create_event_post`, `review_event_post`, etc.)
7. **RPCs de admin** (`get_admin_stats`, `get_admin_metrics`, `broadcast_support_message`, etc.)

### Storage buckets

- `user-photos` (público, 5MB, jpg/png/webp)
- `user-videos` (público, 25MB, mp4/webm/mkv, máx 15s)
- `event-photos` (público, 5MB, jpg/png/webp)

---

## 📁 Estructura del proyecto

```
src/
├── assets/Css/          # CSS específico (landing, login, onboarding, myprofile)
├── components/
│   ├── admin/           # AdminGateModal, MetricsPanel
│   ├── auth/            # ProtectedRoute, AdminRoute, animaciones
│   ├── blind/           # BlindChatInvite, BlindChatPanicButton
│   ├── chat/            # ChatPanel, ChatOptionsMenu
│   ├── daily/           # DailyLoginBanner
│   ├── discover/        # DiscoverCard, ProfileDetails, etc.
│   ├── events/          # EventPostCard, EventUploadModal, etc.
│   ├── feed/            # NewsBanner
│   ├── layout/          # AppLayout, Sidebar, Topbar, BottomNav
│   ├── legal/           # LegalModal, PrivacyContent, TermsContent
│   ├── onboarding/      # Steps 1-7 del onboarding
│   ├── support/         # SupportMessageBanner
│   └── ui/              # Logo, PiBadge, DiscoveryToast, etc.
├── contexts/            # ThemeContext
├── hooks/               # Hooks personalizados (useAuth, useFeed, etc.)
├── lib/                 # supabase.js, sounds.js, changelog.js, alerts.js
├── pages/               # Páginas (Feed, Explore, Messages, AdminPanel, etc.)
├── stores/              # Zustand stores (onboardingStore)
├── App.jsx              # Router principal
├── index.css            # Tema Nook + Tailwind
└── main.jsx             # Entry point
```

---

## 🛠️ Scripts disponibles

```bash
npm run dev       # Desarrollo con HMR
npm run build     # Build de producción
npm run preview   # Preview del build local
npm run lint      # ESLint
```

---

## 📝 Convenciones de código

- **Componentes:** PascalCase (`DiscoverCard.jsx`)
- **Hooks:** camelCase con prefijo `use` (`useAuth.js`)
- **CSS custom properties:** `--color-*`, `--shadow-*`, `--font-*` (definidas en `index.css`)
- **RPCs Supabase:** `snake_case` (ej: `start_blind_chat`)
- **Commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Sin `alert()` ni `confirm()` nativos** — usar `src/lib/alerts.js`

---

## 🧭 Roadmap

Ver el changelog completo dentro de la app (dropdown del usuario → **Historial de versión**).

**Última versión:** `1.6.1-beta` — *Pivote de identidad: "Primero hablas, luego decides."*

**Próximas fases:**
- [ ] Fase 5: Notificación `/feed` con delay 6s + cooldown 24h
- [ ] Fase 6: Métricas admin (retención D1, conversión, participación)
- [ ] Fase 7: Auto-borrado de fotos post-evento

**Deuda técnica conocida:**
- [ ] Blind Chat: RPCs `start_blind_chat` y `respond_to_blind_chat` requieren verificación en DB fresca
- [ ] RLS a revisar: `user_answers`, `blind_chats`, `events`
- [ ] `maybe_trigger_chispazo` dispara múltiples veces por carga
- [ ] Activar protección de contraseñas filtradas en Supabase Auth

---

## 🤝 Contribuir

Nook nació como un proyecto personal, pero está abierto a colaboraciones que **respeten su visión**.

**Antes de abrir un PR:**

1. Leé la sección de **Filosofía del proyecto** (arriba).
2. Revisá el **changelog** para entender el pivote de identidad de 1.6.1.
3. Abrí un **issue** primero describiendo qué querés cambiar y por qué.
4. Mantené el estilo del código (naming, comentarios con tono Nook).

**NO se aceptan contribuciones que:**
- Vuelvan a hacer las fotos visibles por defecto
- Quiten el límite de swipes
- Conviertan Blind Chat en algo opcional o "premium"
- Agreguen tracking o analytics invasivos

---

## 📄 Licencia

**Nook** está licenciado bajo **GNU Affero General Public License v3.0 (AGPL-3.0)**.

```
Copyright (C) 2026 Kevin Landazuri <nook.admin.bogota@gmail.com>

Este programa es software libre: puedes redistribuirlo y/o modificarlo
bajo los términos de la Licencia Pública General Affero de GNU publicada
por la Free Software Foundation, ya sea la versión 3 de la Licencia, o
(a tu elección) cualquier versión posterior.

Este programa se distribuye con la esperanza de que sea útil, pero
SIN NINGUNA GARANTÍA; incluso sin la garantía implícita de
COMERCIABILIDAD o IDONEIDAD PARA UN PROPÓSITO PARTICULAR. Ver la
Licencia Pública General Affero de GNU para más detalles.

Deberías haber recibido una copia de la Licencia Pública General Affero
de GNU junto con este programa. Si no, ve a
<https://www.gnu.org/licenses/>.
```

### ¿Qué significa esto en la práctica?

La AGPL es una licencia **copyleft fuerte**, diseñada específicamente para software que se ofrece como servicio.

- ✅ **Podés:** usar, estudiar, modificar y redistribuir Nook libremente.
- ✅ **Podés:** ofrecer un servicio basado en Nook, incluso comercialmente.
- ⚠️ **Debés:** si modificás Nook **y lo ofrecés como servicio a través de una red**, estás obligado a **publicar el código fuente completo** de tu versión modificada bajo la misma licencia AGPL-3.0.
- ❌ **No podés:** crear una versión cerrada y privada de Nook y ofrecerla como SaaS sin contribuir tus mejoras.

> La AGPL evita el caso "Amazon toma tu código, lo cierra y lo vende" que la GPL tradicional no cubre.

### ¿Por qué AGPL y no MIT?

Nook tiene una **visión social clara** que no queremos que alguien cierre y pervierta. Con AGPL, cualquier mejora que se ofrezca al público **vuelve a la comunidad**.

Si querés una versión comercial de Nook sin las obligaciones de la AGPL, se puede negociar una **licencia dual** — contactame.

---

## 💚 Créditos

Hecho con cariño en Bogotá, Colombia.

- **Fundador y desarrollador:** Kevin
- **Diseño y filosofía:** Comunidad Nook
- **Stack:** React, Vite, Tailwind, Supabase

---

<div align="center">

**"Aquí no se trata de deslizar, se trata de conectar."**

[🌿 Volver arriba](#-nook)

</div>
