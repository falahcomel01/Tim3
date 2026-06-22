import { AlertTriangle } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

function StockBadge({ stock }) {
  const isCritical = stock <= 0;
  const color = isCritical ? '#f87171' : '#fbbf24';
  const bg = isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
  const border = isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)';

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '13px',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {stock}
    </span>
  );
}

export default function LowStockTable({ data = [], loading = false }) {
  return (
    <div
      className="rounded-xl h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)', padding:'15px' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom:'10px'}}
      >
        <div className="flex items-center gap-2" style={{ paddingLeft: '20px' }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          <h3 className="text-sm font-bold" style={{ color: '#ffffff' }}>Stok Menipis</h3>
        </div>
        {!loading && data.length > 0 && (
          <span
            style={{
              fontSize: '11px',
              color: '#64748b',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {data.length} produk
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-5 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded animate-pulse"
              style={{ height: '40px', backgroundColor: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title="Stok aman"
          description="Tidak ada produk dengan stok menipis saat ini."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Produk', 'SKU', 'Stok', 'Batas Min.'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      textAlign: i >= 2 ? 'right' : 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p, idx) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{p.name}</span>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#64748b', fontSize: '12px' }}>
                    {p.sku || '—'}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <StockBadge stock={p.stock} />
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: '#64748b' }}>
                    {p.threshold ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
