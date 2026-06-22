import { CreditCard } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

const METHOD_LABEL = {
  bca:     'BCA Virtual Account',
  mandiri: 'Mandiri Virtual Account',
  bni:     'BNI Virtual Account',
  bri:     'BRI Virtual Account',
  gopay:   'GoPay',
  ovo:     'OVO',
  dana:    'DANA',
  qris:    'QRIS',
};

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default function PaymentBreakdownCard({ data = [], loading = false }) {
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
          <CreditCard size={16} style={{ color: '#60a5fa', marginTop: '2px' }} />
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', margin: 0 }}>Metode Pembayaran</h3>
            <p className="text-xs" style={{ color: '#64748b', margin: '1px 0 0 0' }}>Pembayaran berhasil pada periode ini</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-5 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded animate-pulse" style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="Belum ada pembayaran" description="Pembayaran sukses akan tampil di sini." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Metode', 'Jumlah', 'Total'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      textAlign: i > 0 ? 'right' : 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.payment_method} style={{ borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '12px 20px', color: '#e2e8f0' }}>
                    {METHOD_LABEL[row.payment_method] || row.payment_method || '—'}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: '#94a3b8' }}>{row.count}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: '#fbbf24' }}>
                    {formatRupiah(row.total)}
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
