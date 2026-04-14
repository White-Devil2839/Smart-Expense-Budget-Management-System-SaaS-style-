import { Category, ICategory } from '../models/Category';

export class CategoryRepository {
  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name });
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  }

  async findAll(): Promise<ICategory[]> {
    return Category.find();
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    return Category.create(data);
  }

  async deleteById(id: string): Promise<void> {
    await Category.findByIdAndDelete(id);
  }
}
