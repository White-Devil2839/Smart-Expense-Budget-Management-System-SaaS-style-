import { CategoryRepository } from '../repositories/CategoryRepository';
import { ICategory } from '../models/Category';

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async createCategory(name: string, description?: string): Promise<ICategory> {
    const existing = await categoryRepository.findByName(name);
    if (existing) {
      throw new Error(`Category "${name}" already exists`);
    }
    return categoryRepository.create({ name, description });
  }

  async getAllCategories(): Promise<ICategory[]> {
    return categoryRepository.findAll();
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    await categoryRepository.deleteById(id);
  }
}
