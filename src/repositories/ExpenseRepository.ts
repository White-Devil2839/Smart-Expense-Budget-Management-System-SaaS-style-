import { Expense, IExpense } from '../models/Expense';

export class ExpenseRepository {
  async findByUserId(userId: string): Promise<IExpense[]> {
    return Expense.find({ userId }).populate('categoryId', 'name').sort({ date: -1 });
  }

  async findById(id: string): Promise<IExpense | null> {
    return Expense.findById(id).populate('categoryId', 'name');
  }

  async create(data: Partial<IExpense>): Promise<IExpense> {
    const expense = await Expense.create(data);
    return expense.populate('categoryId', 'name');
  }

  async update(id: string, data: Partial<IExpense>): Promise<IExpense | null> {
    return Expense.findByIdAndUpdate(id, data, { new: true }).populate('categoryId', 'name');
  }

  async deleteById(id: string): Promise<void> {
    await Expense.findByIdAndDelete(id);
  }
}
