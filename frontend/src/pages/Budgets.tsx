import { useState, useEffect, FormEvent } from 'react';
import { api } from '../services/api';

interface Budget {
  _id: string;
  limitAmount: number;
  spentAmount: number;
  month: string;
  categoryId: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterMonth, setFilterMonth] = useState(month);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [filterMonth]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets', { params: { month: filterMonth } });
      setBudgets(res.data);
    } catch {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      // not critical
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await api.post('/budgets', {
        categoryId,
        limitAmount: parseFloat(limitAmount),
        month,
      });
      setSuccessMsg('Budget set successfully!');
      setCategoryId('');
      setLimitAmount('');
      setFilterMonth(month); // refresh list for that month
      fetchBudgets();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data: { error: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to set budget');
      } else {
        setError('Failed to set budget');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatus = (budget: Budget) => {
    const remaining = budget.limitAmount - budget.spentAmount;
    const pct = (budget.spentAmount / budget.limitAmount) * 100;

    if (pct >= 100) return { label: 'EXCEEDED', color: '#dc2626', bg: '#fef2f2' };
    if (pct >= 80) return { label: 'WARNING', color: '#d97706', bg: '#fffbeb' };
    return { label: `₹${remaining.toFixed(2)} left`, color: '#16a34a', bg: '#f0fdf4' };
  };

  return (
    <div>
      <h2>Budgets</h2>

      {/* ── Messages ── */}
      {error && (
        <div style={{ color: '#fff', background: '#d32f2f', padding: '0.5rem 1rem', borderRadius: 4, marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ color: '#fff', background: '#388e3c', padding: '0.5rem 1rem', borderRadius: 4, marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      {/* ── Set Budget Form ── */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Set Budget</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ padding: '0.4rem', minWidth: 140 }}
            >
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Limit (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
              style={{ padding: '0.4rem', width: 120 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              style={{ padding: '0.4rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '0.4rem 1.25rem', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            {submitting ? 'Setting...' : 'Set Budget'}
          </button>
        </form>
      </div>

      {/* ── Filter by month ── */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem' }}>Filter month:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ padding: '0.3rem' }}
        />
      </div>

      {/* ── Budget List ── */}
      {loading ? (
        <p>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p style={{ color: '#64748b' }}>No budgets set for {filterMonth}.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Limit</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Spent</th>
              <th style={{ padding: '0.5rem' }}>Progress</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => {
              const status = getStatus(b);
              const pct = Math.min((b.spentAmount / b.limitAmount) * 100, 100);

              return (
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem' }}>{b.categoryId?.name || '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{b.limitAmount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{b.spentAmount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', width: 160 }}>
                    <div style={{ background: '#e2e8f0', borderRadius: 4, height: 12, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: status.color,
                          borderRadius: 4,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 12,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: status.color,
                      background: status.bg,
                    }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
