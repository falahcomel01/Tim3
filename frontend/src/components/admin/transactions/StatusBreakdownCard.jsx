import { ListChecks } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

const STATUS_META = {
  pending:    { label: 'Menunggu',   color: '#fbbf24' },
  paid:       { label: 'Dibayar',    color: '#60a5fa' },
  processing: { label: 'Diproses',   color: '#a78bfa' },
  shipped:    { label: 'Dikirim',    color: '#22d3ee' },
  delivered:  { label: 'Selesai',    color: '#34d399' },
  cancelled:  { label: 'Dibatalkan', color: '#f87171' },
  refunded:   { label: 'Refund',     color: '#94a3b8' },
};

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default function StatusBreakdownCard({ data = [], loading = false }) {
  const total = data.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  return (
    <div
      className="rounded-xl h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)', padding: '15px' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', paddingLeft: '20px' }}
      >
        <div className="flex items-start gap-2">
          <ListChecks size={16} style={{ color: '#a78bfa', marginTop: '2px' }} />
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', margin: 0 }}>Status Transaksi</h3>
            <p className="text-xs" style={{ color: '#64748b', margin: '1px 0 0 0' }}>Jumlah &amp; nilai per status</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-5 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded animate-pulse" style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState title="Belum ada transaksi" description="Status transaksi akan tampil di sini." />
      ) : (
        <div className="flex flex-col gap-3 mt-3" style={{ padding: '0 20px 8px' }}>
          {data.filter((d) => d.count > 0).map((d) => {
            const meta = STATUS_META[d.status] || { label: d.status, color: '#64748b' };
            const pct = total > 0 ? (d.count / total) * 100 : 0;

            return (
              <div key={d.status}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12.5px', color: '#e2e8f0', fontWeight: 500 }}>{meta.label}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({d.count})</span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fbbf24' }}>{formatRupiah(d.total)}</span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', backgroundColor: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
