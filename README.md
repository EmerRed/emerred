# EmerRed

Sistema de contacto para catástrofes que conecta a afectados con operadores de emergencia. Incluye una API REST desplegada en Railway, un dashboard web para administración en tiempo real y un agente de IA para investigación y triage.

## Arquitectura

```
Dispositivos / clientes
       │
       ▼
Backend (Express + MongoDB) — Railway
  ├─ CRUD /afectados
  ├─ Auth JWT (/auth/*)
  ├─ SSE en tiempo real
  └─ Swagger /api-docs
       │
       ├──────────────────┐
       ▼                  ▼
Dashboard (React + Vite)   Agente IA (Python)
  Panel de operadores      Investigación y triage
  Vercel                   CLI local
```

## Componentes

| Carpeta | Descripción | Stack |
|---------|-------------|-------|
| `backend/` | API REST, autenticación, persistencia y eventos SSE | Node.js 20, Express, Mongoose, MongoDB Atlas |
| `dashboard/` | Panel web para operadores de emergencia | React 19, TypeScript, Vite, Tailwind CSS |
| `agente/` | Agente CLI de investigación y síntesis con IA | Python, Google Gemini |

## URLs de producción

| Servicio | URL |
|----------|-----|
| API | https://emerred-production.up.railway.app |
| Swagger | https://emerred-production.up.railway.app/api-docs |
| Health | https://emerred-production.up.railway.app/health |

## Inicio rápido

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con MONGODB_URI y JWT_SECRET
npm run dev
```

El servidor corre en `http://localhost:3000`. Al iniciar se crea automáticamente un usuario admin de desarrollo (ver `backend/src/config/seedAdmin.js`).

### Dashboard

```bash
cd dashboard
bun install
cp .env.example .env
# Editar .env con VITE_API_URL
bun run dev
```

El panel corre en `http://localhost:5173`. El login usa el backend real (`POST /auth/login`) con JWT almacenado en cookie.

### Agente

Ver [`agente/README.md`](agente/README.md) para instalación y uso del CLI.

## API — Endpoints principales

### Afectados

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/afectados` | Crear afectado |
| `GET` | `/afectados` | Listar todos |
| `GET` | `/afectados/:id` | Obtener por ID |
| `GET` | `/afectadoPorCelular/:numero_celular` | Buscar por celular |
| `PUT` | `/afectados/:id` | Actualizar |
| `DELETE` | `/afectados/:id` | Eliminar |

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/login` | Login + JWT | Público |
| `POST` | `/auth/register` | Registro de usuario | Admin |
| `GET` | `/auth/me` | Usuario actual | JWT |
| `POST` | `/auth/refresh` | Renovar token | JWT |

### Alarma de emergencia

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/alarma/activar` | Difunde la alarma por WebSocket a dispositivos conectados | Admin/Operator |
| `GET` | `/alarma/dispositivos` | Cantidad de dispositivos conectados al canal | Admin/Operator |
| `WS` | `/alarma` | Canal WebSocket para apps móviles | — |

`POST /alarma/activar` no es WebSocket: es un endpoint REST que envía `{"alarma": true}` a **todos** los clientes conectados en `wss://<host>/alarma`. No filtra por ubicación ni radio geográfico.

### Otros

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/afectados/sse` | Stream SSE de nuevos afectados |

## Modelo de datos — Afectado

```json
{
  "lat": -4.6097,
  "long": -74.0817,
  "numero_celular": 3001234567,
  "potencia_red_movil": -75,
  "coneccion_mesh": false
}
```

## Dashboard — Funcionalidades

- Login real contra el backend con JWT
- Actualización en tiempo real vía SSE al registrar afectados
- Tabs: Resumen, Alertas, Mapa y Reportes
- Mapa interactivo con agrupación por ubicación
- Auto-cierre de sesión tras 10 minutos de inactividad

## Despliegue

- **Backend**: Railway con Docker (`backend/Dockerfile`, `railway.json`)
- **Dashboard**: Vercel (root directory: `dashboard/`)
- **Base de datos**: MongoDB Atlas

## Documentación adicional

- [`backend/README.md`](backend/README.md) — API, endpoints y pruebas con curl
- [`dashboard/README.md`](dashboard/README.md) — Frontend, variables de entorno y deploy
- [`agente/README.md`](agente/README.md) — Agente CLI de IA
- [`AGENTS.md`](AGENTS.md) — Contexto técnico para agentes IA

## Estructura del repositorio

```
emerred/
├─ backend/          # API REST (Express + MongoDB)
├─ dashboard/        # Panel web (React + Vite)
├─ agente/           # Agente IA (Python)
├─ railway.json      # Config de deploy Railway
├─ AGENTS.md         # Contexto para agentes
└─ README.md
```
