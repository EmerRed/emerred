const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token no proporcionado',
        errors: [{ field: 'authorization', message: 'Se requiere header Authorization: Bearer <token>' }]
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token vacío',
        errors: [{ field: 'authorization', message: 'Token no válido' }]
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Usuario no encontrado',
        errors: [{ field: 'authorization', message: 'El usuario asociado al token no existe' }]
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token inválido',
        errors: [{ field: 'authorization', message: 'Token malformado o firma inválida' }]
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token expirado',
        errors: [{ field: 'authorization', message: 'La sesión ha expirado, inicie sesión nuevamente' }]
      });
    }
    
    next(error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Usuario no autenticado',
        errors: [{ field: 'authorization', message: 'Se requiere autenticación' }]
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Prohibido: Permisos insuficientes',
        errors: [{ field: 'role', message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}` }]
      });
    }
    
    next();
  };
};

module.exports = { auth, requireRole };