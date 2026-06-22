import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Star, Info } from 'lucide-react';
import bannerImg from '../assets/banner.jpeg';
import kaos2 from '../assets/kaos2.jpeg';
import kaos3 from '../assets/kaos3.jpeg';
import kaos4 from '../assets/kaos4.jpeg';
import { getCategories } from '../services/categoryService';

function ProductSection({ 
  products, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  onQuickView
}) {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [categories, setCategories] = useState([]);

  // Fetch kategori aktif dari API
  useEffect(() => {
    getCategories({ per_page: 100 })
      .then((res) => {
        const data = res.data?.data?.data ?? res.data?.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      activeCategory === '' ||
      (Array.isArray(prod.categories)
        ? prod.categories.some((c) => String(c.id) === String(activeCategory))
        : String(prod.category_id) === String(activeCategory));

    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getProductImage = (productId) => {
    if (productId === 1) return bannerImg;
    if (productId === 2) return kaos2;
    if (productId === 3) return kaos3;
    if (productId === 4) return kaos4;
    return bannerImg;
  };

  const renderCustomCartIcon = (className = 'w-4 h-4', style = { width: '16px', height: '16px' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      style={style}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );

  const goToCustomerService = (product) => {
    navigate('/customer-service', {
      state: {
        subject: `Tanya ${product.name}`,
        message: `Halo admin, saya ingin bertanya tentang ${product.name}.`,
      },
    });
  };

  return (
    <section id="katalog" className="catalog-section" style={{ background: '#08090c' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Koleksi Kaos <span>SIBER</span></h2>
          <p className="section-description">
            Katalog pakaian resmi Himpunan Mahasiswa Sistem Informasi. Memadukan identitas keilmuan dan semangat sinergi.
          </p>
        </div>

        {/* Filter dan Search */}
        <div className="catalog-filters-bar">

          {/* ✅ Dropdown filter kategori */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              style={{
                padding: '9px 14px',
                background: '#0a0b0f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: activeCategory === '' ? '#64748b' : '#f59e0b',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '160px',
              }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Tombol reset filter jika ada kategori dipilih */}
            {activeCategory !== '' && (
              <button
                onClick={() => setActiveCategory('')}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ✕ Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div className="catalog-search">
            <Search className="catalog-search-icon" size={18} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Cari katalog SIBER..."
              className="catalog-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* Grid produk */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="product-card"
                onClick={() => onQuickView(prod)}
                style={{
                  cursor: 'pointer',
                  background: '#111216',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="product-badge"
                  style={{ background: 'var(--primary)', color: '#08090c', fontWeight: '800' }}
                >
                  {prod.badgeText}
                </div>

                <div
                  className="product-img-wrapper"
                  style={{ height: '220px', background: '#191a20', overflow: 'hidden', position: 'relative' }}
                >
                  <img
                    src={
                      prod.images?.[0]?.url ??
                      prod.image_url ??
                      getProductImage(prod.id)
                    }
                    alt={prod.name}
                    className="product-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />

                  {/* Hover Overlay with Detail and Chat actions */}
                  <div className="product-overlay-actions">
                    <button
                      onClick={(e) => { e.stopPropagation(); onQuickView(prod); }}
                      className="action-circle-btn"
                      title="Lihat Detail"
                      style={{
                        background: 'var(--primary)',
                        color: '#0b0c10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderCustomCartIcon('w-5 h-5', { width: '20px', height: '20px' })}
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={(e) => { e.stopPropagation(); goToCustomerService(prod); }}
                        className="action-circle-btn"
                        title="Chat admin"
                        aria-label={`Chat admin tentang ${prod.name}`}
                        style={{ background: '#111216', color: 'var(--primary)', border: '1px solid rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <MessageCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="product-content" style={{ padding: '20px' }}>
                  {/* Tampilkan nama kategori pertama jika ada */}
                  <span className="product-category" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                    {prod.categories?.[0]?.name ?? prod.category ?? ''}
                  </span>

                  <h3
                    className="product-name"
                    style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '6px 0 10px' }}
                  >
                    {prod.name}
                  </h3>

                  <div
                    className="product-rating"
                    style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} style={{ fill: '#ff9800', color: '#ff9800' }} />
                    ))}
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                      ({prod.reviews ?? 0} ulasan)
                    </span>
                  </div>

                  <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span className="product-price" style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {isAuthenticated && (
                        <button
                          onClick={(e) => { e.stopPropagation(); goToCustomerService(prod); }}
                          className="add-cart-text-btn"
                          title="Chat admin"
                          aria-label={`Chat admin tentang ${prod.name}`}
                          style={{
                            color: 'var(--primary)',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MessageCircle size={17} />
                        </button>
                      )}

                      {/* Detail Button with Custom Cart SVG inside */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onQuickView(prod); }} 
                        className="add-cart-text-btn"
                        style={{ 
                          color: 'var(--primary)', 
                          background: 'rgba(245, 158, 11, 0.08)', 
                          border: '1px solid rgba(245, 158, 11, 0.15)', 
                          padding: '6px 14px', 
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {renderCustomCartIcon()}
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
            <Info size={44} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3>Barang tidak ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian atau kategori filter lainnya.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductSection;
