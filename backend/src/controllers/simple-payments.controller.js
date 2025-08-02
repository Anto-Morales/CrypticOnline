import prisma from '../prisma/db.js';

// CREAR PREFERENCIA DE MERCADOPAGO (SIMULADO)
export const createPaymentPreference = async (req, res) => {
  try {
    console.log('💳 CREANDO PREFERENCIA DE PAGO...');
    console.log('📋 Datos recibidos:', req.body);

    const { items, orderId, totalAmount } = req.body;
    const userId = req.user.id;

    console.log('📦 Datos recibidos:', { items, orderId, userId });

    // Validar que tenemos items
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        error: 'No hay items para procesar',
        received: req.body 
      });
    }

    // Validar usuario autenticado (simplificado)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        message: 'Debes estar logueado para crear una orden'
      });
    }

    console.log('👤 Usuario autenticado:', req.user.id);

    // Crear orden en la base de datos
    console.log('📦 Creando orden en la base de datos...');
    
    let order;
    try {
      // Por ahora crear una orden simple - luego podemos mejorar el modelo
      order = await prisma.order.create({
        data: {
          userId: req.user.id,
          status: 'PENDING',
          total: totalAmount || 0,
          paymentMethod: 'MERCADOPAGO'
        }
      });
      
      console.log('✅ Orden creada:', order.id);
    } catch (dbError) {
      console.error('❌ Error creando orden en DB:', dbError);
      // Continuar sin orden por ahora
      order = { id: Date.now(), status: 'PENDING' };
    }

    // Simular preferencia de MercadoPago
    const preferenceId = `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockPreference = {
      id: preferenceId,
      init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'MXN'
      })),
      back_urls: {
        success: `http://localhost:3000/payment/success?order_id=${order.id}`,
        failure: `http://localhost:3000/payment/failure?order_id=${order.id}`,
        pending: `http://localhost:3000/payment/pending?order_id=${order.id}`
      },
      auto_return: 'approved'
    };

    console.log('🎯 Preferencia simulada creada:', preferenceId);

    res.json({
      success: true,
      message: 'Preferencia de pago creada exitosamente',
      preference: mockPreference,
      order: {
        id: order.id,
        status: order.status,
        total: totalAmount
      }
    });

  } catch (error) {
    console.error('❌ ERROR CREANDO PREFERENCIA:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



// CREAR ORDEN SIMPLE
export const createOrder = async (req, res) => {
  try {
    console.log('📦 CREANDO ORDEN SIMPLE...');
    console.log('📋 Datos recibidos:', req.body);

    const { productId, quantity = 1, items, totalAmount } = req.body;

    // Validar usuario
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado'
      });
    }

    let orderTotal = totalAmount || 0;

    // Si es un producto individual, calcular el total
    if (productId && !totalAmount) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(productId) }
        });

        if (!product) {
          return res.status(404).json({ 
            error: 'Producto no encontrado'
          });
        }

        if (product.stock < quantity) {
          return res.status(400).json({ 
            error: 'Stock insuficiente',
            available: product.stock,
            requested: quantity
          });
        }

        orderTotal = product.price * quantity;
        console.log(`💰 Total calculado: $${orderTotal} (${product.price} x ${quantity})`);
      } catch (productError) {
        console.error('❌ Error obteniendo producto:', productError);
        return res.status(500).json({ 
          error: 'Error obteniendo información del producto'
        });
      }
    }

    // Crear orden
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        status: 'PENDING',
        total: orderTotal,
        paymentMethod: 'MERCADOPAGO'
      }
    });

    console.log('✅ Orden creada exitosamente:', order.id);

    // Simular preferencia de pago
    const preferenceId = `MP_${Date.now()}_${order.id}`;
    const mockPreference = {
      id: preferenceId,
      init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&order_id=${order.id}`,
      back_urls: {
        success: `http://localhost:3000/payment/success?order_id=${order.id}`,
        failure: `http://localhost:3000/payment/failure?order_id=${order.id}`,
        pending: `http://localhost:3000/payment/pending?order_id=${order.id}`
      }
    };

    res.json({
      success: true,
      message: 'Orden creada exitosamente',
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        userId: order.userId,
        createdAt: order.createdAt
      },
      preference: mockPreference
    });

  } catch (error) {
    console.error('❌ ERROR CREANDO ORDEN:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// WEBHOOK PARA RECIBIR NOTIFICACIONES DE MERCADOPAGO
export const paymentWebhook = async (req, res) => {
  try {
    console.log('🔔 WEBHOOK RECIBIDO:', req.body);
    console.log('📋 Query params:', req.query);

    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      console.log('💳 Notificación de pago:', paymentId);
      
      // Aquí iría la lógica para verificar el pago con MercadoPago
      // Por ahora solo simulamos
      
      res.status(200).json({ 
        success: true,
        message: 'Webhook procesado exitosamente'
      });
    } else {
      console.log('ℹ️ Tipo de webhook no manejado:', type);
      res.status(200).json({ 
        success: true,
        message: 'Webhook recibido pero no procesado'
      });
    }

  } catch (error) {
    console.error('❌ ERROR EN WEBHOOK:', error);
    res.status(500).json({
      error: 'Error procesando webhook'
    });
  }
};