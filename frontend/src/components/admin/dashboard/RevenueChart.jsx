import EmptyState from '../../common/EmptyState';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default function RevenueChart({
  data = [],
  loading = false,
  subtitle = 'Tren pendapatan dari pesanan',
}) {
  const total = data.reduce(
    (sum, item) => sum + (Number(item.revenue) || 0),
    0
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h3>Pendapatan</h3>
      <p>{subtitle}</p>

      <p>
        <strong>Total Pendapatan:</strong> {formatRupiah(total)}
      </p>

      {data.length === 0 ? (
        <EmptyState
          title="Belum ada data pendapatan"
          description="Data akan muncul setelah ada transaksi yang berhasil."
        />
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '16px',
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Tanggal</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Pendapatan</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.date}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {formatRupiah(item.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 style={{ marginTop: '20px' }}>Data Mentah Backend</h4>

      <pre
        style={{
          background: '#f5f5f5',
          border: '1px solid #ddd',
          padding: '10px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

const thStyle = {
  padding: '10px',
  borderBottom: '2px solid #ddd',
  textAlign: 'left',
  fontWeight: 'bold',
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};