import { Response } from 'express';
import { BudgetService } from '../services/BudgetService';
import { AuthRequest } from '../types/AuthRequest';

const budgetService = new BudgetService();

export class BudgetController {
  async createBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { categoryId, limitAmount, month } = req.body;
      if (!categoryId || !limitAmount || !month) {
        res.status(400).json({ error: 'categoryId, limitAmount and month are required' });
        return;
      }
      const budget = await budgetService.createBudget(req.userId!, {
        categoryId,
        limitAmount,
        month,
      });
      res.status(201).json(budget);
    } catch (error: any) {
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('already exists')
        ? 409
        : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async getBudgets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { month } = req.query;
      const budgets = await budgetService.getBudgets(
        req.userId!,
        month as string | undefined
      );
      res.status(200).json(budgets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
