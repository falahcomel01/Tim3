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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(() => {
    setLoading(true);

    getCategories({ per_page: 100 })
      .then((res) => {
        const data = res.data?.data;
        setCategories(data?.data ?? []);
      })
      .catch(() => {
        alert('Gagal memuat kategori.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (form) => {
    if (!form) {
      setSelectedCategory(null);
      return;
    }

    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, form);
      } else {
        await createCategory(form);
      }

      setSelectedCategory(null);
      fetchCategories();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (errors) {
        const detail = Object.values(errors)
          .flat()
          .join('\n');

        alert('Validasi gagal:\n' + detail);
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
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        background: '#08090c',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              margin: '0 0 4px',
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            Manage Kategori
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#64748b',
            }}
          >
            Kelola kategori produk toko
          </p>
        </div>

        {/* Form */}
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleSubmit}
        />

        {/* Table */}
        <CategoryTable
          categories={categories}
          loading={loading}
          onEdit={(category) =>
            setSelectedCategory(category)
          }
          onDelete={(category) =>
            setCategoryToDelete(category)
          }
        />

        {/* Modal Delete */}
        <CategoryDeleteModal
          category={categoryToDelete}
          onConfirm={handleDelete}
          onCancel={() =>
            setCategoryToDelete(null)
          }
        />
      </div>
    </div>
  );
}