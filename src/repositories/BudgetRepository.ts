import { Budget, IBudget } from '../models/Budget';

export class BudgetRepository {
  async findByUserCategoryMonth(
    userId: string,
    categoryId: string,
    month: string
  ): Promise<IBudget | null> {
    return Budget.findOne({ userId, categoryId, month }).populate('categoryId', 'name');
  }

  async findByUserAndMonth(userId: string, month: string): Promise<IBudget[]> {
    return Budget.find({ userId, month }).populate('categoryId', 'name');
  }

  async findByUserId(userId: string): Promise<IBudget[]> {
    return Budget.find({ userId }).populate('categoryId', 'name');
  }

  async create(data: Partial<IBudget>): Promise<IBudget> {
    const budget = await Budget.create(data);
    return budget.populate('categoryId', 'name');
  }

  async updateSpent(id: string, spentAmount: number): Promise<IBudget | null> {
    return Budget.findByIdAndUpdate(id, { spentAmount }, { new: true });
  }

  async findById(id: string): Promise<IBudget | null> {
    return Budget.findById(id).populate('categoryId', 'name');
  }

  async updateLimit(id: string, limitAmount: number): Promise<IBudget | null> {
    return Budget.findByIdAndUpdate(id, { limitAmount }, { new: true }).populate('categoryId', 'name');
  }
}
