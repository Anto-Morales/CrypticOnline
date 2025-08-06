import express from 'express';
import { authenticateToken, adminMiddleware } from '../middleware/auth.middleware.js';
import {
  getPaymentStats,
  getAllPayments,
  updatePaymentStatus,
} from '../controllers/admin.payments.controller.js';

const router = express.Router();

/**
 * 📊 GET /api/admin/payments/stats
 * Obtener estadísticas de pagos (solo admin)
 */
router.get('/stats', authenticateToken, adminMiddleware, getPaymentStats);

/**
 * 📋 GET /api/admin/payments
 * Obtener lista de todos los pagos (solo admin)
 */
router.get('/', authenticateToken, adminMiddleware, getAllPayments);

/**
 * 🔄 PUT /api/admin/payments/:id/status
 * Actualizar estado de un pago (solo admin)
 */
router.put('/:id/status', authenticateToken, adminMiddleware, updatePaymentStatus);

export default router;
