import prisma from '../prisma/db.js';

// Crear pedido con varios productos
export const createOrderWithItems = async (req, res) => {
  const { status, txHash, items } = req.body;
  // items = [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto en el pedido' });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        status: status || 'pendiente',
        txHash,
        orderItems: {
          create: items.map(({ productId, quantity }) => ({
            productId,
            quantity: quantity || 1,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'Pedido creado', order });
  } catch (error) {
    console.error('[ERROR createOrderWithItems]', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
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
