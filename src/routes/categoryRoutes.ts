import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Any authenticated user can view categories
router.get('/', authMiddleware, (req, res) => categoryController.getAllCategories(req, res));

// Admin only — create and delete
router.post('/', authMiddleware, roleGuard('ADMIN'), (req, res) =>
  categoryController.createCategory(req, res)
);
router.delete('/:id', authMiddleware, roleGuard('ADMIN'), (req, res) =>
  categoryController.deleteCategory(req, res)
);

export default router;
