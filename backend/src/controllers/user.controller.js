import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const {
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    email,
    password,
    telefono,
    calle,
    numero,
    colonia,
    ciudad,
    estado,
    codigoPostal,
    referencias,
    wallet
  } = req.body;

  if (!email || !password || !nombres || !apellidoPaterno) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    const newUser = await prisma.user.create({
      data: {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        email,
        password: hashedPassword, 
        telefono,
        calle,
        numero,
        colonia,
        ciudad,
        estado,
        codigoPostal,
        referencias,
        wallet
      },
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        nombres: newUser.nombres,
        createdAt: newUser.createdAt,
      } 
    });

  } catch (error) {
    console.error('[ERROR registerUser]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const makeUserAdmin = async (req, res) => {
  const { id } = req.params;

  // Solo admins pueden hacer esto
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado. Solo admins pueden cambiar roles.' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: 'admin' },
    });

    res.json({ message: 'Usuario promovido a admin', user: updated });
  } catch (error) {
    console.error('[ERROR makeUserAdmin]', error);
    res.status(500).json({ error: 'Error al cambiar el rol' });
  }
};
