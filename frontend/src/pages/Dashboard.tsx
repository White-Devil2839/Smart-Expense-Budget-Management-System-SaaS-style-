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

  if (loading) return <p className="animate-fade-in text-muted">Loading dashboard data...</p>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Dashboard Overview</h2>
          <p className="text-muted">Financial summary for <strong>{currentMonth}</strong></p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <SummaryCard label="Total Spent" value={`₹${totalSpent.toFixed(2)}`} color="var(--accent-primary)" />
        <SummaryCard label="Total Budget" value={totalBudget > 0 ? `₹${totalBudget.toFixed(2)}` : 'Not set'} color="var(--success)" />
        <SummaryCard
          label="Remaining"
          value={totalBudget > 0 ? `₹${totalRemaining.toFixed(2)}` : '—'}
          color={totalRemaining < 0 ? 'var(--danger)' : 'var(--success)'}
        />
        <SummaryCard label="Expenses Count" value={String(monthlyExpenses.length)} color="#a855f7" />
      </div>

      {/* ── Budget Warnings ── */}
      {exceededBudgets.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '2.5rem' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span>⚠️</span> Budget Exceeded
          </strong>
          <ul style={{ margin: '0 0 0 1.5rem', padding: 0 }}>
            {exceededBudgets.map((b) => (
              <li key={b._id} style={{ marginBottom: '4px' }}>
                {b.categoryId?.name}: spent ₹{b.spentAmount.toFixed(2)} / limit ₹{b.limitAmount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* ── Category Breakdown ── */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Spending by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-muted">No expenses recorded this month.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map(([name, amount]) => (
                    <tr key={name}>
                      <td style={{ fontWeight: 500 }}>{name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        {totalSpent > 0 ? `${((amount / totalSpent) * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Recent Expenses ── */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Expenses</h3>
          {monthlyExpenses.length === 0 ? (
            <p className="text-muted">No expenses recorded this month.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {monthlyExpenses.slice(0, 5).map((e) => (
                <li key={e.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{e.categoryName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{e.date}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{e.amount.toFixed(2)}</span>
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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.8rem', fontWeight: 700, color }}>
        {value}
      </span>
    </div>
  );
}
