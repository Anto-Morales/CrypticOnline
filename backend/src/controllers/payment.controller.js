// src/controllers/payment.controller.js
import prisma from '../prisma/db.js';
import { paymentClient, preferenceClient } from '../utils/mercadopago.js';

export const createMercadoPagoPreference = async (req, res) => {
  const { items, amount, orderId } = req.body;
  const userId = req.user.id;

  try {
    if (!orderId) {
      return res.status(400).json({ error: 'orderId es obligatorio' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items son obligatorios' });
    }

    // Convierte orderId a número o genera uno único si es "carrito"
    let numericOrderId;
    if (orderId === 'carrito') {
      // Genera un ID único más pequeño usando los últimos 9 dígitos del timestamp
      numericOrderId = parseInt(Date.now().toString().slice(-9));
    } else {
      numericOrderId = parseInt(orderId);
      if (isNaN(numericOrderId)) {
        return res.status(400).json({ error: 'orderId debe ser un número válido' });
      }
    }

    // Calcula el total si no viene el amount (incluye costo de envío para carrito)
    const shippingCost = orderId === 'carrito' ? 50 : 0;
    const amountCalc =
      items.reduce((total, item) => total + item.unit_price * item.quantity, 0) + shippingCost;

    const preference = {
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        currency_id: 'MXN',
        unit_price: item.unit_price,
      })),
      back_urls: {
        success: `${process.env.FRONTEND_URL}/success`,
        failure: `${process.env.FRONTEND_URL}/failure`,
        pending: `${process.env.FRONTEND_URL}/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
    };

    console.log('Preference creada:', JSON.stringify(preference, null, 2));

    const response = await preferenceClient.create({ body: preference });

    // Primero crear la Order (sin especificar ID, deja que Prisma lo genere)
    const order = await prisma.order.create({
      data: {
        userId: userId,
        status: 'PENDING',
        total: amount ?? amountCalc,
        paymentMethod: 'MERCADOPAGO',
        paymentId: response.id, // Guarda el ID de la preferencia de Mercado Pago
      },
    });

    // Luego crear el Payment asociado a la Order
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'MERCADOPAGO',
        status: 'PENDING',
        referenceId: response.id, // ID de la preferencia, no del pago
        amount: amount ?? amountCalc,
      },
    });

    res.status(201).json({
      init_point: response.init_point,
      preference_id: response.id,
    });
  } catch (error) {
    console.error('Error en createPayment:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// ==========================================
// WEBHOOK CORREGIDO PARA MERCADOPAGO
// ==========================================

export const webhookMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Solo procesar pagos
    if (type !== 'payment') {
      console.log('⚠️ Tipo de webhook ignorado:', type);
      return res.status(200).json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.log('❌ ID de pago no encontrado en webhook');
      return res.status(400).json({ error: 'ID de pago requerido' });
    }

    console.log('🔍 Procesando pago ID:', paymentId);

    // Obtener información del pago desde MercadoPago
    const payment = await paymentClient.get({ id: paymentId });
    const { status, external_reference, transaction_amount } = payment;

    console.log('💳 Estado del pago:', status);
    console.log('📋 Referencia externa:', external_reference);
    console.log('💰 Monto:', transaction_amount);

    if (!external_reference) {
      console.log('❌ Referencia externa no encontrada');
      return res.status(400).json({ error: 'Referencia externa requerida' });
    }

    // Buscar la orden por preference_id
    const order = await prisma.order.findFirst({
      where: { preferenceId: external_reference }
    });

    if (!order) {
      console.log('❌ Orden no encontrada para referencia:', external_reference);
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    console.log('📦 Orden encontrada:', order.id, 'Estado actual:', order.status);

    // Verificar si el pago ya fue procesado
    if (status === 'approved' && order.status === 'PAID') {
      console.log('⚠️ Pago ya procesado, ignorando webhook');
      return res.status(200).json({ message: 'Pago ya procesado' });
    }

    // Procesar según el estado del pago
    if (status === 'approved') {
      console.log('✅ Pago aprobado, actualizando...');
      
      // Usar transacción para consistencia
      await prisma.$transaction(async (tx) => {
        // Actualizar orden
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: 'PAID', 
            paidAt: new Date() 
          },
        });
        
        // Crear/actualizar registro de pago
        await tx.payment.upsert({
          where: { referenceId: String(paymentId) },
          update: { 
            status: 'COMPLETED', 
            amount: transaction_amount || order.total
          },
          create: {
            referenceId: String(paymentId),
            status: 'COMPLETED',
            amount: transaction_amount || order.total,
            provider: 'MERCADOPAGO'
          }
        });
      });

      console.log('✅ Orden y pago actualizados correctamente');

      // Crear notificaciones (importación dinámica para evitar errores)
      try {
        const { createNotification } = await import('../controllers/notification.controller.js');
        
        // Crear notificación de pago exitoso
        await createNotification(
          order.userId,
          'PAYMENT',
          '💳 Pago Confirmado',
          `Tu pago de $${transaction_amount || order.total} MXN ha sido procesado exitosamente.`,
          { orderId: order.id, amount: transaction_amount || order.total }
        );
        
        // Crear notificación de estado de pedido
        await createNotification(
          order.userId,
          'ORDER_STATUS',
          '📦 Pedido en Preparación',
          `Tu pedido #${order.id} ha sido confirmado y está siendo preparado.`,
          { orderId: order.id, status: 'PAID' }
        );

        console.log('✅ Notificaciones creadas exitosamente');
      } catch (notifError) {
        console.error('⚠️ Error creando notificaciones (no crítico):', notifError.message);
      }

    } else if (status === 'pending') {
      console.log('⏳ Pago pendiente');
      await prisma.payment.upsert({
        where: { referenceId: String(paymentId) },
        update: { status: 'PENDING' },
        create: {
          referenceId: String(paymentId),
          status: 'PENDING',
          amount: transaction_amount || order.total,
          provider: 'MERCADOPAGO'
        }
      });

    } else if (status === 'cancelled' || status === 'rejected') {
      console.log('❌ Pago cancelado/rechazado');
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' }
        });
        
        await tx.payment.upsert({
          where: { referenceId: String(paymentId) },
          update: { status: 'FAILED' },
          create: {
            referenceId: String(paymentId),
            status: 'FAILED',
            amount: transaction_amount || order.total,
            provider: 'MERCADOPAGO'
          }
        });
      });
    }

    res.status(200).json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    console.error('❌ Error crítico en webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
