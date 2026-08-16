const Joi = require('joi');

const afectadoSchema = Joi.object({
  lat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'La latitud debe ser un número',
      'number.min': 'La latitud debe ser mayor o igual a -90',
      'number.max': 'La latitud debe ser menor o igual a 90',
      'any.required': 'La latitud es obligatoria'
    }),
  long: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'La longitud debe ser un número',
      'number.min': 'La longitud debe ser mayor o igual a -180',
      'number.max': 'La longitud debe ser menor o igual a 180',
      'any.required': 'La longitud es obligatoria'
    }),
  numero_celular: Joi.number()
    .integer()
    .min(100000000)
    .max(9999999999)
    .required()
    .messages({
      'number.base': 'El número de celular debe ser un número',
      'number.integer': 'El número de celular debe ser un entero',
      'number.min': 'El número de celular debe tener al menos 9 dígitos',
      'number.max': 'El número de celular no puede exceder 10 dígitos',
      'any.required': 'El número de celular es obligatorio'
    }),
  potencia_red_movil: Joi.number()
    .integer()
    .min(-150)
    .max(0)
    .required()
    .messages({
      'number.base': 'La potencia de red móvil debe ser un número',
      'number.integer': 'La potencia de red móvil debe ser un entero',
      'number.min': 'La potencia de red móvil debe ser mayor o igual a -150 dBm',
      'number.max': 'La potencia de red móvil debe ser menor o igual a 0 dBm',
      'any.required': 'La potencia de red móvil es obligatoria'
    }),
  coneccion_mesh: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'La conexión mesh debe ser un valor booleano (true/false)',
      'any.required': 'El estado de conexión mesh es obligatorio'
    })
});

const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)',
      'any.required': 'El ID es obligatorio'
    })
});

const celularParamSchema = Joi.object({
  numero_celular: Joi.number()
    .integer()
    .min(100000000)
    .max(9999999999)
    .required()
    .messages({
      'number.base': 'El número de celular debe ser un número',
      'number.integer': 'El número de celular debe ser un entero',
      'number.min': 'El número de celular debe tener al menos 9 dígitos',
      'number.max': 'El número de celular no puede exceder 10 dígitos',
      'any.required': 'El número de celular es obligatorio'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres',
      'any.required': 'La contraseña es obligatoria'
    })
});

const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  role: Joi.string()
    .valid('admin', 'operator', 'viewer')
    .default('viewer')
    .messages({
      'any.only': 'Rol inválido. Debe ser admin, operator o viewer'
    })
});

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      });
    }
    
    req[property] = value;
    next();
  };
};

module.exports = {
  validateAfectado: validate(afectadoSchema),
  validateIdParam: validate(idParamSchema, 'params'),
  validateCelularParam: validate(celularParamSchema, 'params'),
  validateLogin: validate(loginSchema),
  validateRegister: validate(registerSchema)
};