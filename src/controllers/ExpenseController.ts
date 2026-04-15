import { Response } from 'express';
import { ExpenseService } from '../services/ExpenseService';
import { AuthRequest } from '../types/AuthRequest';

const expenseService = new ExpenseService();

export class ExpenseController {
  async createExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { amount, categoryId, date, description } = req.body;
      if (!amount || !categoryId || !date) {
        res.status(400).json({ error: 'amount, categoryId and date are required' });
        return;
      }
      const result = await expenseService.createExpense(req.userId!, {
        amount,
        categoryId,
        date,
        description,
      });
      res.status(201).json(result);
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async getExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const expenses = await expenseService.getExpenses(req.userId!);
      res.status(200).json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await expenseService.updateExpense(req.userId!, id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Forbidden')
        ? 403
        : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await expenseService.deleteExpense(req.userId!, id);
      res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Forbidden')
        ? 403
        : 500;
      res.status(status).json({ error: error.message });
    }
  }
}
