import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { BudgetService } from './BudgetService';
import { ExpenseDTO, ExpenseResponseDTO } from '../types/dto';
import { IExpense } from '../models/Expense';

const expenseRepository = new ExpenseRepository();
const categoryRepository = new CategoryRepository();
const budgetService = new BudgetService();

const toResponseDTO = (expense: IExpense, budgetWarning?: string): ExpenseResponseDTO => {
  const category = expense.categoryId as any; // populated
  return {
    id: String(expense._id),
    amount: expense.amount,
    categoryName: category?.name ?? '',
    date: expense.date.toISOString().split('T')[0],
    description: expense.description,
    budgetWarning,
  };
};

export class ExpenseService {
  async createExpense(
    userId: string,
    data: ExpenseDTO
  ): Promise<ExpenseResponseDTO> {
    // 1. Validate category exists
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // 2. Check budget status (advisory — does NOT block)
    const month = data.date.slice(0, 7); // "YYYY-MM"
    const budget = await budgetService.checkBudget(userId, data.categoryId, month);

    let budgetWarning: string | undefined;
    if (budget) {
      const projectedSpent = budget.spentAmount + data.amount;
      if (projectedSpent > budget.limitAmount) {
        budgetWarning =
          `Warning: This expense will exceed your budget for ${category.name} ` +
          `(limit: ${budget.limitAmount}, spent after: ${projectedSpent.toFixed(2)})`;
      }
    }

    // 3. Persist expense
    const expense = await expenseRepository.create({
      userId: userId as any,
      categoryId: data.categoryId as any,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
    });

    // 4. Update budget spent amount (advisory — runs regardless of warning)
    await budgetService.updateSpentAmount(userId, data.categoryId, month, data.amount);

    return toResponseDTO(expense, budgetWarning);
  }

  async getExpenses(userId: string): Promise<ExpenseResponseDTO[]> {
    const expenses = await expenseRepository.findByUserId(userId);
    return expenses.map((e) => toResponseDTO(e));
  }

  async updateExpense(
    userId: string,
    expenseId: string,
    data: Partial<ExpenseDTO>
  ): Promise<ExpenseResponseDTO> {
    const existing = await expenseRepository.findById(expenseId);
    if (!existing) {
      throw new Error('Expense not found');
    }

    // Ownership check
    if (String(existing.userId) !== userId) {
      throw new Error('Forbidden: You do not own this expense');
    }

    const updated = await expenseRepository.update(expenseId, {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
    });

    return toResponseDTO(updated!);
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    const existing = await expenseRepository.findById(expenseId);
    if (!existing) {
      throw new Error('Expense not found');
    }

    // Ownership check
    if (String(existing.userId) !== userId) {
      throw new Error('Forbidden: You do not own this expense');
    }

    await expenseRepository.deleteById(expenseId);
  }
}
