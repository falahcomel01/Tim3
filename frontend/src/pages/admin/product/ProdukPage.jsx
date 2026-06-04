import { useState, useEffect, useCallback } from 'react';
import ProductTable from '../../../components/admin/product/ProductTable';
import ProductForm from '../../../components/admin/product/ProductForm';
import ProdukDeleteModal from '../../../components/admin/product/ProdukDeleteModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../services/productService';
// ── TAMBAHAN: import service kategori ──
import { getCategories } from '../../../services/categoryService';

export default function ProdukPage() {
  const [products, setProducts]               = useState([]);
  const [categories, setCategories]           = useState([]); // <-- baru
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading]                 = useState(true);

  // ── TAMBAHAN: fetch categories sekali saat mount ──
  useEffect(() => {
    getCategories()
      .then(res => {
        // Sesuaikan dengan bentuk response API kamu:
        // { data: { data: [...] } }  atau  { data: [...] }
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

  const handleSubmit = async (form) => {
    if (!form) { setSelectedProduct(null); return; }
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, form);
      } else {
        await createProduct(form);
      }
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      const errors  = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errors) {
        const detail = Object.values(errors).flat().join('\n');
        alert('Validasi gagal:\n' + detail);
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

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            margin: '0 0 4px',
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}>
            Manage Produk
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Kelola produk yang tersedia di toko
          </p>
        </div>

        {/* ── TAMBAHAN: pass categories ke ProductForm ── */}
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          categories={categories}
        />

        <ProductTable
          products={products}
          loading={loading}
          onEdit={(product) => setSelectedProduct(product)}
          onDelete={(product) => setProductToDelete(product)}
        />

        <ProdukDeleteModal
          product={productToDelete}
          onConfirm={handleDelete}
          onCancel={() => setProductToDelete(null)}
        />
      </div>
    </div>
  );
}