# EmerRed API - Contexto para Agentes IA

## Resumen del Proyecto
API REST para gestión de afectados en catástrofes (EmerRed). Backend Node.js/Express/MongoDB desplegado en Railway. Frontend: React + TypeScript + Vite en `dashboard/`.

---

## Stack Tecnológico

### Backend (`backend/`)
| Componente | Versión | Notas |
|------------|---------|-------|
| Node.js | 20 LTS (Alpine) | `engines: >=18.0.0` |
| Express | 4.19.x | Framework web |
| Mongoose | 8.4.x | ODM MongoDB |
| MongoDB | 7+ (Atlas) | Base de datos |
| Joi | 17.13.x | Validación de esquemas |
| Swagger | 6.2.x + 5.0.x | Documentación OpenAPI 3.0 |
| CORS | 2.8.x | Cross-origin |
| dotenv | 16.4.x | Variables de entorno |
| bcryptjs | 2.4.x | Hash de contraseñas (12 rounds) |
| jsonwebtoken | 9.0.x | JWT tokens (expiración 8h) |

### Frontend (`dashboard/`)
| Componente | Versión | Notas |
|------------|---------|-------|
| React | 19.2.x | UI library |
| TypeScript | 5.6.x | Tipado estático |
| Vite | 8.2.x | Build tool |
| Tailwind CSS | 4.3.x | Styling |
| Lucide React | 1.31.x | Iconos |
| Pigeon Maps | 0.22.x | Mapas |
| Recharts | 3.10.x | Gráficos |

---

## Estructura de Archivos

### Backend (`backend/`)
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión MongoDB con Mongoose
│   │   ├── swagger.js       # Configuración Swagger/OpenAPI 3.0
│   │   └── seedAdmin.js     # Seed admin user on startup
│   ├── controllers/
│   │   ├── afectadoController.js  # CRUD afectados (6 métodos)
│   │   └── authController.js      # Auth: login, register, me, refresh
│   ├── middlewares/
│   │   ├── errorHandler.js  # Manejo centralizado de errores
│   │   ├── validation.js    # Validación Joi (schemas + helpers)
│   │   └── auth.js          # JWT verification + role-based access
│   ├── models/
│   │   ├── Afectado.js      # Modelo Mongoose + índices + timestamps
│   │   └── User.js          # User model: email, passwordHash, name, role
│   ├── routes/
│   │   ├── afectados.js     # 6 endpoints REST + docs Swagger
│   │   └── auth.js          # 4 endpoints auth + Swagger docs
│   └── app.js               # Express + CORS + health + Swagger UI
├── server.js                # Entry point + graceful shutdown + seed
├── Dockerfile               # Multi-stage: node:20-alpine
├── package.json             # Scripts: start, dev
├── package-lock.json        # lockfileVersion 3
├── .env.example             # Template variables
├── .gitignore
└── README.md
```

### Frontend (`dashboard/`)
```
dashboard/
├── src/
│   ├── data/
│   │   ├── auth.ts          # Auth mock (login, token cookie, JWT fake)
│   │   ├── api.ts           # API mock (reportes, alertas, stats)
│   │   ├── resources.ts     # Datos de recursos
│   │   └── volunteers.ts    # Datos de voluntarios
│   ├── domain/
│   │   └── types.ts         # Tipos TypeScript (Report, Alert, Stats)
│   ├── presentation/
│   │   └── hooks/
│   │       └── useIdleTimeout.ts
│   └── ... (componentes React)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

---

## Modelo de Datos: Afectado

```javascript
{
  _id: ObjectId,              // Auto-generado
  lat: Number,                // Latitud (-90 a 90)
  long: Number,               // Longitud (-180 a 180)
  numero_celular: Number,     // Entero único (9-10 dígitos), índice único
  potencia_red_movil: Number, // Entero dBm (-150 a 0)
  coneccion_mesh: Boolean,    // true/false
  createdAt: Date,            // Auto (timestamps)
  updatedAt: Date             // Auto (timestamps)
}
```

**Validaciones**: Joi (middleware) + Mongoose (modelo) - doble capa.

---

## Endpoints REST Actuales

Base URL Producción: `https://emerred-production.up.railway.app`

| Método | Ruta | Descripción | Validación |
|--------|------|-------------|------------|
| `POST` | `/afectados` | Crear afectado | `validateAfectado` (body) |
| `GET` | `/afectados` | Listar todos (orden: createdAt desc) | - |
| `GET` | `/afectados/:id` | Obtener por ObjectId | `validateIdParam` (params) |
| `GET` | `/afectadoPorCelular/:numero_celular` | Buscar por celular | `validateCelularParam` (params) |
| `PUT` | `/afectados/:id` | Actualizar completo | `validateIdParam` + `validateAfectado` |
| `DELETE` | `/afectados/:id` | Eliminar | `validateIdParam` |
| `GET` | `/health` | Health check | - |
| `GET` | `/api-docs` | Swagger UI | - |
| `GET` | `/api-docs.json` | Spec OpenAPI 3.0 | - |

---

## 🔐 Sistema de Autenticación (IMPLEMENTADO)

### Especificaciones
- **Login**: `POST /auth/login` con `{ email, password }`
- **Password hash**: bcryptjs (cost factor 12)
- **JWT**: jsonwebtoken, expiración **8 horas** (28800 segundos)
- **Token response**: `{ token, user: { id, email, name, role } }`
- **Middleware auth**: Verificar JWT en rutas protegidas (`auth` middleware)
- **Role-based access**: `requireRole('admin'|'operator'|'viewer')`
- **Modelo User**: email único, passwordHash, name, role, timestamps

### Variables de Entorno
| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `JWT_SECRET` | Sí | Clave secreta para firmar JWT (mín 32 chars) | `super-secret-key-256-bits` |
| `JWT_EXPIRES_IN` | No | Expiración token | `8h` |
| `BCRYPT_ROUNDS` | No | Rondas bcrypt | `12` |

### Estructura Usuario (MongoDB)
```javascript
{
  _id: ObjectId,
  email: String,           // Único, lowercase, required
  passwordHash: String,    // bcrypt hash, required
  name: String,            // Required
  role: String,            // 'admin' | 'operator' | 'viewer', default: 'viewer'
  createdAt: Date,
  updatedAt: Date
}
```

### Endpoints Auth Implementados
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/login` | Login + JWT | Público |
| `POST` | `/auth/register` | Registro (solo admin) | Privado (admin) |
| `GET` | `/auth/me` | Usuario actual desde token | Privado |
| `POST` | `/auth/refresh` | Renovar token | Privado |

### Seed Admin (Auto-creado al iniciar)
- **Email**: `admin@gmail.com`
- **Password**: `123456`
- **Role**: `admin`
- **Name**: `Administrador`

### Integración Frontend (`dashboard/src/data/auth.ts`)
Actualmente usa **mock**:
- Credenciales hardcoded: `admin@emerred.co` / `admin123`
- JWT fake con `alg: 'none'`
- Cookie `emerred_token` (1 día)

**Cambios necesarios en frontend para usar backend real:**
1. `login()` → `POST /auth/login` real
2. `getAuthToken()` → leer cookie/HTTP-only
3. `isAuthenticated()` → validar con backend o decodificar JWT local
4. Agregar `Authorization: Bearer <token>` header en llamadas API

---

## Formato de Respuestas

### Éxito (200/201)
```json
{
  "success": true,
  "message": "string",
  "data": { } | [ ],
  "count?: number"
}
```

### Error (400/404/409/500/503)
```json
{
  "success": false,
  "message": "string",
  "errors": [
    { "field": "string", "message": "string" }
  ]
}
```

**Códigos**: 400 (validación), 401 (no autorizado), 403 (prohibido), 404 (no encontrado), 409 (duplicado), 500 (servidor), 503 (DB indisponible).

---

## Variables de Entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `MONGODB_URI` | Sí | URI MongoDB (Atlas) | `mongodb+srv://...` |
| `PORT` | No | Puerto (Railway la inyecta) | `3000` |
| `NODE_ENV` | No | Entorno | `production` |
| `CORS_ORIGIN` | No | Origen CORS | `*` o URL frontend |
| `JWT_SECRET` | Sí | Clave JWT (mín 32 chars) | `clave-secreta-256-bits-aqui` |
| `JWT_EXPIRES_IN` | No | Expiración JWT | `8h` |
| `BCRYPT_ROUNDS` | No | Rondas bcrypt | `12` |

---

## Despliegue

- **Plataforma**: Railway (Docker)
- **Build**: `backend/Dockerfile` (contexto raíz, copia solo `backend/`)
- **Config**: `railway.json` → `builder: DOCKERFILE`, `dockerfilePath: backend/Dockerfile`
- **DB**: MongoDB Atlas (M0 Free Tier) - variable `MONGODB_URI` en Railway
- **Healthcheck**: `GET /health` cada 30s

---

## Comandos Útiles

```bash
# Desarrollo local
cd backend && npm run dev

# Build Docker local
docker build -f backend/Dockerfile -t emerred-api .

# Test endpoints producción
curl https://emerred-production.up.railway.app/health
curl https://emerred-production.up.railway.app/afectados
curl -X POST https://emerred-production.up.railway.app/afectados \
  -H "Content-Type: application/json" \
  -d '{"lat":-33.4489,"long":-70.6693,"numero_celular":912345678,"potencia_red_movil":-75,"coneccion_mesh":false}'

# Test auth
curl -X POST https://emerred-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}'
```

---

## Notas para Agentes

1. **Monorepo**: Código en `backend/`, no en raíz. Railway usa `backend/Dockerfile` con contexto raíz.
2. **Validación dual**: Joi (middleware) + Mongoose (modelo) - ambos deben coincidir.
3. **Índice único**: `numero_celular` tiene unique index en MongoDB → error 409 si duplicado.
4. **Timestamps**: Auto-manejados por Mongoose (`createdAt`, `updatedAt`).
5. **Graceful shutdown**: `server.js` maneja SIGTERM/SIGINT cierra HTTP + MongoDB.
6. **Swagger**: Documentación inline en `src/routes/afectados.js` y `src/routes/auth.js` (JSDoc + OpenAPI 3.0).
7. **CORS**: Configurado en `src/app.js` via `CORS_ORIGIN` env var.
8. **Auth implementado**: Backend tiene `/auth/login`, `/auth/register`, `/auth/me`, `/auth/refresh`, middleware JWT, modelo User, bcryptjs, jsonwebtoken.
9. **JWT 8h**: Expiración fija de 8 horas (28800s). Refresh endpoint disponible.
10. **Password hash**: bcryptjs con 12 rounds. Nunca guardar password plano.
11. **Seed admin**: Se crea automáticamente `admin@gmail.com` / `123456` role `admin` al iniciar servidor.