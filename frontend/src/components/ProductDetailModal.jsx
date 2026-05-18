import { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import bannerImg from '../assets/banner.jpeg';
import kaos2 from '../assets/kaos2.jpeg';
import kaos3 from '../assets/kaos3.jpeg';
import kaos4 from '../assets/kaos4.jpeg';

function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState('L');

  // Image source matcher to represent actual local assets
  const getProductImage = (productId) => {
    if (productId === 1) return bannerImg; // Kaos Oversize (sunset image!)
    if (productId === 2) return kaos2; // Hoodie
    if (productId === 3) return kaos3; // Tote Bag
    if (productId === 4) return kaos4; // Kaos Polo
    return bannerImg;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#111216', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button 
          className="close-btn modal-close-corner" 
          onClick={onClose} 
          aria-label="Tutup detail modal"
          style={{ background: '#1c1d24', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={18} />
        </button>

        <div className="modal-grid">
          <div className="modal-image-panel" style={{ background: '#191a20' }}>
            <img 
              src={getProductImage(product.id)} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <div className="modal-details">
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block', fontWeight: '700' }}>
              {product.tag}
            </span>
            
            <h3 className="modal-title" style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
              {product.name}
            </h3>
            
            <span className="modal-price" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', display: 'block' }}>
              Rp {product.price.toLocaleString('id-ID')}
            </span>

            <div className="product-rating" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="star-icon" size={14} style={{ fill: '#ff9800', color: '#ff9800' }} />
              ))}
              <span className="rating-count" style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                ({product.reviews} ulasan pembeli)
              </span>
            </div>

            <p className="modal-description" style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8', marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Size Selector Dial */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>
                Pilih Ukuran Kaos:
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedSize === sz ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                      background: selectedSize === sz ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: selectedSize === sz ? 'var(--primary)' : '#cbd5e1',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>
              Spesifikasi Kaos:
            </h4>
            <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
              {product.features.map((feat, index) => (
                <li key={index} style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Check size={14} style={{ color: 'var(--primary)' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
