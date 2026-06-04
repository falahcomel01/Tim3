import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/categoryService';

// ─── shared token ────────────────────────────────────────────────────────────
const amber  = '#f59e0b';
const red    = '#ef4444';
const green  = '#10b981';
const muted  = '#64748b';
const subtle = '#94a3b8';
const card   = '#121318';
const bg     = '#0a0b0f';
const border = 'rgba(255,255,255,0.08)';
const borderFaint = 'rgba(255,255,255,0.04)';

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const Badge = ({ count }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '22px', padding: '0 8px',
    background: count > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${count > 0 ? 'rgba(245,158,11,0.25)' : border}`,
    borderRadius: '999px',
    fontSize: '12px', fontWeight: 600,
    color: count > 0 ? amber : muted,
  }}>
    {count}
  </span>
);

const IconBtn = ({ onClick, danger, title, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px',
        background: hov
          ? (danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)')
          : 'transparent',
        border: `1px solid ${hov
          ? (danger ? 'rgba(239,68,68,0.35)' : border)
          : border}`,
        borderRadius: '8px',
        color: hov ? (danger ? red : '#fff') : subtle,
        cursor: 'pointer', fontSize: '15px',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
};

// ─── confirm modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ category, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  }}>
    <div style={{
      background: card, border: `1px solid rgba(239,68,68,0.25)`,
      borderRadius: '14px', padding: '28px 24px', maxWidth: '400px', width: '100%',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>🗑️</div>
      <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
        Hapus Kategori?
      </h3>
      <p style={{ margin: '0 0 6px', fontSize: '14px', color: subtle, lineHeight: 1.6 }}>
        Kategori <strong style={{ color: '#fff' }}>"{category.name}"</strong> akan dihapus permanen.
      </p>
      {category.product_count > 0 && (
        <p style={{
          margin: '10px 0 0', padding: '10px 14px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px', fontSize: '13px', color: '#fca5a5',
        }}>
          ⚠️ {category.product_count} produk masih menggunakan kategori ini.
          Relasi akan dilepas otomatis.
        </p>
      )}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: '10px', background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px',
            color: red, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Ya, Hapus
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '10px', background: 'transparent',
            border: `1px solid ${border}`, borderRadius: '8px',
            color: subtle, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Batal
        </button>
      </div>
    </div>
  </div>
);

// ─── toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div style={{
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 99,
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 18px',
    background: card, border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
    borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontSize: '14px', color: type === 'error' ? '#fca5a5' : '#6ee7b7',
    animation: 'fadeInUp 0.2s ease',
  }}>
    {type === 'error' ? '✕' : '✓'} {msg}
    <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
);

// ─── main page ────────────────────────────────────────────────────────────────
const CategoryListPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toDelete,   setToDelete]   = useState(null);   // category obj
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState(null);   // { msg, type }
  const [search,     setSearch]     = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = useCallback(() => {
    setLoading(true);
    getCategories()
      .then(res => {
        const raw = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(raw) ? raw : []);
      })
      .catch(() => showToast('Gagal memuat kategori', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id);
      showToast(`Kategori "${toDelete.name}" berhasil dihapus`);
      fetchCategories();
    } catch {
      showToast('Gagal menghapus kategori', 'error');
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            Kategori Produk
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: muted }}>
            {categories.length} kategori terdaftar
          </p>
        </div>
        <button
          onClick={() => navigate('/categories/create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '8px',
            color: amber, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ＋ Tambah Kategori
        </button>
      </div>

      {/* Card tabel */}
      <div style={{
        background: card,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>

        {/* Search bar */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${border}` }}>
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px',
              background: bg, border: `1px solid ${border}`,
              borderRadius: '8px', color: '#fff', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 100px',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: `1px solid ${border}`,
        }}>
          {['Nama Kategori', 'Jumlah Produk', ''].map((h, i) => (
            <span key={i} style={{
              fontSize: '12px', fontWeight: 600,
              color: muted, letterSpacing: '0.04em',
              textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: muted, fontSize: '14px' }}>
            Memuat...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗂️</div>
            <p style={{ margin: 0, fontSize: '14px', color: muted }}>
              {search ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}
            </p>
          </div>
        ) : (
          filtered.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 100px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? `1px solid ${borderFaint}` : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Nama */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: amber, flexShrink: 0,
                  boxShadow: `0 0 6px ${amber}`,
                }} />
                <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 500 }}>
                  {cat.name}
                </span>
              </div>

              {/* Jumlah produk */}
              <div style={{ textAlign: 'center' }}>
                <Badge count={cat.product_count ?? 0} />
              </div>

              {/* Aksi */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <IconBtn
                  title="Edit kategori"
                  onClick={() => navigate(`/categories/${cat.id}/edit`)}
                >
                  ✏️
                </IconBtn>
                <IconBtn
                  title="Hapus kategori"
                  danger
                  onClick={() => setToDelete(cat)}
                >
                  🗑
                </IconBtn>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm modal */}
      {toDelete && (
        <ConfirmModal
          category={toDelete}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setToDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default CategoryListPage;