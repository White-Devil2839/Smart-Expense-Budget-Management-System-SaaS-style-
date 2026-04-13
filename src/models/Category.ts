import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Category = model<ICategory>('Category', categorySchema);
