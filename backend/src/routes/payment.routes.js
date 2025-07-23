// src/routes/payment.routes.js
import { Router } from 'express';
import {
  createMercadoPagoPreference,
  handleMercadoPagoWebhook,
} from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Generar link de pago (usuario autenticado)
router.post('/create', authenticateToken, createMercadoPagoPreference);

// Endpoint público para recibir notificaciones
router.post('/webhook', handleMercadoPagoWebhook);

export default router;
