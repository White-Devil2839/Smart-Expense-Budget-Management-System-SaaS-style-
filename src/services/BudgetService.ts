import { BudgetRepository } from '../repositories/BudgetRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { BudgetDTO } from '../types/dto';
import { IBudget } from '../models/Budget';

const budgetRepository = new BudgetRepository();
const categoryRepository = new CategoryRepository();

export class BudgetService {
  async createBudget(userId: string, data: BudgetDTO): Promise<IBudget> {
    // Validate category exists
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Enforce unique constraint (user + category + month)
    const existing = await budgetRepository.findByUserCategoryMonth(
      userId,
      data.categoryId,
      data.month
    );
    if (existing) {
      throw new Error(`Budget for this category in ${data.month} already exists`);
    }

    return budgetRepository.create({
      userId: userId as any,
      categoryId: data.categoryId as any,
      limitAmount: data.limitAmount,
      spentAmount: 0,
      month: data.month,
    });
  }

  async getBudgets(userId: string, month?: string): Promise<IBudget[]> {
    if (month) {
      return budgetRepository.findByUserAndMonth(userId, month);
    }
    return budgetRepository.findByUserId(userId);
  }

  /**
   * Returns the budget if it exists, or null if none set.
   * Caller decides what to do with the result.
   */
  async checkBudget(
    userId: string,
    categoryId: string,
    month: string
  ): Promise<IBudget | null> {
    return budgetRepository.findByUserCategoryMonth(userId, categoryId, month);
  }

  /**
   * Increments spent amount after an expense is created.
   * Advisory only — called even if budget is exceeded.
   */
  async updateSpentAmount(
    userId: string,
    categoryId: string,
    month: string,
    amount: number
  ): Promise<void> {
    const budget = await budgetRepository.findByUserCategoryMonth(userId, categoryId, month);
    if (budget) {
      const newSpent = budget.spentAmount + amount;
      await budgetRepository.updateSpent(String(budget._id), newSpent);
    }
    // If no budget set, silently skip (user may not have a budget for this category)
  }

  async updateBudgetLimit(
    userId: string,
    budgetId: string,
    limitAmount: number
  ): Promise<IBudget> {
    const budget = await budgetRepository.findById(budgetId);
    if (!budget) throw new Error('Budget not found');
    if (String(budget.userId) !== userId) throw new Error('Forbidden');
    if (limitAmount <= 0) throw new Error('Limit must be greater than 0');
    const updated = await budgetRepository.updateLimit(budgetId, limitAmount);
    if (!updated) throw new Error('Budget not found');
    return updated;
  }
}
