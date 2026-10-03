# Estrategia de Arquitectura - Nook v1.0

## 1. Visión Evolutiva de Nook

Nook **no es una app de citas tradicional** ni **Facebook de citas**. Es una **plataforma de conexión humana consciente y estructurada** que combina:

- Descubrimiento inteligente
- Mensajería segura
- Comunidad de calidad
- Experiencia emocional cálida

---

## 2. Modelo Arquitectónico: Las 4 Capas de Conexión

### Capa 1: Descubrimiento Contextual 🔍

**Propósito:** Presentar perfiles con intención, no solo visualmente.

**Componentes:**
- Feed inteligente (no infinito)
- Filtros contextuales (intención, edad, ubicación, intereses)
- Perfiles con "mini-historias" (quién soy, qué busco, por qué estoy aquí)
- Validación de perfil obligatoria
- Fotos verificadas

**Diferencia vs tradicional:**
- No es swipe dopamínico
- Cada perfil tiene contexto real
- Filtros previos a interacción
- Menos ruido, más claridad

---

### Capa 2: Interacción Consciente ❤️

**Propósito:** Crear decisiones deliberadas, no impulsivas.

**Componentes:**
- Like / Pass / Favorito (decisiones claras)
- Visualización de intención del otro usuario
- Match bidireccional (ambos dieron like)
- Coincidencias reales (no fantasmas)
- Notificaciones claras del match
- Historial de interacciones

**Diferencia vs tradicional:**
- No hay mensajes no solicitados
- Match = consentimiento mutuo
- Intención visible desde el inicio
- Menos rechazo emocional, más claridad

---

### Capa 3: Mensajería con Propósito 💬

**Propósito:** Conversaciones reales, no spam.

**Componentes:**
- DMs 1-a-1 solo después de match
- Historial de conversación persistente
- Indicadores de intención (nivel de seriedad)
- Validación de perfil antes de mensajería
- Reportes/bloqueo fácil
- Presencia/estado en línea
- Escritura en vivo (typing indicator)

**Diferencia vs tradicional:**
- No es como WhatsApp ni Telegram
- No hay contactos anónimos
- Conversación con propósito real
- Seguridad como prioridad

---

### Capa 4: Comunidad y Conexiones 🤝

**Propósito:** Mantener y fortalecer relaciones reales.

**Componentes:**
- Panel de "Conexiones Activas"
- Grupos/Comunidades por interés (pequeños, curados)
- Reputación basada en feedback (1-5 estrellas)
- Encuentros offline opcionales
- Timeline de conexiones
- Seguimiento de relación ("hablando con", "conociendo", "en pareja")

**Diferencia vs tradicional:**
- No es followers masivo
- Es relación bidireccional
- Comunidad pequeña y de calidad
- Posibilidad de evolucionar la relación

---

## 3. Comparativa: Nook vs Plataformas Existentes

| Aspecto | Tinder | Facebook | WhatsApp | **Nook** |
|---------|--------|----------|----------|---------|
| Flujo primario | Swipe infinito | Feed masivo | Chats directos | Descubrimiento → Match → Conversación |
| Conexión | Unidireccional | Seguidores | Contactos | Match bidireccional |
| Validación | Débil | Media | Fuerte | **Muy fuerte** |
| Acceso a DMs | Inmediato (spam) | Después de amistad | Contacto previo | **Solo post-match** |
| Objetivo | Encuentros rápidos | Engagement | Mensajería | **Conexión real y duradera** |
| Comunidad | Ninguna | Masiva | Pares | **Pequeña y cuidada** |
| Emocional | Superficial | Consumo | Funcional | **Cálido y seguro** |

---

## 4. Flujo de Usuario Ideal

```
1. REGISTRO & ONBOARDING
   ├─ Email/Contraseña
   ├─ Completar perfil (bio, fotos, intereses)
   ├─ Validar identidad (foto de verificación)
   └─ Definir intención clara ("Busco relación seria", "Algo casual", etc.)

2. DESCUBRIMIENTO
   ├─ Filtrar por criterios (edad, ubicación, intereses)
   ├─ Ver perfiles con contexto
   ├─ Leer mini-bio + "por qué estoy aquí"
   └─ Decidir: Like / Pass / Favorito

3. MATCH & NOTIFICACIÓN
   ├─ Verificar si el otro usuario también dio like
   ├─ Match bidireccional = conversación desbloqueada
   └─ Notificación clara del match

4. CONVERSACIÓN
   ├─ DM abierto con match
   ├─ Mensajes seguros y persistentes
   ├─ Indicadores de intención del otro usuario
   ├─ Opción de reportar o bloquear
   └─ Conversación creciente

5. CONEXIÓN REAL
   ├─ Posibilidad de intercambiar contacto
   ├─ Encuentro offline opcional
   ├─ Feedback de reputación
   └─ Opción de mantener conexión activa

6. COMUNIDAD (Futuro)
   ├─ Unirse a grupos de interés
   ├─ Eventos comunitarios
   └─ Relaciones de largo plazo
```

---

## 5. Arquitectura Técnica Recomendada

### Frontend (React + Vite)
```
src/
├── pages/
│   ├── Auth/
│   │   ├── Register.tsx
│   │   ├── Login.tsx
│   │   └── Onboarding.tsx
│   ├── Discovery/
│   │   ├── Feed.tsx
│   │   ├── ProfileDetail.tsx
│   │   └── Search.tsx
│   ├── Matches/
│   │   ├── MatchList.tsx
│   │   └── MatchDetail.tsx
│   ├── Messages/
│   │   ├── MessageList.tsx
│   │   └── MessageThread.tsx
│   ├── Connections/
│   │   ├── ActiveConnections.tsx
│   │   ├── Groups.tsx
│   │   └── Reputation.tsx
│   ├── Profile/
│   │   ├── MyProfile.tsx
│   │   └── EditProfile.tsx
│   └── Admin/
│       ├── Moderation.tsx
│       ├── Reports.tsx
│       └── Dashboard.tsx
├── components/
│   ├── Discovery/
│   ├── Messages/
│   ├── Connections/
│   ├── Common/
│   └── Admin/
├── hooks/
│   ├── useAuth.ts
│   ├── useDiscovery.ts
│   ├── useMessages.ts
│   └── useConnections.ts
├── store/
│   ├── authStore.ts
│   ├── discoveryStore.ts
│   ├── messagesStore.ts
│   └── connectionsStore.ts
├── services/
│   ├── supabaseClient.ts
│   ├── authService.ts
│   ├── discoveryService.ts
│   ├── matchesService.ts
│   ├── messagesService.ts
│   └── connectionsService.ts
└── types/
    ├── index.ts
    └── database.ts
```

### Backend (Supabase)

**Tablas principales:**
- `users` (perfil, intención, validación)
- `profiles` (fotos, bio, intereses)
- `likes` (usuario, perfil target, timestamp)
- `matches` (usuario1, usuario2, fecha_match)
- `messages` (match_id, remitente, contenido, timestamp)
- `connections` (relación bidireccional entre usuarios)
- `groups` (comunidades por interés)
- `reports` (denuncias de usuarios)
- `feedback` (reputación 1-5 estrellas)

**Funciones y Políticas:**
- RLS (Row Level Security) para privacidad
- Real-time subscriptions para mensajes
- Validación de identidad
- Moderación automática

---

## 6. Funcionalidades Prioritarias (MVP)

### Phase 1: Core Connection (Semanas 1-4)
- ✅ Auth (login/register/email verification)
- ✅ Onboarding y creación de perfil
- ✅ Feed de descubrimiento con filtros
- ✅ Like/Pass/Favorito
- ✅ Sistema de match bidireccional
- ✅ Notificaciones básicas

### Phase 2: Messaging (Semanas 5-8)
- ✅ DMs 1-a-1 post-match
- ✅ Historial de conversación
- ✅ Indicadores de intención
- ✅ Reportes y bloqueo
- ✅ Real-time messaging

### Phase 3: Connections (Semanas 9-12)
- ✅ Panel de conexiones activas
- ✅ Sistema de reputación
- ✅ Búsqueda avanzada
- ✅ Estado de relación

### Phase 4: Community (Semanas 13+)
- ⏳ Grupos por interés
- ⏳ Eventos
- ⏳ Timeline social
- ⏳ Recomendaciones por IA

---

## 7. Principios de Diseño y UX

### Estética
- Paleta: Verde menta, tonos cálidos, neutros limpios
- Tipografía: Moderna, legible, humana
- Espaciado: Generoso, no abarrotado
- Componentes: Suaves, redondeados, accesibles

### Microinteracciones
- Animaciones suaves en like/pass
- Notificación clara en matches
- Feedback de escritura
- Transiciones coherentes

### Tono de voz
- Cercano y humano
- No superficial
- Seguro y confiable
- Empático

---

## 8. Seguridad y Moderación

### Validación de Identidad
- Foto de verificación facial
- Correo verificado
- Número telefónico opcional
- Validación de intereses creíbles

### Reportes y Moderación
- Reportar perfil o mensajes
- Bloqueo bidireccional
- Dashboard de admin
- Políticas de comunidad claras
- Bans automáticos/manuales

### Privacidad
- RLS en base de datos
- Encriptación de mensajes
- Datos no compartidos con terceros
- Opción de borrar cuenta

---

## 9. Métricas de Éxito

### Engagement
- % de usuarios completando onboarding
- % de matches generados
- Mensaje promedio por conversación
- Duración media de conversación

### Retención
- DAU (Daily Active Users)
- MAU (Monthly Active Users)
- Churn rate
- Lifetime Value

### Calidad
- % de perfiles validados
- Tasa de reportes
- Feedback promedio (reputación)
- Satisfacción de usuario

### Comunidad
- Crecimiento organico vs pagado
- NPS (Net Promoter Score)
- Tasa de recomendación
- Diversidad de usuarios

---

## 10. Roadmap Temporal

### Mes 1: MVP de Descubrimiento + Match
- Autenticación
- Perfiles
- Feed
- Like/Pass/Match

### Mes 2: Messaging MVP
- DMs seguros
- Historial
- Notificaciones real-time

### Mes 3: Polish + Launch Beta
- Seguridad reforzada
- Validación de identidad
- Moderación
- UX mejorada

### Mes 4: Conexiones y Reputación
- Sistema de reputación
- Búsqueda avanzada
- Estado de relación

### Mes 5+: Comunidad y Escala
- Grupos
- Eventos
- Recomendaciones
- Mobile app

---

## 11. Diferenciadores Competitivos de Nook

1. **Autenticidad forzada** → Validación de identidad obligatoria
2. **Intención clara** → Cada usuario define qué busca
3. **Match bidireccional** → No hay acoso, hay consentimiento
4. **Conversación primero** → El propósito es hablar, no solo swipear
5. **Comunidad pequeña** → Calidad sobre cantidad
6. **Seguridad por defecto** → No es un "plus", es la base
7. **Emocional, no dopamínico** → Diseño para relaciones, no para engagement vaciuo

---

## 12. Conclusión

Nook es una **alternativa consciente** a las plataformas de conexión superficiales.

No busca maximizar engagement mediante ruido, sino crear un **espacio donde las personas puedan construir conexiones reales** con confianza, claridad y calidez.

La arquitectura refleja esto: cada capa (descubrimiento, interacción, mensajería, comunidad) está diseñada para reforzar la autenticidad y la seguridad.

---

**Próximos pasos:**
1. Validar esta arquitectura con stakeholders
2. Crear wireframes de las 4 capas
3. Definir especificación técnica detallada
4. Iniciar desarrollo de Phase 1 (Discovery + Match)
