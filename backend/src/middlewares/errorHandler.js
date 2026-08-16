const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(409).json({
      success: false,
      message: `${field} ya existe`,
      errors: [{ field, message: `Ya existe un registro con ${field}: ${value}` }]
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errors: [{ field: err.path, message: 'El ID proporcionado no es un ObjectId válido' }]
    });
  }
  
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Servicio de base de datos no disponible',
      errors: [{ field: 'database', message: 'No se pudo conectar a MongoDB' }]
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    errors: process.env.NODE_ENV === 'development' ? [{ field: 'server', message: err.stack }] : undefined
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    errors: [{ field: 'route', message: 'El endpoint solicitado no existe' }]
  });
};

module.exports = { errorHandler, notFound };