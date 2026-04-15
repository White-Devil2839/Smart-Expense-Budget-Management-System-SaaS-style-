import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

const categoryService = new CategoryService();

export class CategoryController {
  async getAllCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Category name is required' });
        return;
      }
      const category = await categoryService.createCategory(name, description);
      res.status(201).json(category);
    } catch (error: any) {
      const status = error.message.includes('already exists') ? 409 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: error.message });
    }
  }
}
