# Wireframes: Nook en Web y Mobile

## 1. Vista Web Desktop - Discovery Feed

```svg
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="800" fill="#f5f5f5"/>
  
  <!-- Header -->
  <rect width="1200" height="70" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="40" cy="35" r="20" fill="#1db584"/>
  <text x="70" y="40" font-size="24" font-weight="bold" fill="#333">Nook</text>
  
  <!-- Navigation Tabs -->
  <text x="300" y="40" font-size="14" font-weight="bold" fill="#1db584">Descubrimiento</text>
  <text x="500" y="40" font-size="14" fill="#999">Favoritos</text>
  <text x="700" y="40" font-size="14" fill="#999">Mensajes</text>
  <text x="900" y="40" font-size="14" fill="#999">Conexiones</text>
  <text x="1100" y="40" font-size="14" fill="#999">Perfil</text>
  
  <!-- Left Sidebar - Filtros -->
  <rect x="10" y="80" width="200" height="700" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="20" y="110" font-size="14" font-weight="bold" fill="#333">Filtros</text>
  
  <!-- Filter boxes -->
  <rect x="20" y="130" width="180" height="35" rx="4" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="155" font-size="12" fill="#666">Edad: 25-35</text>
  
  <rect x="20" y="175" width="180" height="35" rx="4" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="200" font-size="12" fill="#666">Ubicación: Lima</text>
  
  <rect x="20" y="220" width="180" height="35" rx="4" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="245" font-size="12" fill="#666">Intención: Relación</text>
  
  <rect x="20" y="265" width="180" height="35" rx="4" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="290" font-size="12" fill="#666">Intereses: Viajes</text>
  
  <!-- Main Feed -->
  <rect x="220" y="80" width="950" height="700" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  
  <!-- Profile Card 1 -->
  <rect x="240" y="100" width="420" height="320" rx="8" fill="#f9f9f9" stroke="#ddd" stroke-width="1"/>
  
  <!-- Profile Image Placeholder -->
  <rect x="240" y="100" width="200" height="200" rx="8" fill="#d4d4d4"/>
  <text x="340" y="200" font-size="14" fill="#999">Foto</text>
  
  <!-- Profile Info -->
  <text x="260" y="330" font-size="16" font-weight="bold" fill="#333">Sofia, 28</text>
  <text x="260" y="355" font-size="12" fill="#666">📍 Lima, Perú</text>
  <text x="260" y="375" font-size="12" fill="#666">Busco: Relación seria</text>
  <text x="260" y="395" font-size="11" fill="#999">"Amo viajar, leer y conocer gente auténtica"</text>
  
  <!-- Action Buttons -->
  <circle cx="280" cy="420" r="20" fill="#ff6b6b" stroke="#ff5252" stroke-width="2"/>
  <text x="275" y="425" font-size="14" fill="#fff">✕</text>
  
  <circle cx="340" cy="420" r="20" fill="#ffd700" stroke="#ffc800" stroke-width="2"/>
  <text x="335" y="425" font-size="14" fill="#fff">★</text>
  
  <circle cx="400" cy="420" r="20" fill="#1db584" stroke="#16a366" stroke-width="2"/>
  <text x="395" y="425" font-size="14" fill="#fff">♥</text>
  
  <!-- Profile Card 2 -->
  <rect x="680" y="100" width="420" height="320" rx="8" fill="#f9f9f9" stroke="#ddd" stroke-width="1"/>
  
  <rect x="680" y="100" width="200" height="200" rx="8" fill="#d4d4d4"/>
  <text x="780" y="200" font-size="14" fill="#999">Foto</text>
  
  <text x="700" y="330" font-size="16" font-weight="bold" fill="#333">Martina, 26</text>
  <text x="700" y="355" font-size="12" fill="#666">📍 Miraflores, Lima</text>
  <text x="700" y="375" font-size="12" fill="#666">Busco: Conocer gente</text>
  <text x="700" y="395" font-size="11" fill="#999">"Fotógrafa, amante del café y conversas"</text>
  
  <!-- Action Buttons -->
  <circle cx="720" cy="420" r="20" fill="#ff6b6b" stroke="#ff5252" stroke-width="2"/>
  <text x="715" y="425" font-size="14" fill="#fff">✕</text>
  
  <circle cx="780" cy="420" r="20" fill="#ffd700" stroke="#ffc800" stroke-width="2"/>
  <text x="775" y="425" font-size="14" fill="#fff">★</text>
  
  <circle cx="840" cy="420" r="20" fill="#1db584" stroke="#16a366" stroke-width="2"/>
  <text x="835" y="425" font-size="14" fill="#fff">♥</text>
  
  <!-- Matches Section -->
  <text x="240" y="465" font-size="14" font-weight="bold" fill="#333">✓ Tienes 3 matches</text>
  
  <!-- Match Cards -->
  <circle cx="270" cy="510" r="25" fill="#d4d4d4" stroke="#1db584" stroke-width="2"/>
  <text x="265" y="515" font-size="10" fill="#666">👤</text>
  <text x="265" y="535" font-size="11" fill="#333">Ana</text>
  
  <circle cx="340" cy="510" r="25" fill="#d4d4d4" stroke="#1db584" stroke-width="2"/>
  <text x="335" y="515" font-size="10" fill="#666">👤</text>
  <text x="330" y="535" font-size="11" fill="#333">Laura</text>
  
  <circle cx="410" cy="510" r="25" fill="#d4d4d4" stroke="#1db584" stroke-width="2"/>
  <text x="405" y="515" font-size="10" fill="#666">👤</text>
  <text x="400" y="535" font-size="11" fill="#333">Carla</text>
</svg>
```

---

## 2. Vista Mobile - Discovery Feed

```svg
<svg width="375" height="812" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="375" height="812" fill="#f5f5f5"/>
  
  <!-- Status Bar -->
  <rect width="375" height="44" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="20" y="30" font-size="12" fill="#333">9:41</text>
  <text x="335" y="30" font-size="12" fill="#333">🔋</text>
  
  <!-- Header -->
  <rect width="375" height="60" y="44" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="30" cy="74" r="16" fill="#1db584"/>
  <text x="55" y="80" font-size="18" font-weight="bold" fill="#333">Nook</text>
  <text x="320" y="80" font-size="16" fill="#1db584">⚙️</text>
  
  <!-- Navigation Tabs -->
  <rect width="375" height="50" y="104" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="30" y="140" font-size="12" font-weight="bold" fill="#1db584">Descubrir</text>
  <text x="130" y="140" font-size="12" fill="#999">Favoritos</text>
  <text x="220" y="140" font-size="12" fill="#999">Mensajes</text>
  <text x="290" y="140" font-size="12" fill="#999">Perfil</text>
  
  <!-- Profile Card - Main -->
  <rect x="15" y="170" width="345" height="380" rx="12" fill="#fff" stroke="#e0e0e0" stroke-width="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
  
  <!-- Profile Image -->
  <rect x="15" y="170" width="345" height="220" rx="12" fill="#d4d4d4"/>
  <text x="160" y="280" font-size="16" fill="#999">Foto</text>
  
  <!-- Profile Info -->
  <text x="25" y="420" font-size="20" font-weight="bold" fill="#333">Sofia, 28</text>
  <text x="25" y="445" font-size="13" fill="#666">📍 Lima, Perú</text>
  <text x="25" y="465" font-size="12" fill="#1db584">💚 Busca relación seria</text>
  <text x="25" y="485" font-size="12" fill="#999">"Amo viajar, leer y conocer gente auténtica"</text>
  
  <!-- Intereses -->
  <rect x="25" y="505" width="70" height="25" rx="12" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="35" y="523" font-size="11" fill="#666">✈️ Viajes</text>
  
  <rect x="105" y="505" width="70" height="25" rx="12" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="115" y="523" font-size="11" fill="#666">📚 Lectura</text>
  
  <rect x="185" y="505" width="75" height="25" rx="12" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="195" y="523" font-size="11" fill="#666">🎨 Creatividad</text>
  
  <!-- Action Buttons -->
  <circle cx="70" cy="560" r="28" fill="#ff6b6b" stroke="#ff5252" stroke-width="2"/>
  <text x="63" y="567" font-size="20" fill="#fff">✕</text>
  
  <circle cx="188" cy="560" r="28" fill="#ffd700" stroke="#ffc800" stroke-width="2"/>
  <text x="182" y="567" font-size="20" fill="#fff">★</text>
  
  <circle cx="305" cy="560" r="28" fill="#1db584" stroke="#16a366" stroke-width="2"/>
  <text x="298" y="567" font-size="20" fill="#fff">♥</text>
  
  <!-- Matches Banner -->
  <rect x="15" y="610" width="345" height="50" rx="8" fill="#e8f5e9" stroke="#1db584" stroke-width="1"/>
  <text x="25" y="632" font-size="13" fill="#1db584">✓ ¡Tienes un nuevo match con Laura!</text>
  <text x="25" y="652" font-size="11" fill="#666">Toca para enviar un mensaje</text>
  
  <!-- Bottom Navigation -->
  <rect width="375" height="60" y="752" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="30" y="790" font-size="20" fill="#1db584">🔍</text>
  <text x="140" y="790" font-size="20" fill="#bbb">❤️</text>
  <text x="250" y="790" font-size="20" fill="#bbb">💬</text>
  <text x="335" y="790" font-size="20" fill="#bbb">👤</text>
</svg>
```

---

## 3. Vista Mobile - Messages

```svg
<svg width="375" height="812" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="375" height="812" fill="#f5f5f5"/>
  
  <!-- Status Bar -->
  <rect width="375" height="44" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="20" y="30" font-size="12" fill="#333">9:41</text>
  
  <!-- Header -->
  <rect width="375" height="60" y="44" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="20" y="30" font-size="14" fill="#999">← Atrás</text>
  <text x="70" y="80" font-size="16" font-weight="bold" fill="#333">Conversación con Laura</text>
  <text x="320" y="80" font-size="16" fill="#1db584">ℹ️</text>
  
  <!-- Intent Badge -->
  <rect x="20" y="115" width="335" height="30" rx="6" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="135" font-size="11" fill="#1db584">💚 Laura busca: Relación seria</text>
  
  <!-- Messages -->
  <!-- Message 1 - Incoming -->
  <rect x="20" y="160" width="260" height="40" rx="12" fill="#e8f5e9" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="180" font-size="13" fill="#333">¡Hola! ¿Cómo estás?</text>
  <text x="30" y="195" font-size="10" fill="#999">14:23</text>
  
  <!-- Message 2 - Outgoing -->
  <rect x="115" y="215" width="240" height="40" rx="12" fill="#1db584" stroke="#1db584" stroke-width="1"/>
  <text x="125" y="235" font-size="13" fill="#fff">¡Muy bien! Leí que te encanta viajar</text>
  <text x="125" y="250" font-size="10" fill="#b3e5fc">14:25</text>
  
  <!-- Message 3 - Incoming -->
  <rect x="20" y="270" width="280" height="50" rx="12" fill="#e8f5e9" stroke="#ddd" stroke-width="1"/>
  <text x="30" y="290" font-size="13" fill="#333">¡Sí! Acabo de regresar de Asia.</text>
  <text x="30" y="310" font-size="13" fill="#333">¿Tú también viajas?</text>
  <text x="30" y="325" font-size="10" fill="#999">14:27</text>
  
  <!-- Message 4 - Outgoing -->
  <rect x="60" y="335" width="260" height="50" rx="12" fill="#1db584" stroke="#1db584" stroke-width="1"/>
  <text x="70" y="355" font-size="13" fill="#fff">¡Mucho! Estoy planeando ir</text>
  <text x="70" y="375" font-size="13" fill="#fff">a Europa en 3 meses</text>
  <text x="70" y="390" font-size="10" fill="#b3e5fc">14:28</text>
  
  <!-- Message Input -->
  <rect width="375" height="60" y="752" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="15" y="762" width="300" height="40" rx="8" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="25" y="787" font-size="14" fill="#999">Escribe tu mensaje...</text>
  <circle cx="335" cy="782" r="16" fill="#1db584"/>
  <text x="330" y="787" font-size="14" fill="#fff">→</text>
</svg>
```

---

## 4. Vista Web - Messages/Connections

```svg
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="800" fill="#f5f5f5"/>
  
  <!-- Header -->
  <rect width="1200" height="70" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="40" cy="35" r="20" fill="#1db584"/>
  <text x="70" y="40" font-size="24" font-weight="bold" fill="#333">Nook</text>
  <text x="300" y="40" font-size="14" fill="#999">Descubrimiento</text>
  <text x="500" y="40" font-size="14" font-weight="bold" fill="#1db584">Mensajes</text>
  <text x="700" y="40" font-size="14" fill="#999">Conexiones</text>
  
  <!-- Left: Conversations List -->
  <rect x="10" y="80" width="280" height="700" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="20" y="110" font-size="14" font-weight="bold" fill="#333">Conversaciones (5)</text>
  
  <!-- Conversation Item 1 - Active -->
  <rect x="20" y="130" width="260" height="60" rx="6" fill="#f0f0f0" stroke="#1db584" stroke-width="2"/>
  <circle cx="45" cy="160" r="15" fill="#d4d4d4"/>
  <text x="70" y="150" font-size="12" font-weight="bold" fill="#333">Laura</text>
  <text x="70" y="165" font-size="11" fill="#999">Tú: ¡Mucho! Estoy planeando ir</text>
  <circle cx="250" cy="160" r="8" fill="#1db584"/>
  
  <!-- Conversation Item 2 -->
  <rect x="20" y="200" width="260" height="60" rx="6" fill="#fff" stroke="#ddd" stroke-width="1"/>
  <circle cx="45" cy="230" r="15" fill="#d4d4d4"/>
  <text x="70" y="220" font-size="12" font-weight="bold" fill="#333">Sofia</text>
  <text x="70" y="235" font-size="11" fill="#999">Hola, ¿cómo estás?</text>
  
  <!-- Conversation Item 3 -->
  <rect x="20" y="270" width="260" height="60" rx="6" fill="#fff" stroke="#ddd" stroke-width="1"/>
  <circle cx="45" cy="300" r="15" fill="#d4d4d4"/>
  <text x="70" y="290" font-size="12" font-weight="bold" fill="#333">Martina</text>
  <text x="70" y="305" font-size="11" fill="#999">Gracias por el match 💚</text>
  
  <!-- Right: Message Thread -->
  <rect x="300" y="80" width="890" height="700" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
  
  <!-- Chat Header -->
  <rect x="300" y="80" width="890" height="60" fill="#f9f9f9" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="325" cy="110" r="18" fill="#d4d4d4"/>
  <text x="360" y="115" font-size="14" font-weight="bold" fill="#333">Laura</text>
  <text x="360" y="130" font-size="11" fill="#666">En línea ahora</text>
  
  <!-- Intent Badge -->
  <rect x="700" y="90" width="180" height="40" rx="6" fill="#e8f5e9" stroke="#1db584" stroke-width="1"/>
  <text x="710" y="115" font-size="12" fill="#1db584">💚 Busca: Relación seria</text>
  
  <!-- Messages -->
  <rect x="320" y="160" width="400" height="40" rx="8" fill="#e8f5e9"/>
  <text x="330" y="185" font-size="12" fill="#333">¡Hola! ¿Cómo estás?</text>
  
  <rect x="780" y="220" width="380" height="40" rx="8" fill="#1db584"/>
  <text x="790" y="245" font-size="12" fill="#fff">¡Muy bien! Leí que te encanta viajar</text>
  
  <rect x="320" y="280" width="440" height="40" rx="8" fill="#e8f5e9"/>
  <text x="330" y="305" font-size="12" fill="#333">¡Sí! Acabo de regresar de Asia</text>
  
  <rect x="760" y="340" width="400" height="60" rx="8" fill="#1db584"/>
  <text x="770" y="360" font-size="12" fill="#fff">¡Mucho! Estoy planeando ir a Europa</text>
  <text x="770" y="380" font-size="12" fill="#fff">en 3 meses. ¿Te gustaría que nos veamos?</text>
  
  <!-- Message Input -->
  <rect x="320" y="720" width="750" height="45" rx="6" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
  <text x="330" y="747" font-size="13" fill="#999">Escribe tu mensaje...</text>
  
  <rect x="1080" y="720" width="100" height="45" rx="6" fill="#1db584" stroke="#1db584" stroke-width="1"/>
  <text x="1105" y="747" font-size="12" fill="#fff" font-weight="bold">Enviar</text>
</svg>
```

---

## Notas sobre los Wireframes

### Elementos Visuales Clave:

1. **Paleta de Color**
   - Verde menta/Nook: `#1db584`
   - Fondo claro: `#f5f5f5`
   - Blanco: `#fff`
   - Grises: `#ddd`, `#999`
   - Botones: Rojo rechazo, Amarillo favorito, Verde aceptar

2. **Interacción Mobile**
   - Botones de acción grandes (28px)
   - Tarjetas con espaciado generoso
   - Navegación inferior tipo bottom tab

3. **Interacción Web**
   - Sidebar de filtros
   - Layout de dos columnas (conversations + messages)
   - Más información visible

4. **Flujo de Usuario**
   - Descubrimiento → Interacción → Match → Mensajería → Conexión

---

## Siguientes Pasos

1. Importar estos wireframes a Figma para mayor detalle
2. Definir componentes reutilizables (Button, Card, Badge, etc.)
3. Crear paleta de colores oficial
4. Diseñar microinteracciones
