import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Database
import prisma from './prisma/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.fixed.js'; // RESTAURADO
import paymentCardsRoutes from './routes/paymentCards.routes.js'; // NUEVAS RUTAS DE TARJETAS
import productsRoutes from './routes/products.routes.js';
import simpleProductsRoutes from './routes/simple-products.routes.js';
// import simplePaymentRoutes from './routes/simple-payment.routes.js'; // Ya no necesario

import notificationRoutes from './routes/notification.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import userRoutes from './routes/user.routes.js';

// Rutas de administración de pagos
import adminPaymentsRoutes from './routes/admin.payments.routes.js';
// Rutas de administración de usuarios
import adminUsersRoutes from './routes/admin.users.routes.js';
// Rutas de gestión de administradores
import adminManagementRoutes from './routes/admin.management.routes.js';
import adminOrderRoutes from './routes/admin.order.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${req.method} ${req.path} - ${timestamp}`);

  // 🔔 LOGGING ESPECIAL PARA WEBHOOKS DE MERCADOPAGO
  if (req.path.includes('/webhook') || req.path.includes('/payments')) {
    console.log('🎯 WEBHOOK/PAYMENT REQUEST DETECTADO:');
    console.log('  📍 URL:', req.originalUrl);
    console.log('  📦 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('  🔍 User-Agent:', req.headers['user-agent']);
    console.log('  📋 Content-Type:', req.headers['content-type']);

    // Log del body para webhooks (cuidado con datos sensibles)
    if (req.method === 'POST') {
      console.log(
        '  📄 Body preview:',
        req.body ? JSON.stringify(req.body).substring(0, 200) + '...' : 'No body'
      );
    }
  }

  next();
});

// 🔧 MIDDLEWARE PARA DETECTAR REINTENTOS Y EVITAR ÓRDENES DUPLICADAS
const detectRetryMiddleware = (req, res, next) => {
  // Detectar si es un reintento de pago
  const isRetry =
    req.body.isRetry ||
    req.body.retryPayment ||
    req.body.existingOrderId ||
    req.body.updateExistingOrder ||
    req.body.doNotCreateNewOrder ||
    (req.body.metadata && req.body.metadata.doNotCreateNewOrder);

  if (isRetry) {
    console.log('🔄 RETRY DETECTADO en middleware');
    console.log('📋 Flags de retry encontrados:', {
      isRetry: req.body.isRetry,
      retryPayment: req.body.retryPayment,
      existingOrderId: req.body.existingOrderId,
      updateExistingOrder: req.body.updateExistingOrder,
      doNotCreateNewOrder: req.body.doNotCreateNewOrder,
      metadataFlag: req.body.metadata?.doNotCreateNewOrder,
    });

    req.isRetryRequest = true;
    req.existingOrderId = req.body.existingOrderId || req.body.metadata?.originalOrderId;
  }

  next();
};

// Use routes
console.log('🔗 Registrando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/simple-products', simpleProductsRoutes); // Rutas simples para pruebas
app.use('/api/payments', detectRetryMiddleware, paymentRoutes); // Rutas completas de MercadoPago
app.use('/api/payment-cards', paymentCardsRoutes); // 🃏 RUTAS DE TARJETAS DE PAGO
app.use('/api/orders', orderRoutes); // 📦 RUTAS DE ÓRDENES (usando order.routes.js existente)
app.use('/api/user', userRoutes); // NUEVA RUTA PARA USUARIO
app.use('/api/notifications', notificationRoutes); // NUEVA RUTA PARA NOTIFICACIONES
app.use('/api/payments', paymentsRoutes); // NUEVA RUTA PARA PAGOS
app.use('/api/admin/payments', adminPaymentsRoutes); // Rutas de administración de pagos
app.use('/api/admin/users', adminUsersRoutes); // Rutas de administración de usuarios
app.use('/api/admin/management', adminManagementRoutes); // Rutas de gestión de administradores
app.use(adminOrderRoutes);
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
      'POST /api/payments/webhook',
      'GET /api/payment-cards',
      'POST /api/payment-cards',
      'POST /api/orders',
      'GET /api/orders',
      'GET /api/orders/:id',
    ],
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('💚 Health check solicitado');
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT,
    routes: [
      '/api/auth/*',
      '/api/products/*',
      '/api/simple-products/*',
      '/api/payments/*',
      '/api/payment-cards/*',
      '/api/orders/*',
      '/api/user/*',
      '/api/notifications/*',
    ],
  });
});

// 🎯 ENDPOINT DE DIAGNÓSTICO PARA WEBHOOKS
app.all('/api/payments/webhook', (req, res) => {
  console.log('🚨 WEBHOOK DE MERCADOPAGO RECIBIDO!');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔗 Método:', req.method);
  console.log('📍 URL completa:', req.originalUrl);
  console.log('🔍 Query params:', req.query);
  console.log('📦 Headers completos:', JSON.stringify(req.headers, null, 2));
  console.log('📄 Body completo:', JSON.stringify(req.body, null, 2));

  // Responder inmediatamente a MercadoPago
  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    message: 'Webhook received successfully',
  });

  // Aquí deberías procesar el webhook
  console.log('✅ Webhook procesado y respuesta enviada a MercadoPago');
});

// 🧪 ENDPOINT DE PRUEBA PARA WEBHOOKS
app.all('/webhook-test', (req, res) => {
  console.log('🧪 TEST WEBHOOK ENDPOINT HIT!');
  console.log('📦 Method:', req.method);
  console.log('📦 Headers:', req.headers);
  console.log('📦 Body:', req.body);
  console.log('📦 Query:', req.query);

  res.json({
    message: 'Test webhook endpoint working!',
    timestamp: new Date().toISOString(),
    receivedData: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
  });
});

/**
 * 🚨 RUTA TEMPORAL: Crear primer SUPER_ADMIN
 * ⚠️ ELIMINAR DESPUÉS DE CREAR EL PRIMER ADMIN
 */
app.post('/api/create-super-admin-bootstrap', async (req, res) => {
  try {
    const { secretKey } = req.body;

    // Verificar clave secreta para seguridad
    if (secretKey !== 'CRYPTIC_BOOTSTRAP_2025') {
      return res.status(403).json({
        success: false,
        message: 'Clave secreta incorrecta',
      });
    }

    console.log('🚀 Creando SUPER_ADMIN inicial via bootstrap...');

    // Verificar si ya existe algún SUPER_ADMIN
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        adminLevel: 'SUPER_ADMIN',
      },
    });

    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un SUPER_ADMIN en el sistema',
        email: existingSuperAdmin.email,
      });
    }

    // Datos del SUPER_ADMIN
    const superAdminData = {
      nombres: 'Angel Valentin',
      apellidoPaterno: 'Flores',
      apellidoMaterno: 'Admin',
      email: 'angel.edu0808@hotmail.com',
      password: await bcrypt.hash('SuperAdmin2025!', 10),
      telefono: '+52 55 1234 5678',
      calle: 'Calle Principal',
      numero: '123',
      colonia: 'Centro',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigoPostal: '01000',
      referencias: 'Super Administrador Inicial',
      role: 'admin',
      adminLevel: 'SUPER_ADMIN',
      permissions: {
        users: { read: true, create: true, update: true, delete: true },
        orders: { read: true, create: true, update: true, delete: true },
        payments: { read: true, create: true, update: true, delete: true },
        products: { read: true, create: true, update: true, delete: true },
        admins: { read: true, create: true, update: true, delete: true },
        settings: { read: true, update: true },
        reports: { read: true, export: true },
        system: { read: true, update: true, backup: true, restore: true },
      },
      isActive: true,
    };

    // Crear SUPER_ADMIN
    const superAdmin = await prisma.user.create({
      data: superAdminData,
      select: {
        id: true,
        nombres: true,
        apellidoPaterno: true,
        email: true,
        role: true,
        adminLevel: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log('✅ SUPER_ADMIN creado exitosamente:', superAdmin.email);

    res.json({
      success: true,
      message: 'SUPER_ADMIN creado exitosamente',
      admin: superAdmin,
      credentials: {
        email: 'angel.edu0808@hotmail.com',
        password: 'SuperAdmin2025!',
        note: '⚠️ CAMBIAR CONTRASEÑA INMEDIATAMENTE',
      },
    });
  } catch (error) {
    console.error('❌ Error creando SUPER_ADMIN:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando SUPER_ADMIN',
      error: error.message,
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  console.log(`📊 Headers recibidos:`, req.headers);
  console.log(`📦 Body recibido:`, req.body);

  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    suggestion: 'Verifica que la ruta sea correcta',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/products',
      'POST /api/products/seed',
      'GET /api/products/stats',
      'GET /api/simple-products',
      'POST /api/payments/create',
      'POST /api/payments/webhook',
      'POST /api/payments/pay-with-card',
      'GET /api/payment-cards',
      'POST /api/payment-cards',
      'POST /api/orders',
      'GET /api/orders',
      'GET /api/orders/:id',
    ],
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🚀 Servidor CrypticOnline iniciado`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
