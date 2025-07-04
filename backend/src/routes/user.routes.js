import express from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/register', registerUser);


router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user
  });
});

export default router;
