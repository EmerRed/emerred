const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getMe,
  refreshToken
} = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middlewares/validation');
const { auth, requireRole } = require('../middlewares/auth');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                         token:
 *                           type: string
 *                           description: JWT token (expira en 8h)
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Credenciales inválidas
 *               errors: [{ field: "password", message: "Email o contraseña incorrectos" }]
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario (solo admin)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: 'password123'
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'Juan Pérez'
 *               role:
 *                 type: string
 *                 enum: [admin, operator, viewer]
 *                 default: viewer
 *                 example: operator
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                         token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         description: Prohibido - Se requiere rol admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', auth, requireRole('admin'), validateRegister, register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual desde token
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/NotFound'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', auth, getMe);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado
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
 *                         token:
 *                           type: string
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/NotFound'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/refresh', auth, refreshToken);

module.exports = router;