// CategoryTable.jsx
export default function CategoryTable({ categories, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      background: '#111215',
      border: '1px solid rgba(212,175,55,.12)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0d0e11' }}>
            {['ID', 'Nama Kategori', 'Slug', 'Status', 'Aksi'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '12px 16px',
                  textAlign: i === 4 ? 'center' : 'left',
                  color: '#D4AF37',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(212,175,55,.1)',
                  width: i === 0 ? 70 : i === 3 ? 120 : i === 4 ? 160 : 'auto',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
                Belum ada data kategori
              </td>
            </tr>
          ) : (
            categories.map((category, idx) => {
              const isActive =
                category.status_id === 1 ||
                category.status?.id === 1 ||
                category.status?.name === 'Aktif';

              return (
                <tr
                  key={category.id}
                  style={{
                    borderBottom: idx < categories.length - 1
                      ? '1px solid rgba(255,255,255,.04)'
                      : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 16px', color: '#475569', fontSize: 13 }}>
                    {category.id}
                  </td>

                  <td style={{ padding: '13px 16px', color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>
                    {category.name}
                  </td>

                  <td style={{ padding: '13px 16px', fontSize: 13 }}>
                    <code style={{
                      background: 'rgba(255,255,255,.05)',
                      color: '#94a3b8',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}>
                      {category.slug || '—'}
                    </code>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: isActive ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
                      color: isActive ? '#10b981' : '#ef4444',
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: isActive ? '#10b981' : '#ef4444',
                        flexShrink: 0,
                      }} />
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => onEdit(category)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          border: '1px solid rgba(212,175,55,.25)',
                          background: 'rgba(212,175,55,.07)',
                          color: '#D4AF37',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          letterSpacing: '0.02em',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,.07)'}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(category)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          border: '1px solid rgba(239,68,68,.2)',
                          background: 'rgba(239,68,68,.07)',
                          color: '#ef4444',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          letterSpacing: '0.02em',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.07)'}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}