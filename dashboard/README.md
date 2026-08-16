# Emerred — Dashboard de Administración

Panel web para operadores de emergencia. Permite visualizar reportes, emitir alertas, asignar voluntarios y ver un mapa interactivo con los incidentes.

## Tecnología

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript 5.6](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) como package manager y runtime
- [Tailwind CSS v4](https://tailwindcss.com/) para estilos
- [Recharts](https://recharts.org/) para gráficos
- [Pigeon Maps](https://pigeon-maps.js.org/) para el mapa

## Estructura (Clean Architecture)

```
dashboard/
├─ src/
│  ├─ domain/
│  │  └─ types.ts           # Entidades y tipos puros
│  ├─ data/
│  │  ├─ api.ts             # Adaptadores mock (reemplazables por fetch real)
│  │  ├─ auth.ts            # Login/logout mock con JWT en cookie
│  │  ├─ resources.ts       # Recursos para Suspense
│  │  └─ volunteers.ts      # Lista mock de voluntarios
│  ├─ presentation/
│  │  ├─ App.tsx            # Ruteo condicional por autenticación
│  │  ├─ Dashboard.tsx      # Tabs y orquestación
│  │  ├─ components/
│  │  │  ├─ tabs/           # Vista de cada tab
│  │  │  ├─ auth/
│  │  │  ├─ ui/
│  │  │  └─ ...
│  │  └─ hooks/
│  │     └─ useIdleTimeout.ts
├─ package.json
└─ vite.config.ts
```

## Instalación

```bash
cd dashboard
bun install
```

## Ejecución

```bash
bun run dev
```

Por defecto corre en `http://localhost:5173`.

## Funcionalidades

- **Login mock** con JWT guardado en cookie.
- **Tabs**: Resumen, Alertas, Mapa, Reportes.
- **Resumen**: estadísticas, reportes por prioridad y distribución por categoría.
- **Alertas**: emitir nuevas alertas CBS y ver alertas activas.
- **Mapa**: pines clickeables con animación y detalle del reporte.
- **Reportes**: tabla con asignación de voluntarios.
- **Auto-cierre de sesión** tras 10 minutos de inactividad.

## Credenciales mock

```
Email: admin@emerred.co
Contraseña: admin123
```

## Conectar con backend real

1. Reemplazar las funciones en `src/data/api.ts` por llamadas `fetch` reales.
2. Actualizar `src/data/auth.ts` para apuntar a `POST /auth/login`.
3. Ajustar el dominio en `src/data/resources.ts` según el backend.
