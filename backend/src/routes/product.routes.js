import express from 'express';
import { createProduct } from '../controllers/product.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/products', authenticateToken, createProduct);

export default router;
