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

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    await Promise.all([User.deleteMany({}), Category.deleteMany({}), Expense.deleteMany({}), Budget.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({ name: 'Admin User', email: 'admin@sebms.com', password: hashedPassword, role: 'ADMIN' });
    const user1 = await User.create({ name: 'Rahul Sharma', email: 'rahul@sebms.com', password: hashedPassword, role: 'USER' });
    const user2 = await User.create({ name: 'Priya Patel', email: 'priya@sebms.com', password: hashedPassword, role: 'USER' });

    const cats = await Category.insertMany([
      { name: 'Food & Dining', description: 'Restaurants, groceries, meal delivery' },
      { name: 'Transport', description: 'Cab, metro, fuel, flights' },
      { name: 'Entertainment', description: 'Movies, streaming, concerts, games' },
      { name: 'Shopping', description: 'Clothing, electronics, personal care' },
      { name: 'Bills & Utilities', description: 'Electricity, internet, phone, water' },
      { name: 'Health & Fitness', description: 'Gym, medicines, doctor visits' },
    ]);

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Budgets for users
    const budgets = [
      { userId: user1._id, categoryId: cats[0]._id, limitAmount: 8000, spentAmount: 0, month: currentMonth }, // Food
      { userId: user1._id, categoryId: cats[1]._id, limitAmount: 3000, spentAmount: 0, month: currentMonth }, // Transport
      { userId: user1._id, categoryId: cats[2]._id, limitAmount: 2000, spentAmount: 0, month: currentMonth }, // Entertainment
      { userId: user1._id, categoryId: cats[4]._id, limitAmount: 5000, spentAmount: 0, month: currentMonth }, // Bills
      
      { userId: user2._id, categoryId: cats[0]._id, limitAmount: 6000, spentAmount: 0, month: currentMonth }, // Food
      { userId: user2._id, categoryId: cats[3]._id, limitAmount: 4000, spentAmount: 0, month: currentMonth }, // Shopping
      { userId: user2._id, categoryId: cats[5]._id, limitAmount: 2000, spentAmount: 0, month: currentMonth }, // Health
    ];
    await Budget.insertMany(budgets);

    // Realistic expense data pools by category index
    const expenseData = [
      [ { d: 'Starbucks Coffee', a: 350 }, { d: 'Swiggy Biryani', a: 450 }, { d: 'Monthly Groceries BigBasket', a: 2100 }, { d: 'Dinner at Barbeque Nation', a: 1800 }, { d: 'Zomato Pizza', a: 650 } ], // 0: Food
      [ { d: 'Uber Auto to Office', a: 180 }, { d: 'Delhi Metro Recharge', a: 500 }, { d: 'Ola Cab to Airport', a: 850 }, { d: 'Fuel Petrol Pump', a: 1500 } ], // 1: Transport
      [ { d: 'Netflix Subscription', a: 649 }, { d: 'Spotify Premium', a: 119 }, { d: 'PVR Movie Tickets', a: 850 }, { d: 'BookMyShow Concert', a: 2500 } ], // 2: Entertainment
      [ { d: 'Myntra T-Shirts', a: 1200 }, { d: 'Amazon Wireless Mouse', a: 899 }, { d: 'Nike Shoes', a: 4500 }, { d: 'Zara Jacket', a: 3200 } ], // 3: Shopping
      [ { d: 'Electricity Bill', a: 1450 }, { d: 'Jio Fiber Broadband', a: 999 }, { d: 'Airtel Postpaid', a: 499 }, { d: 'Water Bill', a: 300 } ], // 4: Bills
      [ { d: 'Cult.fit Monthly', a: 1500 }, { d: 'Apollo Pharmacy', a: 450 }, { d: '1mg Vitamin Supplements', a: 850 }, { d: 'Doctor Consultation', a: 1000 } ] // 5: Health
    ];

    const expenses: any[] = [];
    const spentMap = new Map<string, number>();

    // Generate 60 realistic expenses spread over the last 30 days
    for (let i = 0; i < 60; i++) {
      const isUser1 = Math.random() > 0.5;
      const u = isUser1 ? user1 : user2;
      
      // Bias categories based on user's budgets to make the data look realistic
      let catIndex = 0;
      if (isUser1) {
        catIndex = [0, 0, 1, 1, 2, 4][Math.floor(Math.random() * 6)]; // Heavy on food/transport/bills
      } else {
        catIndex = [0, 3, 3, 5][Math.floor(Math.random() * 4)]; // Heavy on shopping/health
      }

      const c = cats[catIndex];
      const dataPool = expenseData[catIndex];
      const item = dataPool[Math.floor(Math.random() * dataPool.length)];
      
      // Randomize amount slightly (+- 10%)
      const amt = Math.round(item.a * (0.9 + Math.random() * 0.2));
      
      expenses.push({ 
        userId: u._id, 
        categoryId: c._id, 
        amount: amt, 
        description: item.d, 
        date: daysAgo(Math.floor(Math.random() * 28)) // Spread over last 28 days
      });
      
      const key = `${u._id}-${c._id}`;
      spentMap.set(key, (spentMap.get(key) || 0) + amt);
    }
    await Expense.insertMany(expenses);

    // Update budgets with calculated totals
    for (const [key, spent] of spentMap) {
      const [userId, categoryId] = key.split('-');
      await Budget.findOneAndUpdate({ userId, categoryId, month: currentMonth }, { spentAmount: spent });
    }

    console.log(`🎉 Seeded successfully:`);
    console.log(`   - 3 Users`);
    console.log(`   - ${cats.length} Categories`);
    console.log(`   - ${budgets.length} Budgets`);
    console.log(`   - 60 Realistic Expenses\n`);
    console.log(`   Admin: admin@sebms.com / password123`);
    console.log(`   User1: rahul@sebms.com / password123`);
    console.log(`   User2: priya@sebms.com / password123`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
