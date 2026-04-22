import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const budgetController = new BudgetController();

// All budget routes require authentication
router.use(authMiddleware);

router.post('/', (req, res) => budgetController.createBudget(req as any, res));
router.get('/', (req, res) => budgetController.getBudgets(req as any, res));
router.put('/:id', (req, res) => budgetController.updateBudget(req as any, res));

export default router;
