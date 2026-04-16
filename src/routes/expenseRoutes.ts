import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const expenseController = new ExpenseController();

// All expense routes require authentication
router.use(authMiddleware);

router.post('/', (req, res) => expenseController.createExpense(req as any, res));
router.get('/', (req, res) => expenseController.getExpenses(req as any, res));
router.put('/:id', (req, res) => expenseController.updateExpense(req as any, res));
router.delete('/:id', (req, res) => expenseController.deleteExpense(req as any, res));

export default router;
