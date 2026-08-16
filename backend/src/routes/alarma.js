const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const { broadcastAlarma, clientCount } = require('../config/alarma');

/**
 * @swagger
 * /alarma/activar:
 *   post:
 *     summary: Activar la alarma de emergencia en todos los dispositivos
 *     tags: [Alarma]
 *     description: >
 *       Difunde `{"alarma": true}` por el canal WebSocket `/alarma` a todas
 *       las aplicaciones móviles conectadas, forzando la activación de la
 *       telemetría y la alerta sonora en cada dispositivo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alarma difundida exitosamente
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
 *                         dispositivosAlcanzados:
 *                           type: integer
 *                           description: Dispositivos que recibieron la señal
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *       403:
 *         description: Rol insuficiente (se requiere admin u operator)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/activar', auth, requireRole('admin', 'operator'), (req, res) => {
  const alcanzados = broadcastAlarma(req.user.email);
  console.log(`🚨 ALARMA activada por ${req.user.email} → ${alcanzados} dispositivo(s)`);
  res.json({
    success: true,
    message: 'Alarma activada y difundida a los dispositivos conectados',
    data: {
      dispositivosAlcanzados: alcanzados,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @swagger
 * /alarma/dispositivos:
 *   get:
 *     summary: Cantidad de dispositivos conectados al canal de alarma
 *     tags: [Alarma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de dispositivos conectados
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
 *                         dispositivosConectados:
 *                           type: integer
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *       403:
 *         description: Rol insuficiente (se requiere admin u operator)
 */
router.get('/dispositivos', auth, requireRole('admin', 'operator'), (req, res) => {
  res.json({
    success: true,
    message: 'Dispositivos conectados al canal de alarma',
    data: { dispositivosConectados: clientCount() },
  });
});

module.exports = router;
