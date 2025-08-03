// src/pages/CategoriesPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const bg =
    type === 'error'
      ? 'bg-rose-600'
      : type === 'warning'
      ? 'bg-yellow-600'
      : 'bg-emerald-600';
  return (
    <div className={`fixed top-4 right-4 z-50 text-white px-4 py-2 rounded shadow ${bg}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button className="opacity-80 hover:opacity-100" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span>Loading...</span>
    </div>
  );
}

export default function CategoriesPage() {
  const { token } = useAuth();
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
  };

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', is_active: true });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories/', {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Failed to load categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', is_active: true });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      title: cat.title || '',
      description: cat.description || '',
      is_active: cat.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await fetch('http://127.0.0.1:8000/api/categories/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || 'Failed to update category');
        showToast('Category updated');
      } else {
        const res = await fetch('http://127.0.0.1:8000/api/categories/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || 'Failed to create category');
        showToast('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.title}"?`)) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ id: cat.id }),
      });
      if (res.status !== 204) {
        const data = await res.json();
        throw new Error(data?.detail || 'Failed to delete category');
      }
      showToast('Category deleted');
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="p-4">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add new category
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <div className="text-slate-500">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{cat.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {cat.description || 'No description'}
              </p>
              <div className="mt-3 text-sm text-slate-500">
                Courses under this category:{' '}
                {/* <strong>{typeof cat.courses_count === 'number' ? cat.courses_count : 'N/A'}</strong> */}
				<strong>{cat.courses_count}</strong>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editing ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <label htmlFor="is_active" className="text-sm">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}