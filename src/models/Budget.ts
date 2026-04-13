import { Schema, model, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  limitAmount: number;
  spentAmount: number;
  month: string; // format: "YYYY-MM"
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  getRemainingAmount(): number;
  isExceeded(): boolean;
}

const budgetSchema = new Schema<IBudget>(
  {
    limitAmount: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Limit must be greater than 0'],
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    month: {
      type: String,
      required: [true, 'Month is required (YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
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

// ── Compound unique index: one budget per user per category per month ──
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

// ── Business methods ──
budgetSchema.methods.getRemainingAmount = function (): number {
  return this.limitAmount - this.spentAmount;
};

budgetSchema.methods.isExceeded = function (): boolean {
  return this.spentAmount > this.limitAmount;
};

export const Budget = model<IBudget>('Budget', budgetSchema);
