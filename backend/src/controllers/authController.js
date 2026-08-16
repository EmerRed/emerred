const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        errors: [{ field: 'email', message: 'Email o contraseña incorrectos' }]
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        errors: [{ field: 'password', message: 'Email o contraseña incorrectos' }]
      });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
        errors: [{ field: 'email', message: 'Ya existe un usuario con este email' }]
      });
    }
    
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, bcryptRounds);
    
    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role || 'viewer'
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        errors: [{ field: 'user', message: 'El usuario ya no existe' }]
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario actual',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        errors: [{ field: 'user', message: 'El usuario ya no existe' }]
      });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Token renovado',
      data: {
        token,
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  refreshToken
};