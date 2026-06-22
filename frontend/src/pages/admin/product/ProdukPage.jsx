// ProdukPage.jsx
import { useState, useEffect, useCallback } from 'react';
import ProductTable from '../../../components/admin/product/ProductTable';
import ProductForm from '../../../components/admin/product/ProductForm';
import ProdukDeleteModal from '../../../components/admin/product/ProdukDeleteModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../services/productService';
import { getCategories } from '../../../services/categoryService';

export default function ProdukPage() {
  const [products, setProducts]               = useState([]);
  const [categories, setCategories]           = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [view, setView]                       = useState('table');

  useEffect(() => {
    getCategories()
      .then(res => {
        const d = res.data?.data;
        setCategories(d?.data ?? d ?? []);
      })
      .catch(() => console.warn('Gagal memuat kategori.'));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ per_page: 100 })
      .then(res => {
        const d = res.data?.data;
        setProducts(d?.data ?? d ?? []);
      })
      .catch(() => alert('Gagal memuat produk.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setView('form');
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setView('form');
  };

  const handleSubmit = async (form) => {
    if (!form) {
      setSelectedProduct(null);
      setView('table');
      return;
    }
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, form);
      } else {
        await createProduct(form);
      }
      setSelectedProduct(null);
      setView('table');
      fetchProducts();
    } catch (err) {
      const errors  = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errors) {
        alert('Validasi gagal:\n' + Object.values(errors).flat().join('\n'));
      } else {
        alert(message ?? 'Gagal menyimpan produk.');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      fetchProducts();
    } catch {
      alert('Gagal menghapus produk.');
    }
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setView('table');
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
                ← Kembali ke Daftar Produk
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
                ? (selectedProduct ? 'Edit Produk' : 'Tambah Produk')
                : 'Kelola Produk'}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {view === 'form'
                ? 'Isi detail produk di bawah ini'
                : 'Kelola produk yang tersedia di toko'}
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
              + Tambah Produk
            </button>
          )}
        </div>

        {/* ── Konten utama ── */}
        {view === 'table' ? (
          <ProductTable
            products={products}
            loading={loading}
            onEdit={handleEdit}
            onDelete={(product) => setProductToDelete(product)}
          />
        ) : (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleSubmit}
            categories={categories}
          />
        )}

        <ProdukDeleteModal
          product={productToDelete}
          onConfirm={handleDelete}
          onCancel={() => setProductToDelete(null)}
        />
      </div>
    </div>
  );
}