import { Search, Star, Info } from 'lucide-react';
import bannerImg from '../assets/banner.jpeg';
import kaos2 from '../assets/kaos2.jpeg';
import kaos3 from '../assets/kaos3.jpeg';
import kaos4 from '../assets/kaos4.jpeg';

function ProductSection({ 
  products, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  onQuickView
}) {
  
  // Filter products based on search and category
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = activeCategory === 'Semua' || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Image source matcher to represent actual local assets
  const getProductImage = (productId) => {
    if (productId === 1) return bannerImg; // Kaos Oversize (sunset image!)
    if (productId === 2) return kaos2; // Hoodie
    if (productId === 3) return kaos3; // Tote Bag
    if (productId === 4) return kaos4; // Kaos Polo
    return bannerImg;
  };

  // Requested inline custom shopping cart SVG element
  const renderCustomCartIcon = (className = "w-4 h-4", style = { width: '16px', height: '16px' }) => (
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

  return (
    <section id="katalog" className="catalog-section" style={{ background: '#08090c' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Koleksi Kaos <span>SIBER</span></h2>
          <p className="section-description">Katalog pakaian resmi Himpunan Mahasiswa Sistem Informasi. Memadukan identitas keilmuan dan semangat sinergi.</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="catalog-filters-bar">
          <div className="filter-categories">
            {['Semua'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                style={{ 
                  background: activeCategory === cat ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? 'var(--primary)' : '#cbd5e1',
                  fontWeight: activeCategory === cat ? '700' : '500'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="catalog-search">
            <Search className="catalog-search-icon" size={18} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Cari katalog SIBER..."
              className="catalog-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#ffffff' }}
            />
          </div>
        </div>

        {/* Grid listing */}
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
                  overflow: 'hidden'
                }}
              >
                <div className={`product-badge`} style={{ background: 'var(--primary)', color: '#08090c', fontWeight: '800' }}>
                  {prod.badgeText}
                </div>

                <div className="product-img-wrapper" style={{ height: '220px', background: '#191a20', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={getProductImage(prod.id)} 
                    alt={prod.name} 
                    className="product-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />

                  {/* Hover Overlay with Custom Cart SVG */}
                  <div className="product-overlay-actions">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuickView(prod); }} 
                      className="action-circle-btn" 
                      title="Lihat Detail"
                      aria-label={`Lihat detail ${prod.name}`}
                      style={{ background: 'var(--primary)', color: '#0b0c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {renderCustomCartIcon("w-5 h-5", { width: '20px', height: '20px' })}
                    </button>
                  </div>
                </div>

                <div className="product-content" style={{ padding: '20px' }}>
                  <span className="product-category" style={{ color: 'var(--primary)', fontWeight: '600' }}>{prod.category}</span>
                  <h3 className="product-name" style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '6px 0 10px' }}>{prod.name}</h3>
                  
                  <div className="product-rating" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="star-icon" size={14} style={{ fill: '#ff9800', color: '#ff9800' }} />
                    ))}
                    <span className="rating-count" style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({prod.reviews} ulasan)</span>
                  </div>

                  <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="product-price" style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                    
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
            ))}
          </div>
        ) : (
          <div className="empty-cart-state" style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
            <Info size={44} className="empty-cart-icon" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3>Barang tidak ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian atau kategori filter lainnya.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductSection;
