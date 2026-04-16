import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Routes
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import budgetRoutes from './routes/budgetRoutes';
import categoryRoutes from './routes/categoryRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health Check ────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'SEBMS API is running' });
});

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);

// ── 404 Handler ─────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
