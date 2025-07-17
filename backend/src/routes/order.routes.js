import express from 'express';
import {
  createOrderWithItems,
  getUserOrdersWithItems,
  getOrderByIdWithItems,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createOrderWithItems);
router.get('/', getUserOrdersWithItems);
router.get('/:id', getOrderByIdWithItems);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
