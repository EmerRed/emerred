require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const seedAdmin = require('./src/config/seedAdmin');
const { attachAlarmChannel, closeAlarmChannel } = require('./src/config/alarma');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    const server = http.createServer(app);
    attachAlarmChannel(server);

    server.listen(PORT, () => {
      console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}`);
      console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`🔔 Canal de alarma WebSocket: ws://localhost:${PORT}/alarma`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Recibida señal ${signal}. Cerrando servidor...`);
      closeAlarmChannel();
      server.close(async () => {
        console.log('✅ Servidor HTTP cerrado');
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Conexión a MongoDB cerrada');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('❌ Cierre forzado por timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
