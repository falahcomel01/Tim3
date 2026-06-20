const colorMap = {
  amber: {
    iconBg:    'rgba(245,158,11,0.1)',
    iconColor: '#fbbf24',
    valColor:  '#fbbf24',
    border:    'rgba(245,158,11,0.2)',
  },
  blue: {
    iconBg:    'rgba(59,130,246,0.1)',
    iconColor: '#60a5fa',
    valColor:  '#60a5fa',
    border:    'rgba(59,130,246,0.2)',
  },
  green: {
    iconBg:    'rgba(16,185,129,0.1)',
    iconColor: '#34d399',
    valColor:  '#34d399',
    border:    'rgba(16,185,129,0.2)',
  },
  purple: {
    iconBg:    'rgba(139,92,246,0.1)',
    iconColor: '#a78bfa',
    valColor:  '#a78bfa',
    border:    'rgba(139,92,246,0.2)',
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  color = 'amber',
  loading = false,
  trend,
  trendLabel = 'vs periode lalu',
}) {
  const c = colorMap[color] || colorMap.amber;
  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const isUp = hasTrend && trend > 0;
  const isDown = hasTrend && trend < 0;
  const trendColor = isUp ? '#34d399' : isDown ? '#f87171' : '#94a3b8';

  return (
    <div
        style={{
          backgroundColor: '#121318',
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingRight: '10px',
          paddingLeft: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
    >
  <div
    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-3"
    style={{ backgroundColor: c.iconBg }}
  >
    <Icon size={22} style={{ color: c.iconColor }} />
  </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium" style={{ color: '#64748b' }}>{label}</p>
        {loading ? (
          <div className="h-7 w-20 rounded animate-pulse mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        ) : (
<p className="text-xl font-bold mt-0.5 truncate" style={{ color: c.valColor }}>{value}</p>        )}
        {!loading && hasTrend && (
          <div className="flex items-center gap-1 mt-1">
            <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>
              {isUp ? '▲' : isDown ? '▼' : '–'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span style={{ fontSize: '11px', color: '#475569' }}>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
