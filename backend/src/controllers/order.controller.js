import prisma from '../prisma/db.js';

// Crear pedido con varios productos
export const createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    // items: [{ productId, quantity }]

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          discounts: true,
        },
      });

      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      let finalPrice = product.price;

      // Si tiene un descuento activo
      const now = new Date();
      const activeDiscount = product.discounts.find(
        (d) => new Date(d.startDate) <= now && now <= new Date(d.endDate)
      );

      if (activeDiscount) {
        finalPrice = finalPrice * (1 - activeDiscount.percentage / 100);
      }

      total += finalPrice * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: finalPrice,
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        paymentMethod,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
};

// Obtener todos los pedidos del usuario con productos y cantidades
export const getUserOrdersWithItems = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('[ERROR getUserOrdersWithItems]', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// Obtener pedido por ID con productos y cantidades
export const getOrderByIdWithItems = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado o pedido no encontrado' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('[ERROR getOrderByIdWithItems]', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// Actualizar estado y txHash del pedido
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, txHash } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });

    if (!order || order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado o pedido no encontrado' });
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status, txHash },
    });

    res.status(200).json({ message: 'Pedido actualizado', order: updated });
  } catch (error) {
    console.error('[ERROR updateOrderStatus]', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
};

// Eliminar pedido (y sus orderItems en cascada si configuras Prisma)
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });

    if (!order || order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'No autorizado o pedido no encontrado' });
    }

    await prisma.order.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Pedido eliminado' });
  } catch (error) {
    console.error('[ERROR deleteOrder]', error);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};
