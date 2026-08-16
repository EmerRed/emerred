const express = require('express');
const cors = require('cors');
const { swaggerSetup } = require('./config/swagger');
const afectadosRoutes = require('./routes/afectados');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/afectados', afectadosRoutes);

swaggerSetup(app);

app.use(notFound);
app.use(errorHandler);

module.exports = app;