// src/controllers/payment.controller.js
import { preferenceClient, paymentClient } from '../utils/mercadopago.js';

import prisma from '../prisma/db.js';

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

    // Calcula el total si no viene el amount
    const amountCalc = items.reduce((total, item) => total + item.unit_price * item.quantity, 0);

    const preference = {
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        currency_id: 'MXN',
        unit_price: item.unit_price,
      })),
      back_urls: {
        success: `${process.env.FRONTEND_URL}/success?orderId=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/failure?orderId=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      metadata: {
        orderId,
      },
    };

    const response = await preferenceClient.create({ body: preference });

    await prisma.payment.create({
      data: {
        orderId,
        provider: 'MERCADOPAGO',
        status: 'PENDING',
        referenceId: response.id,
        amount: amount ?? amountCalc,
      },
    });

    res.status(201).json({
      init_point: response.init_point,
      preference_id: response.id,
    });
  } catch (error) {
    console.error('Error al crear pago:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Error al generar el pago', details: error?.message });
  }
};

export const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const paymentId = req.body.data?.id;
    if (!paymentId) return res.sendStatus(400);

    let paymentInfo;
    try {
      paymentInfo = await paymentClient.get({ id: paymentId });
    } catch (err) {
      console.error('Error al obtener información del pago desde MP:', err);
      return res.status(500).json({
        error: 'No se pudo obtener el pago desde Mercado Pago',
        details: err.message,
      });
    }

    const { status, metadata, transaction_amount } = paymentInfo.body ?? {};

    const orderId = metadata?.orderId;

    if (status === 'approved') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paidAt: new Date() },
      });
      await prisma.payment.updateMany({
        where: { referenceId: String(paymentId) },
        data: { status: 'COMPLETED', amount: transaction_amount },
      });
    } else if (status === 'rejected') {
      await prisma.payment.updateMany({
        where: { referenceId: String(paymentId) },
        data: { status: 'FAILED' },
      });
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error en el webhook:', error);
    res.status(500).json({ error: 'Error en el webhook', details: error.message });
  }
};
