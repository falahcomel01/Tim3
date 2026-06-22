import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, ResponsiveContainer } from 'recharts';
import EmptyState from '../../common/EmptyState';
import { TrendingUp } from 'lucide-react';


function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactRupiah(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

function truncate(name, max = 18) {
  if (!name) return '';
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

function CustomTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#1a1b22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        maxWidth: '220px',
      }}
    >
      <p style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{d.name}</p>
      <p style={{ fontSize: '11px', color: '#94a3b8' }}>
        <span style={{ color: metric === 'qty_sold' ? '#fbbf24' : '#94a3b8', fontWeight: metric === 'qty_sold' ? 600 : 400 }}>
          {d.qty_sold ?? 0} terjual
        </span>
        {' \u00b7 '}
        <span style={{ color: metric === 'revenue' ? '#fbbf24' : '#94a3b8', fontWeight: metric === 'revenue' ? 600 : 400 }}>
          {formatRupiah(d.revenue)}
        </span>
      </p>
    </div>
  );
}

const toggleBase = {
  padding: '5px 12px',
  fontSize: '12px',
  fontWeight: 500,
  borderRadius: '6px',
  cursor: 'pointer',
  border: 'none',
  transition: 'background-color 0.15s, color 0.15s',
};

export default function TopProductsChart({ data = [], loading = false }) {
  const [metric, setMetric] = useState('qty_sold');

  const sorted = [...data]
    .sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0))
    .slice(0, 7)
    .map((d) => ({ ...d, displayName: truncate(d.name) }));

  const chartHeight = Math.max(220, sorted.length * 40);

  return (
    <div
      className="rounded-xl h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)', padding:'15px' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom:'10px', paddingLeft: '20px'}}
      >

        <div className="flex items-start gap-2">
            <TrendingUp size={16} style={{color: '#fbbf24', marginTop: '2px',}}/>
            <div>
              <h3 className="text-sm font-bold" style={{color: '#ffffff', margin: 0,}}> Produk Terlaris</h3>
              <p className="text-xs" style={{color: '#64748b', margin: '1px 0 0 0', }}>Top {sorted.length || 0} produk</p>
            </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <button
            type="button"
            onClick={() => setMetric('qty_sold')}
            style={{
              ...toggleBase,
              backgroundColor: metric === 'qty_sold' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: metric === 'qty_sold' ? '#fbbf24' : '#64748b',
            }}
          >
            Terjual
          </button>
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            style={{
              ...toggleBase,
              backgroundColor: metric === 'revenue' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: metric === 'revenue' ? '#fbbf24' : '#64748b',
            }}
          >
            Pendapatan
          </button>
        </div>
      </div>

      {loading ? (
        <div
          className="rounded-lg animate-pulse mt-4"
          style={{ height: '260px', backgroundColor: 'rgba(255,255,255,0.04)' }}
        />
      ) : sorted.length === 0 ? (
        <EmptyState title="Belum ada produk terjual" description="Produk terlaris akan tampil di sini." />
      ) : (
        <div style={{ height: `${chartHeight}px`, marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 36, left: 0, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="displayName"
                width={120}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey={metric} radius={[0, 6, 6, 0]} barSize={18}>
                {sorted.map((entry, i) => (
                  <Cell key={entry.id ?? i} fill="#f59e0b" fillOpacity={Math.max(0.35, 1 - i * 0.1)} />
                ))}
                <LabelList
                  dataKey={metric}
                  position="right"
                  formatter={metric === 'revenue' ? formatCompactRupiah : (v) => v}
                  style={{ fill: '#cbd5e1', fontSize: '11px', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
