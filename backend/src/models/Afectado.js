const mongoose = require('mongoose');

const afectadoSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: [true, 'La latitud es obligatoria'],
    min: [-90, 'La latitud debe ser mayor o igual a -90'],
    max: [90, 'La latitud debe ser menor o igual a 90'],
    validate: {
      validator: function(v) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'La latitud debe ser un número decimal válido'
    }
  },
  long: {
    type: Number,
    required: [true, 'La longitud es obligatoria'],
    min: [-180, 'La longitud debe ser mayor o igual a -180'],
    max: [180, 'La longitud debe ser menor o igual a 180'],
    validate: {
      validator: function(v) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'La longitud debe ser un número decimal válido'
    }
  },
  numero_celular: {
    type: Number,
    required: [true, 'El número de celular es obligatorio'],
    unique: true,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 100000000 && v <= 9999999999;
      },
      message: 'El número de celular debe ser un entero válido (ej: 912345678)'
    }
  },
  potencia_red_movil: {
    type: Number,
    required: [true, 'La potencia de red móvil es obligatoria'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= -150 && v <= 0;
      },
      message: 'La potencia de red móvil debe ser un entero entre -150 y 0 dBm'
    }
  },
  coneccion_mesh: {
    type: Boolean,
    required: [true, 'El estado de conexión mesh es obligatorio'],
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

afectadoSchema.index({ numero_celular: 1 }, { unique: true });

afectadoSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Afectado', afectadoSchema);