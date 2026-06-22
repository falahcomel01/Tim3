import { useState } from 'react';
import { ShoppingCart, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { storageUrl } from '../../services/config';

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

// ─── Helper: ambil semua URL gambar dari produk ───────────────────────────────
function getImages(product) {
  if (!product) return ['https://via.placeholder.com/300'];
  if (product.images?.length) {
    return product.images.map((img) =>
      storageUrl(img.url)
    );
  }
  if (product.image) return [product.image];
  return ['https://via.placeholder.com/300'];
}

// ─── Sub-komponen: Image Slider ───────────────────────────────────────────────
function ImageSlider({ images, aspectRatio = '4/3', maxHeight }) {
  const [index, setIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: maxHeight ? undefined : aspectRatio,
        height: maxHeight ?? undefined,
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
    >
      {!imgError ? (
        <img
          key={images[index]}
          src={images[index]}
          alt={`foto ${index + 1}`}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '40px' }}>👕</span>
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Foto sebelumnya"
            style={{
              position: 'absolute', left: '8px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', zIndex: 2,
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={next}
            aria-label="Foto berikutnya"
            style={{
              position: 'absolute', right: '8px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', zIndex: 2,
            }}
          >
            <ChevronRight size={18} />
          </button>

          <div
            style={{
              position: 'absolute', bottom: '8px', width: '100%',
              display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 2,
            }}
          >
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i === index ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const images = getImages(product);
  const variants = product.variants || [];

  // Ambil ukuran unik dari nama variant (format: "S - Lengan pendek")
  const sizes = [
    ...new Set(
      variants.map((v) => v.name?.split(' - ')[0]).filter(Boolean)
    ),
  ];

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Filter tipe berdasarkan ukuran yang dipilih
  const typesForSize = selectedSize
    ? variants.filter((v) => v.name?.startsWith(selectedSize + ' - '))
    : [];

  // Variant yang cocok dengan kombinasi ukuran + tipe
  const selectedVariant =
    selectedSize && selectedType
      ? variants.find((v) => v.name === `${selectedSize} - ${selectedType}`) || null
      : null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#121318',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94a3b8',
          }}
        >
          <X size={18} />
        </button>

        {/* Gambar */}
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          <ImageSlider images={images} maxHeight="100%" aspectRatio={undefined} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxHeight: '85vh' }}>

          {product.badge && (
            <div style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
              color: '#f59e0b', marginBottom: '10px',
            }}>
              {product.badge.toUpperCase()}
            </div>
          )}

          <h2 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            {product.name}
          </h2>

          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginBottom: '12px' }}>
            {formatRupiah(currentPrice)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating) ? '#f59e0b' : 'none'}
                stroke={i < Math.round(product.rating) ? '#f59e0b' : '#475569'}
              />
            ))}
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>({product.reviews} ulasan pembeli)</span>
          </div>

          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* PILIH UKURAN */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#64748b', marginBottom: '10px' }}>
                PILIH UKURAN KAOS:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedType(null); // reset tipe saat ukuran berubah
                    }}
                    style={{
                      width: '44px', height: '44px',
                      borderRadius: '10px', border: '1px solid',
                      borderColor: selectedSize === size ? '#f59e0b' : 'rgba(255,255,255,0.12)',
                      background: selectedSize === size ? 'rgba(245,158,11,0.15)' : 'transparent',
                      color: selectedSize === size ? '#f59e0b' : '#94a3b8',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PILIH TIPE — muncul setelah ukuran dipilih */}
          {selectedSize && typesForSize.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#64748b', marginBottom: '10px' }}>
                SPESIFIKASI KAOS:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {typesForSize.map((variant) => {
                  const tipe = variant.name?.split(' - ')[1];
                  const isSelected = selectedType === tipe;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedType(tipe)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px', border: '1px solid',
                        borderColor: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(245,158,11,0.15)' : 'transparent',
                        color: '#fff', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '14px' }}>✓</span>
                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{tipe}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                        {formatRupiah(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STOK */}
          <div style={{ marginBottom: '20px' }}>
            {currentStock === null ? (
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Pilih ukuran dan tipe untuk melihat stok
              </span>
            ) : (
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: currentStock > 5 ? '#4ade80' : currentStock > 0 ? '#fbbf24' : '#f87171',
                background: currentStock > 5 ? 'rgba(74,222,128,0.1)' : currentStock > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
                padding: '4px 12px', borderRadius: '20px',
              }}>
                Stok: {currentStock}
              </span>
            )}
          </div>

          {/* TOMBOL KERANJANG */}
          <button
            disabled={!selectedVariant || currentStock <= 0}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              background: selectedVariant && currentStock > 0 ? '#f59e0b' : 'rgba(255,255,255,0.05)',
              color: selectedVariant && currentStock > 0 ? '#000' : '#475569',
              fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: selectedVariant && currentStock > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <ShoppingCart size={16} />
            {!selectedVariant
              ? 'Pilih Varian Terlebih Dahulu'
              : currentStock > 0
              ? 'Tambah ke Keranjang'
              : 'Stok Habis'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isOutOfStock = product.stock === 0;
  const images = getImages(product);

  return (
    <>
      {showModal && <ProductModal product={product} onClose={() => setShowModal(false)} />}

      <div
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#121318',
          border: `1px solid ${hovered ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image Slider */}
        <div style={{ position: 'relative' }}>
          <ImageSlider images={images} aspectRatio="4/3" />

          {/* Badge kategori */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px', zIndex: 3,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '20px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 600, color: '#f59e0b',
          }}>
            {product.category}
          </div>

          {/* Overlay stok habis */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                background: '#ef4444', color: '#fff',
                fontSize: '12px', fontWeight: 700,
                padding: '4px 12px', borderRadius: '20px',
              }}>
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <h3 style={{
            margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {product.name}
          </h3>
          <p style={{
            margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
              {formatRupiah(product.price)}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
              color: product.stock > 5 ? '#4ade80' : product.stock > 0 ? '#fbbf24' : '#f87171',
              background: product.stock > 5 ? 'rgba(74,222,128,0.1)' : product.stock > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
            }}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
            </span>
          </div>
          <button
            disabled={isOutOfStock}
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: '6px', width: '100%', padding: '10px',
              borderRadius: '10px', border: 'none',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: isOutOfStock ? 'rgba(255,255,255,0.05)' : hovered ? '#f59e0b' : 'rgba(245,158,11,0.15)',
              color: isOutOfStock ? '#475569' : hovered ? '#000' : '#f59e0b',
              fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </>
  );
}