import { useState, useEffect, FormEvent } from 'react';
import { api } from '../services/api';

interface Expense {
  id: string;
  amount: number;
  categoryName: string;
  date: string;
  description?: string;
  budgetWarning?: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch expenses and categories on mount
  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      // Categories may not exist yet — not critical
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await api.post('/expenses', {
        amount: parseFloat(amount),
        categoryId,
        date,
        description: description || undefined,
      });

      // Show budget warning if returned
      if (res.data.budgetWarning) {
        setSuccessMsg(`Expense added! ⚠️ ${res.data.budgetWarning}`);
      } else {
        setSuccessMsg('Expense added successfully!');
      }

      // Reset form
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');

      // Refresh list
      fetchExpenses();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data: { error: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to add expense');
      } else {
        setError('Failed to add expense');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setSuccessMsg('Expense deleted');
    } catch {
      setError('Failed to delete expense');
    }
  };

  return (
    <div>
      <h2>Expenses</h2>

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

      {/* ── Add Expense Form ── */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Add Expense</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ padding: '0.4rem', width: 100 }}
            />
          </div>

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
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ padding: '0.4rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 2 }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              style={{ padding: '0.4rem', width: 160 }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '0.4rem 1.25rem', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* ── Expense List ── */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p style={{ color: '#64748b' }}>No expenses yet. Add one above!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Date</th>
              <th style={{ padding: '0.5rem' }}>Category</th>
              <th style={{ padding: '0.5rem' }}>Description</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem' }}>{expense.date}</td>
                <td style={{ padding: '0.5rem' }}>{expense.categoryName}</td>
                <td style={{ padding: '0.5rem', color: '#64748b' }}>{expense.description || '—'}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                  ₹{expense.amount.toFixed(2)}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
