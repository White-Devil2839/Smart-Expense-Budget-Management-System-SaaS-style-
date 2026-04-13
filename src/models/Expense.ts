import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  description?: string;
  date: Date;
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
