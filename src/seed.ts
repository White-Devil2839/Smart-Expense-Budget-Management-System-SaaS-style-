/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Category } from './models/Category';
import { Expense } from './models/Expense';
import { Budget } from './models/Budget';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sebms_db';

// ── Helper: date N days ago ──
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── Clear existing data ──
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Expense.deleteMany({}),
      Budget.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Users ──
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Divyansh Choudhary',
      email: 'admin@sebms.com',
      password: hashedPassword,
      role: 'ADMIN',
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@sebms.com',
      password: hashedPassword,
      role: 'USER',
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@sebms.com',
      password: hashedPassword,
      role: 'USER',
    });

    console.log('👤 Users created');

    // ── Create Categories ──
    const food = await Category.create({ name: 'Food & Dining', description: 'Restaurants, groceries, meal delivery' });
    const transport = await Category.create({ name: 'Transport', description: 'Cab, metro, fuel, parking' });
    const entertainment = await Category.create({ name: 'Entertainment', description: 'Movies, streaming, concerts, games' });
    const shopping = await Category.create({ name: 'Shopping', description: 'Clothing, electronics, personal care' });
    const bills = await Category.create({ name: 'Bills & Utilities', description: 'Electricity, internet, phone, water' });
    const health = await Category.create({ name: 'Health', description: 'Gym, medicines, doctor visits' });
    const education = await Category.create({ name: 'Education', description: 'Books, courses, stationery' });

    console.log('📂 7 Categories created');

    // ── Current month ──
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // ── Budgets for Rahul ──
    await Budget.create({ userId: user1._id, categoryId: food._id, limitAmount: 8000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user1._id, categoryId: transport._id, limitAmount: 3000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user1._id, categoryId: entertainment._id, limitAmount: 2000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user1._id, categoryId: bills._id, limitAmount: 5000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user1._id, categoryId: health._id, limitAmount: 1500, spentAmount: 0, month: currentMonth } as any);

    // ── Budgets for Priya ──
    await Budget.create({ userId: user2._id, categoryId: food._id, limitAmount: 6000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user2._id, categoryId: shopping._id, limitAmount: 4000, spentAmount: 0, month: currentMonth } as any);
    await Budget.create({ userId: user2._id, categoryId: education._id, limitAmount: 3000, spentAmount: 0, month: currentMonth } as any);

    console.log(`📊 8 Budgets set for ${currentMonth}`);

    // ── Expenses for Rahul ──
    const rahulExpenses = [
      { userId: user1._id, categoryId: food._id, amount: 350, description: 'Coffee & sandwich at Blue Tokai', date: daysAgo(0) },
      { userId: user1._id, categoryId: food._id, amount: 1450, description: 'Weekly groceries from BigBasket', date: daysAgo(2) },
      { userId: user1._id, categoryId: food._id, amount: 680, description: 'Dinner at Pizza Hut', date: daysAgo(4) },
      { userId: user1._id, categoryId: food._id, amount: 520, description: 'Swiggy order - biryani', date: daysAgo(6) },
      { userId: user1._id, categoryId: food._id, amount: 290, description: 'Chai and snacks', date: daysAgo(8) },
      { userId: user1._id, categoryId: food._id, amount: 1800, description: 'Birthday dinner treat', date: daysAgo(10) },
      { userId: user1._id, categoryId: food._id, amount: 3200, description: 'Monthly grocery stock', date: daysAgo(12) },
      { userId: user1._id, categoryId: transport._id, amount: 1200, description: 'Uber to airport', date: daysAgo(1) },
      { userId: user1._id, categoryId: transport._id, amount: 500, description: 'Delhi Metro card recharge', date: daysAgo(3) },
      { userId: user1._id, categoryId: transport._id, amount: 850, description: 'Ola auto rides this week', date: daysAgo(7) },
      { userId: user1._id, categoryId: entertainment._id, amount: 600, description: 'Movie tickets - Oppenheimer', date: daysAgo(2) },
      { userId: user1._id, categoryId: entertainment._id, amount: 199, description: 'Spotify Premium monthly', date: daysAgo(5) },
      { userId: user1._id, categoryId: entertainment._id, amount: 1500, description: 'Coldplay concert tickets', date: daysAgo(9) },
      { userId: user1._id, categoryId: bills._id, amount: 2200, description: 'Electricity bill - April', date: daysAgo(3) },
      { userId: user1._id, categoryId: bills._id, amount: 999, description: 'Jio Fiber internet', date: daysAgo(1) },
      { userId: user1._id, categoryId: bills._id, amount: 599, description: 'Airtel postpaid', date: daysAgo(5) },
      { userId: user1._id, categoryId: health._id, amount: 1500, description: 'Gym membership - monthly', date: daysAgo(1) },
      { userId: user1._id, categoryId: health._id, amount: 450, description: 'Medicines from Apollo', date: daysAgo(6) },
    ];

    // ── Expenses for Priya ──
    const priyaExpenses = [
      { userId: user2._id, categoryId: food._id, amount: 400, description: 'Starbucks coffee', date: daysAgo(0) },
      { userId: user2._id, categoryId: food._id, amount: 1800, description: 'Grocery from D-Mart', date: daysAgo(3) },
      { userId: user2._id, categoryId: food._id, amount: 750, description: 'Dinner at Barbeque Nation', date: daysAgo(5) },
      { userId: user2._id, categoryId: food._id, amount: 320, description: 'Zomato lunch order', date: daysAgo(7) },
      { userId: user2._id, categoryId: shopping._id, amount: 2999, description: 'Kurta set from Myntra', date: daysAgo(2) },
      { userId: user2._id, categoryId: shopping._id, amount: 1499, description: 'Wireless earbuds', date: daysAgo(6) },
      { userId: user2._id, categoryId: education._id, amount: 1999, description: 'Udemy course - React', date: daysAgo(1) },
      { userId: user2._id, categoryId: education._id, amount: 650, description: 'Notebook and pens', date: daysAgo(4) },
    ];

    const allExpenses = [...rahulExpenses, ...priyaExpenses];
    for (const exp of allExpenses) {
      await Expense.create(exp as any);
    }

    console.log(`💰 ${allExpenses.length} expenses created`);

    // ── Update budget spent amounts ──
    const spentByUser = new Map<string, number>();

    for (const exp of allExpenses) {
      const key = `${exp.userId}-${exp.categoryId}`;
      spentByUser.set(key, (spentByUser.get(key) || 0) + exp.amount);
    }

    for (const [key, spent] of spentByUser) {
      const [userId, categoryId] = key.split('-');
      await Budget.findOneAndUpdate(
        { userId, categoryId, month: currentMonth },
        { spentAmount: spent }
      );
    }

    console.log('📈 Budget spent amounts synced');

    // ── Print Summary ──
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║           🎉 SEED COMPLETE                      ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║                                                  ║');
    console.log(`║  Users:       3 (1 Admin, 2 Users)               ║`);
    console.log(`║  Categories:  7                                  ║`);
    console.log(`║  Budgets:     8 (for ${currentMonth})               ║`);
    console.log(`║  Expenses:    ${allExpenses.length}                                 ║`);
    console.log('║                                                  ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║  Login Credentials:                              ║');
    console.log('║                                                  ║');
    console.log('║  👑 Admin:  admin@sebms.com  / password123       ║');
    console.log('║  👤 User:   rahul@sebms.com  / password123       ║');
    console.log('║  👤 User:   priya@sebms.com  / password123       ║');
    console.log('║                                                  ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
