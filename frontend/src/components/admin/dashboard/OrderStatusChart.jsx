import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from '../../common/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';

// Peta warna & label per status order (lihat orders.status pada skema DB)
const STATUS_META = {
  pending:    { label: 'Menunggu',   color: '#f59e0b' },
  paid:       { label: 'Dibayar',    color: '#3b82f6' },
  processing: { label: 'Diproses',   color: '#8b5cf6' },
  shipped:    { label: 'Dikirim',    color: '#06b6d4' },
  delivered:  { label: 'Selesai',    color: '#10b981' },
  cancelled:  { label: 'Dibatalkan', color: '#ef4444' },
  refunded:   { label: 'Refund',     color: '#64748b' },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#1a1b22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
      }}
    >
      <p style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{d.label}</p>
      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{d.count} pesanan</p>
    </div>
  );
}

export default function OrderStatusChart({ data = [], loading = false }) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      ...d,
      label: STATUS_META[d.status]?.label || d.status,
      color: STATUS_META[d.status]?.color || '#64748b',
    }));
  const total = chartData.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  return (

<div
      className="rounded-xl h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)', padding:'15px' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom:'10px', paddingLeft:'20px'}}
      >
  <div className="flex items-start gap-2">
    <PieChartIcon size={16} style={{ color: '#a78bfa', marginTop: '2px' }} />
    <div>
      <h3 className="text-sm font-bold" style={{ color: '#ffffff', margin: 0 }}>Status Pesanan</h3>
      <p className="text-xs mb-2" style={{ color: '#64748b', margin: '1px 0 0 0' }}>Distribusi status pesanan</p>
    </div>
  </div>
</div>
      {loading ? (
        <div
          className="rounded-lg animate-pulse mt-2"
          style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.04)' }}
        />
      ) : total === 0 ? (
        <EmptyState title="Belum ada pesanan" description="Pesanan akan muncul di sini." />
      ) : (
        <>
          <div style={{ position: 'relative', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{total}</p>
              <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Pesanan</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {chartData.map((d) => (
              <div key={d.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: d.color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{d.label}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
