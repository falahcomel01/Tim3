import { useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#1a1b22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
      }}
    >
      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>{formatRupiah(d.revenue)}</p>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{d.transactions} transaksi</p>
    </div>
  );
}

export default function RevenueTimelineChart({ data = [], loading = false, groupBy = 'day' }) {
  const gradientId = useId();
  const total = data.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);

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
          <BarChart3 size={16} style={{ color: '#34d399', marginTop: '2px' }} />
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', margin: 0 }}>Tren Transaksi</h3>
            <p className="text-xs" style={{ color: '#64748b', margin: '1px 0 0 0' }}>
              Pendapatan {groupBy === 'month' ? 'per bulan' : 'per hari'} pada periode yang dipilih
            </p>
          </div>
        </div>

        {!loading && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <TrendingUp size={12} style={{ color: '#34d399' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399' }}>{formatRupiah(total)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div
          className="rounded-lg animate-pulse mt-4"
          style={{ height: '280px', backgroundColor: 'rgba(255,255,255,0.04)' }}
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Data akan muncul setelah ada transaksi pada periode ini."
        />
      ) : (
        <div style={{ height: '280px', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245,158,11,0.3)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 4, fill: '#fbbf24', stroke: '#08090c', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
