import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
};
