import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Admin only
router.get('/users', authMiddleware, roleGuard('ADMIN'), (req, res) =>
  authController.getAllUsers(req as any, res)
);

export default router;
