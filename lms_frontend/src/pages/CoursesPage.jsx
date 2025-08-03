// src/pages/CoursesPage.jsx
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

export default function CoursesPage() {
  const { token } = useAuth();
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
  };

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    instructor_id: '',
    price: 0,
    duration: 0,
    is_active: true,
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/courses/', {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Failed to load courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories/', {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Failed to load categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("instructors state updated:", instructors);
  }, [instructors]);

  const fetchInstructors = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/instructors/', {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Failed to load instructors');
      setInstructors(Array.isArray(data) ? data : []);
	  console.log("fetchInstructors data = ");
	  console.log(data);	  
	  console.log("instructors = ");
	  console.log(instructors);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCourses();
    fetchCategories();
    fetchInstructors();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category_id: '',
      instructor_id: '',
      price: 0,
      duration: 0,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      title: course.title || '',
      description: course.description || '',
      category_id: course.category_id || '',
      instructor_id: course.instructor_id || '',
      price: course.price ?? 0,
      duration: course.duration ?? 0,
      is_active: course.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await fetch(`http://127.0.0.1:8000/api/courses/${editing.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || 'Failed to update course');
        showToast('Course updated');
      } else {
        const res = await fetch('http://127.0.0.1:8000/api/courses/', { // -----------------------------------
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || 'Failed to create course');
        showToast('Course created');
      }
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete course "${course.title}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/courses/${course.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      });
      if (res.status !== 204) {
        const data = await res.json();
        throw new Error(data?.detail || 'Failed to delete course');
      }
      showToast('Course deleted');
      fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.title || 'Unknown';

  const getInstructorName = (id) =>
    instructors.find((i) => i.id === id)?.username || 'Unknown';

  return (
    <div className="p-4">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add new course
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <div className="text-slate-500">No courses found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{course.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    course.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {course.description || 'No description'}
              </p>
              <div className="mt-3 text-sm text-slate-500 space-y-1">
                <div>
                  Category: <strong>{getCategoryName(course.category_id)}</strong>
                </div>
                <div>
                  {/* Instructor: <strong>{getInstructorName(course.instructor_id)}</strong> */}
				  Instructor: <strong>{course.instructor_username}</strong>
                </div>
                <div>Price: <strong>{course.price ?? 0}</strong></div>
                <div>Duration: <strong>{course.duration ?? 0}</strong></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(course)}
                  className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course)}
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
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editing ? 'Edit Course' : 'Add Course'}
            </h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Instructor</label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.instructor_id}
                  onChange={(e) => setForm((f) => ({ ...f, instructor_id: Number(e.target.value) }))} // -------------------------
                  required
                >
                  <option value="">Select instructor</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value || 0) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Duration (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: parseFloat(e.target.value || 0) }))}
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
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