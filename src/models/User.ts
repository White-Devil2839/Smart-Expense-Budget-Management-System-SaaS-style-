import { Schema, model, Document } from 'mongoose';

export type Role = 'USER' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User = model<IUser>('User', userSchema);
