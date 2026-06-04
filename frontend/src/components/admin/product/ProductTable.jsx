import { useState } from "react";

// ✅ Sesuaikan dengan URL Laravel kamu di file .env → VITE_API_URL=http://localhost:8000
const BASE_URL = 'http://localhost:8000'; // ganti dengan URL Laravel kamu yang sebenarnya

const getThumbUrl = (images = []) => {
  const imgObj = images.find(i => i.is_primary) ?? images[0];
  if (!imgObj?.url) return null;
  const url = imgObj.url.replace(/\\/g, '/'); // ganti backslash jadi slash
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div style={{
        width: '48px', height: '48px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>
        📦
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '48px', height: '48px',
        objectFit: 'cover', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'block',
      }}
      onError={() => setError(true)}
    />
  );
};

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  return (
    <div style={{
      background: '#121318',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
          Daftar Produk
        </h2>
        <span style={{
          fontSize: '12px', color: '#64748b',
          background: 'rgba(255,255,255,0.05)',
          padding: '4px 10px', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {products.length} produk
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, margin: '0 auto',
            border: '3px solid rgba(255,255,255,0.07)',
            borderTop: '3px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📦</div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Belum ada produk</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>Tambahkan produk menggunakan form di atas</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Foto', 'Nama Produk', 'Harga', 'Stok', 'Status', 'Aksi'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: h === 'Aksi' ? 'center' : 'left',
                    fontSize: '12px', fontWeight: 600, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const thumb = getThumbUrl(product.images);
                const statusName = product.status?.name_status ?? product.status?.name ?? '—';

                return (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: idx < products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Foto */}
                    <td style={{ padding: '12px 16px' }}>
                      <ProductImage src={thumb} alt={product.name} />
                    </td>

                    {/* Nama + Kategori */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#e2e8f0' }}>
                        {product.name}
                      </span>
                      {(product.categories ?? []).length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {product.categories.slice(0, 2).map(c => (
                            <span key={c.id} style={{
                              fontSize: 10, padding: '2px 7px', borderRadius: 99,
                              background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                              border: '1px solid rgba(245,158,11,0.2)',
                            }}>
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Harga */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600 }}>
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Stok */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        padding: '4px 10px', borderRadius: '20px',
                        background: product.stock > 10 ? 'rgba(16,185,129,0.1)' : product.stock > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: product.stock > 10 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                        border: `1px solid ${product.stock > 10 ? 'rgba(16,185,129,0.3)' : product.stock > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        padding: '4px 10px', borderRadius: 99,
                        background: 'rgba(148,163,184,0.1)', color: '#94a3b8',
                        border: '1px solid rgba(148,163,184,0.2)',
                      }}>
                        {statusName}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => onEdit(product)} style={{
                          padding: '6px 14px',
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '6px', color: '#60a5fa',
                          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        }}
                          onMouseEnter={e => e.target.style.background = 'rgba(59,130,246,0.2)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(59,130,246,0.1)'}
                        >Edit</button>
                        <button onClick={() => onDelete(product)} style={{
                          padding: '6px 14px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '6px', color: '#f87171',
                          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        }}
                          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                        >Hapus</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductTable;