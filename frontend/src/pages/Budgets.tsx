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

  // Add form state
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

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
    } catch { /* not critical */ }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setSubmitting(true);
    try {
      await api.post('/budgets', { categoryId, limitAmount: parseFloat(limitAmount), month });
      setSuccessMsg('Budget set successfully!');
      setCategoryId(''); setLimitAmount('');
      setFilterMonth(month);
      fetchBudgets();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to set budget');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (b: Budget) => {
    setEditingId(b._id);
    setEditLimit(String(b.limitAmount));
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditSubmit = async (e: FormEvent, id: string) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setEditSubmitting(true);
    try {
      await api.put(`/budgets/${id}`, { limitAmount: parseFloat(editLimit) });
      setSuccessMsg('Budget limit updated!');
      setEditingId(null);
      fetchBudgets();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to update budget');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── CSV Export ──
  const exportCSV = () => {
    if (budgets.length === 0) return;
    const headers = ['Month', 'Category', 'Limit (₹)', 'Spent (₹)', 'Remaining (₹)', 'Status'];
    const rows = budgets.map((b) => {
      const remaining = b.limitAmount - b.spentAmount;
      const pct = (b.spentAmount / b.limitAmount) * 100;
      const status = pct >= 100 ? 'EXCEEDED' : pct >= 80 ? 'WARNING' : 'OK';
      return [b.month, b.categoryId?.name, b.limitAmount.toFixed(2), b.spentAmount.toFixed(2), remaining.toFixed(2), status];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatus = (budget: Budget) => {
    const remaining = budget.limitAmount - budget.spentAmount;
    const pct = (budget.spentAmount / budget.limitAmount) * 100;
    if (pct >= 100) return { label: 'EXCEEDED', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)' };
    if (pct >= 80) return { label: 'WARNING', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: `₹${remaining.toFixed(2)} left`, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Budget Limits</h2>
          <p className="text-muted">Set monthly category limits to prevent overspending</p>
        </div>
        <button onClick={exportCSV} disabled={budgets.length === 0} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
          ⬇ Export CSV
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ── Add Budget Form ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Set New Budget</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select Category...</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="form-label">Limit (₹)</label>
            <input type="number" step="0.01" min="0.01" className="form-input" value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)} required placeholder="e.g. 5000" />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="form-label">Month</label>
            <input type="month" className="form-input" value={month} onChange={(e) => setMonth(e.target.value)} required />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ height: '42px', padding: '0 2rem' }}>
            {submitting ? 'Saving...' : 'Save Limit'}
          </button>
        </form>
      </div>

      {/* ── Budget List ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Budget Usage</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Month:</label>
            <input type="month" className="form-input" style={{ padding: '0.3rem 0.5rem', width: 'auto' }}
              value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="text-muted">No budgets set for {filterMonth}.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Limit</th>
                  <th style={{ textAlign: 'right' }}>Spent</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const status = getStatus(b);
                  const pct = Math.min((b.spentAmount / b.limitAmount) * 100, 100);

                  return (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>{b.categoryId?.name || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {editingId === b._id ? (
                          <form onSubmit={(e) => handleEditSubmit(e, b._id)} style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                            <input
                              type="number" step="0.01" min="0.01" className="form-input"
                              value={editLimit} onChange={(e) => setEditLimit(e.target.value)}
                              required style={{ padding: '0.3rem', width: '100px' }}
                              autoFocus
                            />
                            <button type="submit" disabled={editSubmitting} className="btn btn-primary"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                              {editSubmitting ? '...' : 'Save'}
                            </button>
                            <button type="button" onClick={cancelEdit} className="btn btn-outline"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                              ✕
                            </button>
                          </form>
                        ) : (
                          `₹${b.limitAmount.toFixed(2)}`
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{b.spentAmount.toFixed(2)}</td>
                      <td style={{ minWidth: '160px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: status.color, transition: 'width 0.5s ease-out' }} />
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px',
                          fontSize: '0.75rem', fontWeight: 700, color: status.color, background: status.bg, letterSpacing: '0.5px' }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {editingId !== b._id && (
                          <button onClick={() => startEdit(b)} className="btn btn-outline"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                            Edit Limit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
