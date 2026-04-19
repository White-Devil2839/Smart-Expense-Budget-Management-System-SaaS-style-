import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Expense {
  id: string;
  amount: number;
  categoryName: string;
  date: string;
}

interface Budget {
  _id: string;
  limitAmount: number;
  spentAmount: number;
  month: string;
  categoryId: { _id: string; name: string };
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/budgets', { params: { month: currentMonth } }),
        ]);
        setExpenses(expRes.data);
        setBudgets(budRes.data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Computed values ──
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  monthlyExpenses.forEach((e) => {
    categoryMap.set(e.categoryName, (categoryMap.get(e.categoryName) || 0) + e.amount);
  });
  const categoryBreakdown = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1]); // highest spend first

  // Exceeded budgets
  const exceededBudgets = budgets.filter((b) => b.spentAmount > b.limitAmount);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Summary for <strong>{currentMonth}</strong>
      </p>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <SummaryCard label="Total Spent" value={`₹${totalSpent.toFixed(2)}`} color="#2563eb" />
        <SummaryCard label="Total Budget" value={totalBudget > 0 ? `₹${totalBudget.toFixed(2)}` : 'Not set'} color="#16a34a" />
        <SummaryCard
          label="Remaining"
          value={totalBudget > 0 ? `₹${totalRemaining.toFixed(2)}` : '—'}
          color={totalRemaining < 0 ? '#dc2626' : '#16a34a'}
        />
        <SummaryCard label="Expenses Count" value={String(monthlyExpenses.length)} color="#7c3aed" />
      </div>

      {/* ── Budget Warnings ── */}
      {exceededBudgets.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <strong style={{ color: '#dc2626' }}>⚠️ Budget Exceeded</strong>
          <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
            {exceededBudgets.map((b) => (
              <li key={b._id} style={{ color: '#dc2626', marginBottom: 4 }}>
                {b.categoryId?.name}: spent ₹{b.spentAmount.toFixed(2)} / limit ₹{b.limitAmount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Category Breakdown ── */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3>Spending by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p style={{ color: '#64748b' }}>No expenses this month.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Category</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map(([name, amount]) => (
                  <tr key={name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem' }}>{name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                      ₹{amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#64748b' }}>
                      {totalSpent > 0 ? `${((amount / totalSpent) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Recent Expenses ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3>Recent Expenses</h3>
          {monthlyExpenses.length === 0 ? (
            <p style={{ color: '#64748b' }}>No expenses this month.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {monthlyExpenses.slice(0, 5).map((e) => (
                <li key={e.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  <span>
                    <strong>{e.categoryName}</strong>
                    <span style={{ color: '#94a3b8', marginLeft: '0.5rem', fontSize: '0.85rem' }}>{e.date}</span>
                  </span>
                  <span style={{ fontWeight: 'bold' }}>₹{e.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helper component ──
function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: '1 1 140px',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '1rem',
      minWidth: 140,
    }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
