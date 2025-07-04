import prisma from '../prisma/db.js';

export const createProduct = async (req, res) => {
  const { name, description, price, imageUrl } = req.body;

  // Solo admins pueden crear productos
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        userId: req.user.userId // viene del token JWT
      }
    });

    res.status(201).json({ message: 'Producto creado', product });
  } catch (error) {
    console.error('[ERROR createProduct]', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};
