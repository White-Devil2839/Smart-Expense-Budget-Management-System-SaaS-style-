import { useState, useEffect, FormEvent } from 'react';
import { api } from '../services/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await api.post('/categories', { name, description: description || undefined });
      setSuccessMsg(`Category "${name}" created!`);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data: { error: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to create category');
      } else {
        setError('Failed to create category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setSuccessMsg(`Category "${catName}" deleted`);
    } catch {
      setError('Failed to delete category');
    }
  };

  return (
    <div>
      <h2>Manage Categories</h2>
      <p className="text-muted">Admin only — create and manage global spending categories.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ── Add Category Form ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Add Category</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Food"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="form-input"
              style={{ width: 200 }}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {/* ── Category List ── */}
      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted">No categories yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                <td className="text-muted">{c.description || '—'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="btn-link-danger"
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
