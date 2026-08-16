const express = require('express');
const router = express.Router();
const {
  createAfectado,
  getAllAfectados,
  getAfectadoById,
  getAfectadoByCelular,
  updateAfectado,
  deleteAfectado
} = require('../controllers/afectadoController');
const { validateAfectado, validateIdParam, validateCelularParam } = require('../middlewares/validation');

/**
 * @swagger
 * /afectados:
 *   post:
 *     summary: Crear un nuevo afectado
 *     tags: [Afectados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AfectadoInput'
 *     responses:
 *       201:
 *         description: Afectado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Afectado'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/DuplicatePhone'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateAfectado, createAfectado);

/**
 * @swagger
 * /afectados:
 *   get:
 *     summary: Obtener todos los afectados
 *     tags: [Afectados]
 *     responses:
 *       200:
 *         description: Lista de afectados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Afectado'
 *                     count:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAllAfectados);

/**
 * @swagger
 * /afectados/{id}:
 *   get:
 *     summary: Obtener un afectado por su ID
 *     tags: [Afectados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID del afectado (ObjectId de MongoDB)
 *     responses:
 *       200:
 *         description: Afectado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Afectado'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validateIdParam, getAfectadoById);

/**
 * @swagger
 * /afectadoPorCelular/{numero_celular}:
 *   get:
 *     summary: Obtener un afectado por número de celular
 *     tags: [Afectados]
 *     parameters:
 *       - in: path
 *         name: numero_celular
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 100000000
 *           maximum: 9999999999
 *         description: Número de celular del afectado
 *     responses:
 *       200:
 *         description: Afectado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Afectado'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/afectadoPorCelular/:numero_celular', validateCelularParam, getAfectadoByCelular);

/**
 * @swagger
 * /afectados/{id}:
 *   put:
 *     summary: Actualizar un afectado por su ID
 *     tags: [Afectados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID del afectado (ObjectId de MongoDB)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AfectadoInput'
 *     responses:
 *       200:
 *         description: Afectado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Afectado'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/DuplicatePhone'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validateIdParam, validateAfectado, updateAfectado);

/**
 * @swagger
 * /afectados/{id}:
 *   delete:
 *     summary: Eliminar un afectado por su ID
 *     tags: [Afectados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID del afectado (ObjectId de MongoDB)
 *     responses:
 *       200:
 *         description: Afectado eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validateIdParam, deleteAfectado);

module.exports = router;