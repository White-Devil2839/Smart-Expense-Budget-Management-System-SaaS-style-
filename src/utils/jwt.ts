import jwt, { SignOptions } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (userId: string, role: string): string => {
  const options: SignOptions = { expiresIn: EXPIRES_IN as any };
  return jwt.sign({ userId, role }, SECRET, options);
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
};
