# Emerred — Dashboard de Administración

Panel web para operadores de emergencia. Se conecta al backend de producción para mostrar afectados en tiempo real, emitir alertas y visualizar un mapa interactivo.

## Tecnología

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript 5.6](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) para estilos
- [Recharts](https://recharts.org/) para gráficos
- [Pigeon Maps](https://pigeon-maps.js.org/) para el mapa
- [Bun](https://bun.sh/) como package manager

## Estructura (Clean Architecture)

```
dashboard/
├─ src/
│  ├─ domain/
│  │  └─ types.ts             # Entidades y tipos puros
│  ├─ data/
│  │  ├─ api.ts               # Llamadas a /afectados
│  │  ├─ auth.ts              # Login con backend real
│  │  ├─ sse.ts               # Suscripción a eventos SSE
│  │  ├─ aggregation.ts       # Agrupación por ubicación
│  │  └─ resources.ts         # Carga y actualización del dashboard
│  ├─ presentation/
│  │  ├─ App.tsx              # Ruteo condicional por autenticación
│  │  ├─ Dashboard.tsx        # Tabs y orquestación
│  │  ├─ components/
│  │  │  ├─ tabs/             # Vista de cada tab
│  │  │  ├─ auth/
│  │  │  └─ ui/
│  │  └─ hooks/
│  │     └─ useIdleTimeout.ts
├─ .env.example
├─ vercel.json
├─ package.json
└─ vite.config.ts
```

## Variables de entorno

El frontend usa la variable `VITE_API_URL` para saber dónde está el backend. No comitees archivos `.env` reales.

1. Copiá `.env.example` a `.env` para desarrollo local:

```bash
cp .env.example .env
```

2. Editá `.env` con la URL del backend:

```env
VITE_API_URL=https://emerred-production.up.railway.app
```

3. En producción (Vercel), seteá `VITE_API_URL` en **Settings → Environment Variables** del proyecto.

## Instalación

```bash
cd dashboard
bun install
```

## Ejecución local

```bash
bun run dev
```

Por defecto corre en `http://localhost:5173`.

## Build

```bash
bun run build
bun run preview
```

## Deploy en Vercel

1. Importá el repositorio en Vercel.
2. Configurá el **Root Directory** del proyecto como `dashboard`.
3. En **Settings → Environment Variables** agregá:
   - `VITE_API_URL` con la URL del backend.
4. Vercel detectará Vite automáticamente y generará el build.

## Funcionalidades

- **Login real** contra `POST /auth/login` con JWT en cookie.
- **Actualización en tiempo real** por SSE cuando se crea un afectado.
- **Tabs**: Resumen, Alertas, Mapa, Reportes.
- **Resumen**: estadísticas, calidad de señal móvil y conexión mesh.
- **Alertas**: en construcción (activación por WebSocket temporalmente deshabilitada).
- **Mapa**: pines agrupados por ubicación con color según promedio de señal.
- **Reportes**: tabla de afectados y puntos agrupados con listado completo de celulares.
- **Auto-cierre de sesión** tras 10 minutos de inactividad.

## Credenciales

Usá las credenciales del backend. Ejemplo del seed admin:

```
Email: admin@gmail.com
Contraseña: 123456
```
