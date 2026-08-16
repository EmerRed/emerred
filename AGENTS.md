# EmerRed API - Contexto para Agentes IA

## Resumen del Proyecto
API REST para gestión de afectados en catástrofes (EmerRed). Backend Node.js/Express/MongoDB desplegado en Railway.

---

## Stack Tecnológico

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

---

## Estructura de Archivos (backend/)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión MongoDB con Mongoose
│   │   └── swagger.js       # Configuración Swagger/OpenAPI 3.0
│   ├── controllers/
│   │   └── afectadoController.js  # CRUD completo (6 métodos)
│   ├── middlewares/
│   │   ├── errorHandler.js  # Manejo centralizado de errores
│   │   └── validation.js    # Validación Joi (schemas + helpers)
│   ├── models/
│   │   └── Afectado.js      # Modelo Mongoose + índices + timestamps
│   ├── routes/
│   │   └── afectados.js     # 6 endpoints REST + docs Swagger inline
│   └── app.js               # Express + CORS + health + Swagger UI
├── server.js                # Entry point + graceful shutdown
├── Dockerfile               # Multi-stage: node:20-alpine
├── package.json             # Scripts: start, dev
├── package-lock.json        # lockfileVersion 3
├── .env.example             # Template variables
├── .gitignore
└── README.md
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

## Endpoints REST

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

**Códigos**: 400 (validación), 404 (no encontrado), 409 (duplicado celular), 500 (servidor), 503 (DB indisponible).

---

## Variables de Entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `MONGODB_URI` | Sí | URI MongoDB (Atlas) | `mongodb+srv://...` |
| `PORT` | No | Puerto (Railway la inyecta) | `3000` |
| `NODE_ENV` | No | Entorno | `production` |
| `CORS_ORIGIN` | No | Origen CORS | `*` o URL frontend |

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
```

---

## Notas para Agentes

1. **Monorepo**: Código en `backend/`, no en raíz. Railway usa `backend/Dockerfile` con contexto raíz.
2. **Validación dual**: Joi (middleware) + Mongoose (modelo) - ambos deben coincidir.
3. **Índice único**: `numero_celular` tiene unique index en MongoDB → error 409 si duplicado.
4. **Timestamps**: Auto-manejados por Mongoose (`createdAt`, `updatedAt`).
5. **Graceful shutdown**: `server.js` maneja SIGTERM/SIGINT cierra HTTP + MongoDB.
6. **Swagger**: Documentación inline en `src/routes/afectados.js` (JSDoc + OpenAPI 3.0).
7. **CORS**: Configurado en `src/app.js` via `CORS_ORIGIN` env var.