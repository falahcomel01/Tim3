// CategoryPage.jsx
import { useState, useEffect, useCallback } from 'react';

import CategoryTable from '../../../components/admin/categories/CategoryTable';
import CategoryForm from '../../../components/admin/categories/CategoryForm';
import CategoryDeleteModal from '../../../components/admin/categories/CategoryDeleteModal';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../services/categoryService';

export default function CategoryPage() {
  const [categories, setCategories]             = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [view, setView]                         = useState('table');

  const fetchCategories = useCallback(() => {
    setLoading(true);
    getCategories({ per_page: 100 })
      .then((res) => {
        const data = res.data?.data;
        setCategories(data?.data ?? []);
      })
      .catch(() => alert('Gagal memuat kategori.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setView('form');
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setView('form');
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setView('table');
  };

  const handleSubmit = async (form) => {
    if (!form) {
      setSelectedCategory(null);
      setView('table');
      return;
    }
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, form);
      } else {
        await createCategory(form);
      }
      setSelectedCategory(null);
      setView('table');
      fetchCategories();
    } catch (err) {
      const errors  = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errors) {
        alert('Validasi gagal:\n' + Object.values(errors).flat().join('\n'));
      } else {
        alert(message || 'Gagal menyimpan kategori.');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      fetchCategories();
    } catch {
      alert('Gagal menghapus kategori.');
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div>
            {view === 'form' && (
              <button
                onClick={handleBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  marginBottom: '10px',
                  background: 'transparent',
                  color: '#f59e0b',
                  border: '1px solid #d97706',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                ← Kembali ke Daftar Kategori
              </button>
            )}
            <h1 style={{
              margin: '0 0 4px',
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}>
              {view === 'form'
                ? (selectedCategory ? 'Edit Kategori' : 'Tambah Kategori')
                : 'Kelola Kategori'}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {view === 'form'
                ? 'Isi detail kategori di bawah ini'
                : 'Kelola kategori produk toko'}
            </p>
          </div>

          {view === 'table' && (
            <button
              onClick={handleAdd}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#1a0f00',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              + Tambah Kategori
            </button>
          )}
        </div>

        {/* ── Konten utama ── */}
        {view === 'table' ? (
          <CategoryTable
            categories={categories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={(category) => setCategoryToDelete(category)}
          />
        ) : (
          <CategoryForm
            category={selectedCategory}
            onSubmit={handleSubmit}
            existingCategories={categories}
          />
        )}

        <CategoryDeleteModal
          category={categoryToDelete}
          onConfirm={handleDelete}
          onCancel={() => setCategoryToDelete(null)}
        />
      </div>
    </div>
  );
}