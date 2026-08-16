const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  passwordHash: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    select: false // No incluir en consultas por defecto
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'operator', 'viewer'],
      message: 'Rol inválido: {VALUE}. Debe ser admin, operator o viewer'
    },
    default: 'viewer'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Método para comparar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Método para obtener datos públicos (sin passwordHash)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Transformar salida JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);