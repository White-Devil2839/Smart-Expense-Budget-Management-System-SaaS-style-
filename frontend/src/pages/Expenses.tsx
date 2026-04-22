import { useState, useEffect, FormEvent } from 'react';
import { api } from '../services/api';

interface Expense {
  id: string;
  amount: number;
  categoryName: string;
  categoryId: string;
  date: string;
  description?: string;
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

  // Add form state
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

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
    } catch { /* not critical */ }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setSubmitting(true);
    try {
      const res = await api.post('/expenses', {
        amount: parseFloat(amount),
        categoryId,
        date,
        description: description || undefined,
      });
      if (res.data.budgetWarning) {
        setSuccessMsg(`Expense added! ⚠️ ${res.data.budgetWarning}`);
      } else {
        setSuccessMsg('Expense added successfully!');
      }
      setAmount(''); setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      fetchExpenses();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditAmount(String(exp.amount));
    setEditCategoryId(exp.categoryId);
    setEditDate(exp.date);
    setEditDescription(exp.description || '');
  };

  const cancelEdit = () => setEditingId(null);

  const handleEdit = async (e: FormEvent, id: string) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setEditSubmitting(true);
    try {
      await api.put(`/expenses/${id}`, {
        amount: parseFloat(editAmount),
        categoryId: editCategoryId,
        date: editDate,
        description: editDescription || undefined,
      });
      setSuccessMsg('Expense updated!');
      setEditingId(null);
      fetchExpenses();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to update expense');
    } finally {
      setEditSubmitting(false);
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

  // ── CSV Export ──
  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Category', 'Description', 'Amount (₹)'];
    const rows = expenses.map((e) => [
      e.date,
      e.categoryName,
      e.description || '',
      e.amount.toFixed(2),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Expense Tracker</h2>
          <p className="text-muted">Log your daily expenses and stay on budget</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={expenses.length === 0}
          className="btn btn-outline"
          style={{ fontSize: '0.9rem' }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ── Add Expense Form ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Add New Expense</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 120px' }}>
            <label className="form-label">Amount (₹)</label>
            <input type="number" step="0.01" min="0.01" className="form-input"
              value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="e.g. 500" />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select Category...</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div style={{ flex: '2 1 200px' }}>
            <label className="form-label">Description (Optional)</label>
            <input type="text" className="form-input" value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ height: '42px', padding: '0 2rem' }}>
            {submitting ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>

      {/* ── Expense List ── */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>All Transactions ({expenses.length})</h3>
        {loading ? (
          <p className="text-muted">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-muted">No expenses yet. Add one above!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  editingId === expense.id ? (
                    // ── Inline Edit Row ──
                    <tr key={expense.id} style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                      <td>
                        <input type="date" className="form-input" value={editDate}
                          onChange={(e) => setEditDate(e.target.value)} required style={{ padding: '0.3rem' }} />
                      </td>
                      <td>
                        <select className="form-input" value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)} required style={{ padding: '0.3rem' }}>
                          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <input type="text" className="form-input" value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)} placeholder="Description"
                          style={{ padding: '0.3rem' }} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <input type="number" step="0.01" min="0.01" className="form-input" value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)} required
                          style={{ padding: '0.3rem', width: '100px' }} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <form onSubmit={(e) => handleEdit(e, expense.id)} style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button type="submit" disabled={editSubmitting} className="btn btn-primary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            {editSubmitting ? '...' : 'Save'}
                          </button>
                          <button type="button" onClick={cancelEdit} className="btn btn-outline"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            Cancel
                          </button>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    // ── Normal Row ──
                    <tr key={expense.id}>
                      <td>{expense.date}</td>
                      <td style={{ fontWeight: 500 }}>{expense.categoryName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{expense.description || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{expense.amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => startEdit(expense)} className="btn btn-outline"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="btn-link-danger">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
