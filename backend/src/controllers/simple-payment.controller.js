import prisma from '../prisma/db.js';

// CREAR PREFERENCIA SIMPLE (SIN MERCADOPAGO)
export const createSimplePaymentPreference = async (req, res) => {
  try {
    console.log('💳 CREANDO PREFERENCIA SIMPLE...');
    console.log('📋 Datos recibidos:', req.body);

    const { items, totalAmount, cartItems } = req.body;
    const userId = req.user?.id || 1;

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    console.log('👤 Usuario:', userId);
    console.log('💰 Total:', totalAmount);

    // Crear orden en la base de datos
    let orderItemsData = [];

    // Si tenemos cartItems con productIds
    if (cartItems && Array.isArray(cartItems)) {
      for (const cartItem of cartItems) {
        const productId = parseInt(cartItem.productId || cartItem.id);
        
        if (!productId || isNaN(productId)) {
          console.error('❌ ProductId inválido:', cartItem);
          continue;
        }

        // Verificar que el producto existe
        try {
          const product = await prisma.product.findUnique({
            where: { id: productId }
          });

          if (product) {
            orderItemsData.push({
              productId: productId,
              quantity: parseInt(cartItem.quantity),
              price: parseFloat(cartItem.unit_price)
            });
            console.log(`✅ Producto ${product.name} agregado a la orden`);
          } else {
            console.log(`❌ Producto no encontrado: ID ${productId}`);
          }
        } catch (error) {
          console.error('Error verificando producto:', error);
        }
      }
    }

    // Calcular total
    const calculatedTotal = totalAmount || items.reduce((sum, item) => 
      sum + (parseFloat(item.unit_price) * parseInt(item.quantity)), 0
    );

    console.log('📦 Creando orden con', orderItemsData.length, 'productos');

    // Crear orden
    const order = await prisma.order.create({
      data: {
        userId: userId,
        status: 'PENDING',
        total: calculatedTotal,
        paymentMethod: 'MERCADOPAGO',
        orderItems: orderItemsData.length > 0 ? {
          create: orderItemsData
        } : undefined
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('✅ Orden creada:', order.id);

    // Simular preferencia de MercadoPago
    const preferenceId = `SIMPLE_${Date.now()}_${order.id}`;
    const mockPreference = {
      id: preferenceId,
      init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&order_id=${order.id}`,
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'MXN'
      })),
      external_reference: order.id.toString(),
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
      preference: mockPreference,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        itemsCount: order.orderItems?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ ERROR CREANDO PREFERENCIA:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// WEBHOOK SIMPLE
export const simplePaymentWebhook = async (req, res) => {
  try {
    console.log('🔔 WEBHOOK SIMPLE recibido:', req.body);
    console.log('📋 Query params:', req.query);

    // Simular procesamiento exitoso
    res.status(200).json({
      success: true,
      message: 'Webhook procesado (modo simple)'
    });

  } catch (error) {
    console.error('❌ ERROR EN WEBHOOK:', error);
    res.status(500).json({
      error: 'Error procesando webhook'
    });
  }
};