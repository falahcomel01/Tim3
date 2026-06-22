const ProdukDeleteModal = ({ product, onConfirm, onCancel }) => {
  if (!product) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#121318',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '400px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
        }}>
          🗑️
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          Hapus Produk
        </h3>

        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
          Yakin ingin menghapus produk{' '}
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>"{product.name}"</span>?
          Tindakan ini tidak bisa dibatalkan.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.25)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
          >
            Ya, Hapus
          </button>

          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProdukDeleteModal;