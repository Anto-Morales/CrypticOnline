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
    wallet,
    role, // 👈 se agrega aquí
  } = req.body;

  if (!email || !password || !nombres || !apellidoPaterno) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

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
        wallet,
        role: role || 'customer', // 👈 este campo es la clave
      },
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        nombres: newUser.nombres,
        role: newUser.role, // 👈 útil para verificar que se guardó como admin
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[ERROR registerUser]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
