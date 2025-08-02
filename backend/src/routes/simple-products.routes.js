import express from 'express';
import {
    createSimpleProduct,
    deleteSimpleProduct,
    getSimpleProducts,
    testConnection,
    updateSimpleProduct
} from '../controllers/simple-products.controller.js';

const router = express.Router();

// Ruta para probar conexión
router.get('/test-connection', testConnection);

// Ruta para obtener productos
router.get('/', getSimpleProducts);

// Ruta simple para crear producto
router.post('/create', createSimpleProduct);

// Ruta para actualizar producto
router.put('/:id', updateSimpleProduct);

// Ruta para eliminar producto
router.delete('/:id', deleteSimpleProduct);

export default router;