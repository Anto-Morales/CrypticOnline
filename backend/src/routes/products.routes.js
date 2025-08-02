import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    getProductStats,
    seedProducts,
    updateProduct,
    updateStockAfterPurchase
} from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas (para la tienda y admin dashboard)
router.get('/', getProducts);              // Público para mostrar productos
router.get('/stats', getProductStats);     // Público para estadísticas
router.get('/:id', getProductById);        // Público para detalles

// Ruta temporal para poblar base de datos (SOLO PARA DESARROLLO)
router.post('/seed', seedProducts);        // Crear productos de ejemplo

// Rutas protegidas (solo para usuarios autenticados - admin)
router.post('/', authMiddleware, createProduct);              // Crear producto
router.put('/:id', authMiddleware, updateProduct);           // Actualizar producto  
router.delete('/:id', authMiddleware, deleteProduct);        // Eliminar producto
router.post('/update-stock', authMiddleware, updateStockAfterPurchase); // Actualizar stock

export default router;