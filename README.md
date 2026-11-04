# Nook

> **Estado: rama experimental.** Este repositorio contiene una aplicación web en desarrollo y documentación de concepto. No debe considerarse un producto listo para producción ni una garantía de que todas las funciones descritas estén completas.

Nook es una plataforma de conexión humana que busca ayudar a las personas a conocerse con más contexto, intención y cuidado. Su propuesta combina descubrimiento de perfiles, conexiones, mensajería y comunidad en una experiencia visual cálida y deliberada.

## Índice

- [Estado del proyecto](#estado-del-proyecto)
- [Visión del producto](#visión-del-producto)
- [Funciones y alcance actual](#funciones-y-alcance-actual)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos e instalación local](#requisitos-e-instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Comandos disponibles](#comandos-disponibles)
- [Ejecución y despliegue](#ejecución-y-despliegue)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Documentación relacionada](#documentación-relacionada)
- [Pendientes antes de comercializar](#pendientes-antes-de-comercializar)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Estado del proyecto

La aplicación está en una rama experimental y puede cambiar sin previo aviso. El código y las rutas muestran una base de producto web en desarrollo; la existencia de una pantalla o ruta no implica que su flujo esté completo, probado o listo para usuarios reales.

Antes de distribuir, alojar públicamente o vender Nook, hay que verificar los flujos funcionales, configurar el backend en un entorno controlado, revisar seguridad y privacidad, y completar la documentación legal y operativa aplicable.

## Visión del producto

Nook busca diferenciarse de las experiencias centradas en el volumen y la interacción rápida. Sus principios de producto son:

- **Intención y contexto:** perfiles que ayuden a entender a la persona y qué busca.
- **Conexiones mutuas:** fomentar interacciones respetuosas y con consentimiento.
- **Conversación:** facilitar que una conexión pueda convertirse en una conversación significativa.
- **Confianza:** tratar la seguridad, la moderación y el control del usuario como aspectos centrales.
- **Calidez:** ofrecer una experiencia visual cercana, clara y accesible.

La visión y los principios se desarrollan en [NOOK_MASTER_CONCEPT.md](NOOK_MASTER_CONCEPT.md) y [ARCHITECTURE_STRATEGY.md](ARCHITECTURE_STRATEGY.md). Estos documentos describen dirección de producto, no una especificación de funciones garantizadas.

## Funciones y alcance actual

En la rama se encuentran páginas y rutas para las siguientes áreas. Su nivel de implementación y funcionamiento debe validarse en la aplicación antes de presentarlas como disponibles:

- Página de bienvenida, registro, inicio de sesión y verificación de correo.
- Onboarding y perfil personal/público.
- Feed, exploración y búsqueda de personas.
- Conexiones y mensajes.
- Eventos y chat a ciegas.
- Ajustes y una interfaz de administración protegida.
- Componentes de soporte y reporte de errores.

El flujo de producto propuesto es: **registro y perfil → descubrimiento → interacción/conexión → conversación → comunidad**. Algunas ideas de comunidad y crecimiento aparecen en los documentos de concepto y estrategia, pero no deben interpretarse automáticamente como funcionalidades ya implementadas.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Aplicación web | React 19 |
| Herramienta de desarrollo y compilación | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Rutas | React Router 7 |
| Estado | Zustand 5 |
| Backend y cliente de datos | Supabase (`@supabase/supabase-js`) |
| Iconos | Lucide React |
| Calidad de código | Oxlint |
| Configuración de despliegue presente | Vercel |

Las versiones indicadas corresponden a las dependencias declaradas en `Noock/package.json`; revisa ese archivo para consultar las versiones exactas.

## Estructura del repositorio

```text
.
├── ARCHITECTURE_STRATEGY.md  # Dirección arquitectónica y roadmap propuesto
├── NOOK_MASTER_CONCEPT.md    # Concepto, propuesta de valor y usuarios objetivo
├── WIREFRAMES_WEB.md         # Wireframes de referencia
└── Noock/                    # Aplicación React + Vite
    ├── package.json
    ├── vercel.json
    └── src/
        ├── components/       # Componentes organizados por área
        ├── contexts/
        ├── hooks/
        ├── lib/              # Cliente Supabase y utilidades
        ├── pages/            # Pantallas de la aplicación
        └── stores/           # Estado de la aplicación
```

## Requisitos e instalación local

Requisitos recomendados:

- Node.js compatible con la versión instalada de Vite.
- npm (se incluye `package-lock.json`).
- Un proyecto de Supabase configurado para el entorno de desarrollo.

Desde la raíz del repositorio:

```bash
cd Noock
npm install
```

Crea `Noock/.env.local` con las variables de entorno indicadas a continuación y luego inicia el servidor local:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación (normalmente `http://localhost:5173`). La aplicación requiere las credenciales de Supabase para inicializar su cliente; sin ellas, la inicialización falla.

> La configuración de tablas, políticas de acceso, funciones, buckets y datos de prueba de Supabase no está especificada en esta guía. Prepara un proyecto de desarrollo separado y confirma esos requisitos en el código/backend antes de intentar una instalación funcional. No conectes una instancia de producción sin completar la revisión de seguridad.

## Variables de entorno

El cliente Supabase lee estas variables en tiempo de compilación desde `import.meta.env`:

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública/anon del proyecto Supabase. |

Ejemplo de `Noock/.env.local`:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon
```

No guardes credenciales reales en el repositorio. Los archivos `.env` y `.env.local` están excluidos por `Noock/.gitignore`. Las variables con prefijo `VITE_` se incorporan al cliente web: **no coloques claves secretas ni la `service_role` de Supabase en ellas**. La clave anon no sustituye las políticas de seguridad; configura y prueba RLS y permisos en el backend.

## Comandos disponibles

Ejecutar desde `Noock/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite. |
| `npm run build` | Compila la aplicación para producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación para previsualización. |
| `npm run lint` | Ejecuta Oxlint. |

No hay un comando de pruebas automatizadas declarado en los scripts actuales de `package.json`.

## Ejecución y despliegue

La configuración `Noock/vercel.json` incluye una regla de reescritura para que las rutas de la aplicación de una sola página se resuelvan mediante `index.html`.

Para un despliegue en Vercel, configura `Noock/` como directorio raíz del proyecto y verifica los valores de compilación de Vite (`npm run build`, salida `dist`). Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las variables de entorno del entorno correspondiente (preview/producción). Comprueba que el proyecto Supabase y sus políticas están configurados para ese entorno antes de publicar.

Tras desplegar, valida como mínimo registro, inicio de sesión, verificación de correo, rutas protegidas, acceso a datos, carga de recursos, navegación directa a rutas internas y comportamiento en móvil. El despliegue no equivale a una auditoría de seguridad ni a una aprobación para uso comercial.

## Seguridad y privacidad

Nook contempla seguridad y moderación como principios de producto. No obstante, esa intención no demuestra por sí sola que las protecciones necesarias estén implementadas o verificadas.

Antes de usar datos reales o abrir el servicio al público:

- Revisa políticas RLS, permisos, funciones y almacenamiento de Supabase; prueba accesos entre cuentas distintas.
- Mantén secretos y claves privilegiadas fuera del frontend y del historial de Git.
- Define retención, eliminación, exportación y protección de datos personales, incluidas fotos y mensajes.
- Revisa autenticación, verificación, control de acceso de administración, reportes, bloqueos y moderación.
- Publica y valida términos de servicio, política de privacidad, normas comunitarias y canales de soporte con asesoría apropiada para los mercados objetivo.
- Define procedimientos para incidentes, abuso, solicitudes de usuarios, copias de seguridad y recuperación.

Esta sección es una lista técnica de atención, no asesoramiento legal ni una certificación de cumplimiento.

## Documentación relacionada

- [Concepto maestro de Nook](NOOK_MASTER_CONCEPT.md)
- [Estrategia de arquitectura](ARCHITECTURE_STRATEGY.md)
- [Wireframes web y móvil](WIREFRAMES_WEB.md)

## Pendientes antes de comercializar

Esta lista ayuda a convertir la rama experimental en un paquete evaluable; no indica que el trabajo ya esté realizado:

- [ ] Acordar alcance del producto, usuarios objetivo, mercados, edad mínima y funciones incluidas en una versión comercial.
- [ ] Separar funciones implementadas, parcialmente implementadas y futuras; verificar cada una en código y en pruebas.
- [ ] Documentar arquitectura real, modelo de datos, migraciones, funciones backend, permisos RLS, almacenamiento e integraciones.
- [ ] Crear guía reproducible de configuración de Supabase para desarrollo, pruebas y producción.
- [ ] Añadir pruebas automatizadas, flujo de integración continua y criterios de aceptación para los flujos principales.
- [ ] Documentar despliegue, dominios, variables por entorno, monitorización, alertas, copias de seguridad y recuperación.
- [ ] Completar evaluación de seguridad, privacidad, moderación, accesibilidad y rendimiento.
- [ ] Preparar guías de usuario y administración, soporte, resolución de problemas y gestión de incidentes.
- [ ] Revisar dependencias y licencias de terceros, y definir la licencia del código y los activos de marca.
- [ ] Revisar requisitos legales, protección de datos y condiciones de operación con profesionales cualificados en cada mercado.

## Contribuciones

Para colaborar, trabaja en una rama separada y describe el cambio, cómo probarlo y cualquier efecto sobre datos, seguridad o configuración. No incluyas credenciales, información personal ni datos reales de usuarios en commits, issues o capturas.

## Licencia

No se ha identificado una licencia de software en la raíz de esta rama. **No asumas que el código puede reutilizarse, redistribuirse o venderse** hasta definir y revisar expresamente la titularidad y los permisos aplicables al código, dependencias, contenido, marca y otros activos.
