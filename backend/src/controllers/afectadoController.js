const Afectado = require('../models/Afectado');

const createAfectado = async (req, res, next) => {
  try {
    const afectado = await Afectado.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Afectado creado exitosamente',
      data: afectado
    });
  } catch (error) {
    next(error);
  }
};

const getAllAfectados = async (req, res, next) => {
  try {
    const afectados = await Afectado.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Lista de afectados obtenida exitosamente',
      data: afectados,
      count: afectados.length
    });
  } catch (error) {
    next(error);
  }
};

const getAfectadoById = async (req, res, next) => {
  try {
    const afectado = await Afectado.findById(req.params.id);
    if (!afectado) {
      return res.status(404).json({
        success: false,
        message: 'Afectado no encontrado',
        errors: [{ field: 'id', message: 'No existe un afectado con el ID proporcionado' }]
      });
    }
    res.json({
      success: true,
      message: 'Afectado encontrado',
      data: afectado
    });
  } catch (error) {
    next(error);
  }
};

const getAfectadoByCelular = async (req, res, next) => {
  try {
    const { numero_celular } = req.params;
    const afectado = await Afectado.findOne({ numero_celular: Number(numero_celular) });
    if (!afectado) {
      return res.status(404).json({
        success: false,
        message: 'Afectado no encontrado',
        errors: [{ field: 'numero_celular', message: 'No existe un afectado con este número de celular' }]
      });
    }
    res.json({
      success: true,
      message: 'Afectado encontrado por número de celular',
      data: afectado
    });
  } catch (error) {
    next(error);
  }
};

const updateAfectado = async (req, res, next) => {
  try {
    const afectado = await Afectado.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!afectado) {
      return res.status(404).json({
        success: false,
        message: 'Afectado no encontrado',
        errors: [{ field: 'id', message: 'No existe un afectado con el ID proporcionado' }]
      });
    }
    res.json({
      success: true,
      message: 'Afectado actualizado exitosamente',
      data: afectado
    });
  } catch (error) {
    next(error);
  }
};

const deleteAfectado = async (req, res, next) => {
  try {
    const afectado = await Afectado.findByIdAndDelete(req.params.id);
    if (!afectado) {
      return res.status(404).json({
        success: false,
        message: 'Afectado no encontrado',
        errors: [{ field: 'id', message: 'No existe un afectado con el ID proporcionado' }]
      });
    }
    res.json({
      success: true,
      message: 'Afectado eliminado exitosamente',
      data: { id: afectado._id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAfectado,
  getAllAfectados,
  getAfectadoById,
  getAfectadoByCelular,
  updateAfectado,
  deleteAfectado
};