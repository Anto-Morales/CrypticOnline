import express from 'express';
import {
  createOrder,
  getOrderByIdCorrected,
  getOrderByPreferenceIdCorrected,
  getUserOrders,
} from '../controllers/order.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Crear una nueva orden
router.post('/', authenticateToken, createOrder);

// Obtener todas las órdenes del usuario
router.get('/', authenticateToken, getUserOrders);

// Obtener orden por preference ID (debe ir antes que /:orderId)
router.get('/by-preference/:preferenceId', authenticateToken, getOrderByPreferenceIdCorrected);

// Obtener orden específica por ID
router.get('/:orderId', authenticateToken, getOrderByIdCorrected);

console.log('✅ Rutas de órdenes registradas (CORREGIDAS):');
console.log('  - POST /api/orders');
console.log('  - GET /api/orders');
console.log('  - GET /api/orders/by-preference/:preferenceId');
console.log('  - GET /api/orders/:orderId');

export default router;
