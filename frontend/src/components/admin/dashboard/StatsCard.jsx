export default function StatsCard({
  icon: Icon,
  label,
  value,
  loading = false,
  trend,
  trendLabel = 'vs periode lalu',
}) {
  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {Icon && <Icon size={20} />}

        <div>
          <div
            style={{
              fontSize: '14px',
              color: '#666',
            }}
          >
            {label}
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginTop: '4px',
              }}
            >
              {value}
            </div>
          )}

          {!loading && hasTrend && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#666',
              }}
            >
              Trend: {trend}% ({trendLabel})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}