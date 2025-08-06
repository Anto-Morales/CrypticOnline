import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 📊 GET /api/admin/payments/stats
 * Obtener estadísticas de pagos para el panel de administración
 */
const getPaymentStats = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas REALES de pagos para admin...');

    // Obtener todos los pagos de la base de datos
    const allPayments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                nombres: true,
                apellidoPaterno: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📋 Total de pagos encontrados en BD: ${allPayments.length}`);

    // Filtrar solo pagos completados para estadísticas de ingresos
    const completedPayments = allPayments.filter((payment) => payment.status === 'COMPLETED');
    console.log(`💰 Pagos completados: ${completedPayments.length}`);

    // Calcular ingresos totales
    const totalRevenue = completedPayments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0);

    const totalTransactions = completedPayments.length;

    // Calcular ingresos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = completedPayments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= today && paymentDate < tomorrow;
    });

    const todayRevenue = todayPayments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0);

    const todayTransactions = todayPayments.length;

    // Estadísticas por método de pago (solo métodos reales que existen en BD)
    const methodCounts = {};
    completedPayments.forEach((payment) => {
      const method = payment.method || 'UNKNOWN';
      if (!methodCounts[method]) {
        methodCounts[method] = { count: 0, amount: 0 };
      }
      methodCounts[method].count++;
      methodCounts[method].amount += parseFloat(payment.amount) || 0;
    });

    const methodStats = Object.entries(methodCounts).map(([method, data]) => ({
      method: getMethodDisplayName(method),
      count: data.count,
      amount: data.amount,
      percentage: totalTransactions > 0 ? (data.count / totalTransactions) * 100 : 0,
    }));

    // Log para debugging
    console.log('✅ Estadísticas REALES calculadas:', {
      totalPayments: allPayments.length,
      completedPayments: completedPayments.length,
      totalRevenue: totalRevenue.toFixed(2),
      todayRevenue: todayRevenue.toFixed(2),
      methodsFound: Object.keys(methodCounts),
    });

    res.json({
      success: true,
      totalRevenue,
      totalTransactions,
      todayRevenue,
      todayTransactions,
      methodStats,
      debug: {
        totalPaymentsInDB: allPayments.length,
        methodsInDB: Object.keys(methodCounts),
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de pagos',
      error: error.message,
    });
  }
};

/**
 * 📋 GET /api/admin/payments
 * Obtener lista de todos los pagos REALES para el panel de administración
 */
const getAllPayments = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de pagos REALES para admin...');

    const { page = 1, limit = 50, status, method } = req.query;

    // Construir filtros solo para datos reales
    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (method && method !== 'ALL') {
      where.method = method;
    }

    console.log('🔍 Filtros aplicados:', where);

    // Obtener pagos REALES con paginación
    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                nombres: true,
                apellidoPaterno: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    // Contar total de pagos REALES para paginación
    const totalPayments = await prisma.payment.count({ where });

    // Log detallado para debugging
    console.log(`✅ Pagos REALES encontrados: ${payments.length} de ${totalPayments} totales`);

    if (payments.length > 0) {
      console.log('📊 Detalles de pagos encontrados:');
      payments.forEach((payment, index) => {
        console.log(
          `  ${index + 1}. Pago #${payment.id} - Orden #${payment.orderId} - ${payment.method} - ${payment.status} - $${payment.amount}`
        );
      });

      // Mostrar métodos únicos encontrados
      const uniqueMethods = [...new Set(payments.map((p) => p.method))];
      console.log('💳 Métodos de pago únicos en BD:', uniqueMethods);
    } else {
      console.log('⚠️ No se encontraron pagos en la base de datos');
    }

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPayments,
        pages: Math.ceil(totalPayments / parseInt(limit)),
      },
      debug: {
        totalPaymentsInDB: totalPayments,
        currentPageResults: payments.length,
        filtersApplied: where,
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo lista de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de pagos',
      error: error.message,
    });
  }
};

/**
 * 🔄 PUT /api/admin/payments/:id/status
 * Actualizar estado de un pago (solo para admin)
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log(`🔄 Actualizando estado del pago ${id} a ${status}...`);

    // Validar estado
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de pago inválido',
      });
    }

    // Actualizar pago
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        processedAt: status === 'COMPLETED' ? new Date() : null,
        ...(notes && { metadata: { adminNotes: notes } }),
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    // Si se completa el pago, actualizar la orden
    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: updatedPayment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Crear notificación para el usuario
      await prisma.notification.create({
        data: {
          userId: updatedPayment.order.userId,
          type: 'PAYMENT',
          title: 'Pago Confirmado',
          message: `Tu pago de $${updatedPayment.amount} ha sido confirmado`,
          isRead: false,
        },
      });
    }

    console.log('✅ Estado del pago actualizado exitosamente');

    res.json({
      success: true,
      message: 'Estado del pago actualizado exitosamente',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('❌ Error actualizando estado del pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado del pago',
      error: error.message,
    });
  }
};

/**
 * 🔍 FUNCIÓN AUXILIAR: Convertir método de pago a nombre display (solo métodos reales)
 */
const getMethodDisplayName = (method) => {
  switch (method?.toUpperCase()) {
    case 'MERCADOPAGO':
      return 'MercadoPago';
    case 'CARD':
      return 'Tarjeta';
    case 'TRANSFER':
      return 'Transferencia';
    case 'PAYPAL':
      return 'PayPal';
    case 'CRYPTO':
      return 'Criptomonedas';
    // Solo incluir métodos que realmente hemos implementado
    // Remover OXXO hasta que se implemente
    default:
      return method || 'Desconocido';
  }
};

export { getPaymentStats, getAllPayments, updatePaymentStatus };
