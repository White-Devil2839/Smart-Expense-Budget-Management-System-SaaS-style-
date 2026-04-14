import { Request } from 'express';

// Extends Express Request to carry authenticated user info
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}
