import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/db.js';

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
    role,
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
    // Aca es donde se hace la encriptacion de la contraseña
    // bcrypt es una libreria que se utiliza para encriptar contraseñas
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
        role: role || 'customer',
      },
    });

    // Genera el token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        nombres: newUser.nombres,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('[ERROR registerUser]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombres: user.nombres,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[ERROR loginUser]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Viene del middleware de autenticación

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        email: true,
        telefono: true,
        role: true,
        createdAt: true,
        // No incluimos password por seguridad
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Perfil obtenido exitosamente',
      user,
    });
  } catch (error) {
    console.error('[ERROR getUserProfile]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
