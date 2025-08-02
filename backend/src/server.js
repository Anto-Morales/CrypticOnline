import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Routes
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.fixed.js'; // RESTAURADO
import productsRoutes from './routes/products.routes.js';
import simpleProductsRoutes from './routes/simple-products.routes.js';
// import simplePaymentRoutes from './routes/simple-payment.routes.js'; // Ya no necesario

import notificationRoutes from './routes/notification.routes.js';
import userOrdersRoutes from './routes/user-orders.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Use routes
console.log('🔗 Registrando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/simple-products', simpleProductsRoutes); // Rutas simples para pruebas
app.use('/api/payments', paymentRoutes); // Rutas completas de MercadoPago
app.use('/api/orders', userOrdersRoutes); // Rutas de órdenes de usuario
app.use('/api/user', userRoutes); // NUEVA RUTA PARA USUARIO
app.use('/api/notifications', notificationRoutes); // NUEVA RUTA PARA NOTIFICACIONES
console.log('✅ Rutas registradas');

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API CrypticOnline funcionando',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/products',
      'POST /api/products/seed',
      'GET /api/products/stats',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'GET /api/simple-products/test-connection',
      'POST /api/simple-products/create',
      'POST /api/payments/create',
      'POST /api/payments/webhook'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    suggestion: 'Verifica que la ruta sea correcta',
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/products',
      'POST /api/products/seed',
      'GET /api/products/stats'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🚀 Servidor CrypticOnline iniciado`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('🧪 ===================================');
  console.log('🧪 Para poblar productos:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/products/seed`);
  console.log('🧪 ===================================');
});
