import { ShoppingBag } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

// Peta warna & label per status order (selaras dengan OrderStatusChart)
const STATUS_META = {
  pending:    { label: 'Menunggu',   color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  paid:       { label: 'Dibayar',    color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)' },
  processing: { label: 'Diproses',   color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)' },
  shipped:    { label: 'Dikirim',    color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)' },
  delivered:  { label: 'Selesai',    color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
  cancelled:  { label: 'Dibatalkan', color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  refunded:   { label: 'Refund',     color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)' },
};

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || '—', color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)' };
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  );
}

export default function RecentOrdersTable({ data = [], loading = false }) {
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
  <ShoppingBag size={16} style={{ color: '#60a5fa' }} />
  <h3 className="text-sm font-bold" style={{ color: '#ffffff' }}>Pesanan Terbaru</h3>
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
            {data.length} pesanan
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-5 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded animate-pulse"
              style={{ height: '40px', backgroundColor: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="Belum ada pesanan" description="Pesanan terbaru akan tampil di sini." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Order', 'Pelanggan', 'Items', 'Total', 'Status', 'Tanggal'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      textAlign: i === 2 || i === 3 ? 'right' : 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((order, idx) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px' }}>
                      #{order.id ? String(order.id).slice(0, 8).toUpperCase() : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#e2e8f0' }}>{order.customer_name || '—'}</span>
                    {order.customer_email && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {order.customer_email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#94a3b8' }}>
                    {order.items_count ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: '#fbbf24' }}>{formatRupiah(order.total)}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatDate(order.ordered_at)}
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
