const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EmerRed API - Gestión de Afectados',
      version: '1.0.0',
      description: 'API REST para gestión de afectados en situaciones de catástrofe. Permite registrar, consultar y gestionar información de personas afectadas, incluyendo su ubicación geográfica, número de celular, potencia de red móvil y estado de conexión mesh.',
      contact: {
        name: 'Equipo EmerRed',
        email: 'contacto@emerred.org'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'https://emerred-production.up.railway.app',
        description: 'Producción (Railway)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Desarrollo local'
      }
    ],
    tags: [
      {
        name: 'Afectados',
        description: 'Operaciones CRUD para gestión de afectados'
      },
      {
        name: 'Autenticación',
        description: 'Login, registro y gestión de tokens JWT'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en formato: Bearer <token>'
        }
      },
      schemas: {
        Afectado: {
          type: 'object',
          required: ['lat', 'long', 'numero_celular', 'potencia_red_movil', 'coneccion_mesh'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único generado automáticamente por MongoDB',
              readOnly: true
            },
            lat: {
              type: 'number',
              format: 'double',
              description: 'Latitud en formato decimal (ej: -33.4489)',
              minimum: -90,
              maximum: 90,
              example: -33.4489
            },
            long: {
              type: 'number',
              format: 'double',
              description: 'Longitud en formato decimal (ej: -70.6693)',
              minimum: -180,
              maximum: 180,
              example: -70.6693
            },
            numero_celular: {
              type: 'integer',
              description: 'Número de celular sin código de país ni símbolos',
              minimum: 100000000,
              maximum: 9999999999,
              example: 912345678
            },
            potencia_red_movil: {
              type: 'integer',
              description: 'Potencia de señal en dBm (valores típicos: -50 a -120)',
              minimum: -150,
              maximum: 0,
              example: -75
            },
            coneccion_mesh: {
              type: 'boolean',
              description: 'Indica si el dispositivo tiene conexión mesh activa',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del registro',
              readOnly: true
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del registro',
              readOnly: true
            }
          }
        },
        AfectadoInput: {
          type: 'object',
          required: ['lat', 'long', 'numero_celular', 'potencia_red_movil', 'coneccion_mesh'],
          properties: {
            lat: {
              type: 'number',
              format: 'double',
              minimum: -90,
              maximum: 90,
              example: -33.4489
            },
            long: {
              type: 'number',
              format: 'double',
              minimum: -180,
              maximum: 180,
              example: -70.6693
            },
            numero_celular: {
              type: 'integer',
              minimum: 100000000,
              maximum: 9999999999,
              example: 912345678
            },
            potencia_red_movil: {
              type: 'integer',
              minimum: -150,
              maximum: 0,
              example: -75
            },
            coneccion_mesh: {
              type: 'boolean',
              example: false
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario',
              example: '64f1a2b3c4d5e6f7a8b9c0d1'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'admin@gmail.com'
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Administrador'
            },
            role: {
              type: 'string',
              enum: ['admin', 'operator', 'viewer'],
              description: 'Rol del usuario',
              example: 'admin'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Mensaje de error descriptivo'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            data: {}
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Afectado no encontrado',
                errors: [{ field: 'id', message: 'No existe un afectado con el ID proporcionado' }]
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Datos de entrada inválidos',
                errors: [
                  { field: 'lat', message: 'La latitud debe ser un número entre -90 y 90' },
                  { field: 'numero_celular', message: 'El número de celular debe ser un entero válido' }
                ]
              }
            }
          }
        },
        DuplicatePhone: {
          description: 'Número de celular duplicado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'El número de celular ya está registrado',
                errors: [{ field: 'numero_celular', message: 'Ya existe un afectado con este número de celular' }]
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'EmerRed API Documentation'
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { swaggerSetup, swaggerSpec };