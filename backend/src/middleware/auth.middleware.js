import jwt from 'jsonwebtoken';
import prisma from '../prisma/db.js';

// Middleware de autenticación REAL con JWT
export const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Middleware de autenticación REAL');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }
    
    const token = authHeader.substring(7); // Remover "Bearer "
    
    if (!token) {
      console.log('❌ Empty token');
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de acceso no válido'
      });
    }
    
    console.log('🔍 Verificando token...');
    
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', { userId: decoded.userId, email: decoded.email });
    
    // Obtener el usuario de la base de datos
    // Si no hay userId, usar email como alternativa
    let user;
    if (decoded.userId) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nombres: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          telefono: true,
          calle: true,
          numero: true,
          colonia: true,
          ciudad: true,
          estado: true,
          codigoPostal: true,
          referencias: true,
          role: true,
          isActive: true
        }
      });
    } else if (decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: {
          id: true,
          email: true,
          nombres: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          telefono: true,
          calle: true,
          numero: true,
          colonia: true,
          ciudad: true,
          estado: true,
          codigoPostal: true,
          referencias: true,
          role: true,
          isActive: true
        }
      });
    }
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe'
      });
    }
    
    if (!user.isActive) {
      console.log('❌ Usuario inactivo');
      return res.status(401).json({ 
        error: 'Usuario inactivo',
        message: 'Tu cuenta está desactivada'
      });
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Agregar usuario a la request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de acceso no válido'
      });
    }
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error verificando autenticación'
    });
  }
};

// Alias para compatibilidad
export const authenticateToken = authMiddleware;

// Middleware específico para admin
export const adminMiddleware = async (req, res, next) => {
  try {
    // Primero verificar autenticación
    await authMiddleware(req, res, () => {
      // Verificar que el usuario sea admin
      if (req.user && req.user.role === 'ADMIN') {
        console.log('✅ Usuario admin verificado:', req.user.email);
        next();
      } else {
        console.log('❌ Acceso denegado - No es admin:', req.user?.email);
        res.status(403).json({ 
          error: 'Acceso denegado',
          message: 'Necesitas permisos de administrador'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error en middleware de admin:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error verificando permisos de admin'
    });
  }
};
