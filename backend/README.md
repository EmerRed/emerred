# EmerRed API - Gestión de Afectados

API REST para la gestión de personas afectadas en situaciones de catástrofe. Permite registrar, consultar, actualizar y eliminar información de afectados, incluyendo su ubicación geográfica, número de celular, potencia de señal móvil y estado de conexión mesh.

## 🚀 Características

- **CRUD completo** para gestión de afectados
- **Validación robusta** con Joi
- **Documentación Swagger** interactiva
- **Conexión flexible** a MongoDB (local o Atlas)
- **Manejo de errores** centralizado
- **CORS configurado** para desarrollo y producción
- **Graceful shutdown** para despliegues seguros
- **Health check endpoint** para monitoreo

## 📋 Requisitos

- Node.js >= 18.0.0 (última LTS)
- MongoDB >= 5.0 (local o Atlas)
- npm >= 9.0.0

## 🛠 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd emerred-api/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

## ⚙️ Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/emerred_db
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Variables de entorno

| Variable | Descripción | Por defecto | Requerida |
|----------|-------------|-------------|-----------|
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/emerred_db` | Sí |
| `PORT` | Puerto del servidor | `3000` | No |
| `NODE_ENV` | Entorno de ejecución | `development` | No |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` | No |

### Conexión a MongoDB Atlas

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/emerred_db?retryWrites=true&w=majority
```

## ▶️ Uso

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación API

### Swagger UI
Accede a la documentación interactiva en: `http://localhost:3000/api-docs`

### Especificación OpenAPI
Descarga la especificación JSON en: `http://localhost:3000/api-docs.json`

## 🔗 Endpoints

### Base URL
```
http://localhost:3000
```

### Afectados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/afectados` | Crear un nuevo afectado |
| `GET` | `/afectados` | Obtener todos los afectados |
| `GET` | `/afectados/:id` | Obtener un afectado por ID |
| `GET` | `/afectadoPorCelular/:numero_celular` | Obtener afectado por celular |
| `PUT` | `/afectados/:id` | Actualizar un afectado |
| `DELETE` | `/afectados/:id` | Eliminar un afectado |

### Health Check
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Verificar estado del servidor |

## 📦 Modelo de Datos

### Afectado

```javascript
{
  _id: ObjectId,              // Generado automáticamente
  lat: Number,                // Latitud (-90 a 90)
  long: Number,               // Longitud (-180 a 180)
  numero_celular: Number,     // Entero único (9-10 dígitos)
  potencia_red_movil: Number, // Entero en dBm (-150 a 0)
  coneccion_mesh: Boolean,    // true/false
  createdAt: Date,            // Automático
  updatedAt: Date             // Automático
}
```

### Ejemplo de request (POST /afectados)

```json
{
  "lat": -33.4489,
  "long": -70.6693,
  "numero_celular": 912345678,
  "potencia_red_movil": -75,
  "coneccion_mesh": false
}
```

### Ejemplo de respuesta exitosa

```json
{
  "success": true,
  "message": "Afectado creado exitosamente",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "lat": -33.4489,
    "long": -70.6693,
    "numero_celular": 912345678,
    "potencia_red_movil": -75,
    "coneccion_mesh": false,
    "createdAt": "2024-09-01T12:00:00.000Z",
    "updatedAt": "2024-09-01T12:00:00.000Z"
  }
}
```

### Ejemplo de error de validación (400)

```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    { "field": "lat", "message": "La latitud debe ser un número entre -90 y 90" },
    { "field": "numero_celular", "message": "El número de celular debe ser un entero válido" }
  ]
}
```

### Ejemplo de error 404

```json
{
  "success": false,
  "message": "Afectado no encontrado",
  "errors": [{ "field": "id", "message": "No existe un afectado con el ID proporcionado" }]
}
```

### Ejemplo de error 409 (duplicado)

```json
{
  "success": false,
  "message": "numero_celular ya existe",
  "errors": [{ "field": "numero_celular", "message": "Ya existe un registro con numero_celular: 912345678" }]
}
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración MongoDB
│   │   └── swagger.js       # Configuración Swagger/OpenAPI
│   ├── controllers/
│   │   └── afectadoController.js  # Lógica de negocio
│   ├── middlewares/
│   │   ├── errorHandler.js  # Manejo centralizado de errores
│   │   └── validation.js    # Validación con Joi
│   ├── models/
│   │   └── Afectado.js      # Modelo Mongoose
│   ├── routes/
│   │   └── afectados.js     # Rutas REST + docs Swagger
│   └── app.js               # Configuración Express
├── server.js                # Punto de entrada
├── .env.example             # Variables de entorno ejemplo
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Pruebas Manuales

### Crear afectado
```bash
curl -X POST http://localhost:3000/afectados \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -33.4489,
    "long": -70.6693,
    "numero_celular": 912345678,
    "potencia_red_movil": -75,
    "coneccion_mesh": false
  }'
```

### Listar afectados
```bash
curl http://localhost:3000/afectados
```

### Obtener por ID
```bash
curl http://localhost:3000/afectados/64f1a2b3c4d5e6f7a8b9c0d1
```

### Obtener por celular
```bash
curl http://localhost:3000/afectadoPorCelular/912345678
```

### Actualizar
```bash
curl -X PUT http://localhost:3000/afectados/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -33.4500,
    "long": -70.6700,
    "numero_celular": 912345678,
    "potencia_red_movil": -80,
    "coneccion_mesh": true
  }'
```

### Eliminar
```bash
curl -X DELETE http://localhost:3000/afectados/64f1a2b3c4d5e6f7a8b9c0d1
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia en modo producción |
| `npm run dev` | Inicia en modo desarrollo con nodemon |
| `npm test` | Ejecuta pruebas (pendiente) |

## 🐳 Despliegue con Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t emerred-api .
docker run -p 3000:3000 --env-file .env emerred-api
```

## 📦 Portabilidad

Este proyecto está diseñado para ser **100% portable**:

1. **Sin dependencias de sistema** - Solo Node.js y MongoDB
2. **Variables de entorno** - Toda la configuración en `.env`
3. **Sin rutas hardcodeadas** - Usa `process.cwd()` y paths relativos
4. **Docker-ready** - Incluye Dockerfile funcional
5. **Cross-platform** - Funciona en Linux, macOS, Windows

Para mover a otra máquina:
```bash
# En máquina origen
tar -czf emerred-api.tar.gz --exclude=node_modules --exclude=.env .

# En máquina destino
tar -xzf emerred-api.tar.gz
cd backend
npm install
cp .env.example .env
# Editar .env
npm run dev
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

ISC License - ver archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **EmerRed** - Sistema de contacto para catástrofes

---

**¿Preguntas?** Revisa la documentación Swagger en `/api-docs` o abre un issue.