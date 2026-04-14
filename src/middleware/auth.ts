import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/AuthRequest';

/**
 * Middleware: Extracts and validates JWT from Authorization header.
 * Attaches userId and userRole to the request object.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware factory: Restricts access to specified roles.
 * Must be used AFTER authMiddleware.
 */
export const roleGuard = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
      return;
    }
    next();
  };
};
