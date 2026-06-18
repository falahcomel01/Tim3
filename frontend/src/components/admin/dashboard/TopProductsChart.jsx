import EmptyState from '../../common/EmptyState';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default function TopProductsChart({ data = [], loading = false }) {
  if (loading) {
    return <p>Loading...</p>;
  }

  const sorted = [...data].sort(
    (a, b) => (Number(b.qty_sold) || 0) - (Number(a.qty_sold) || 0)
  );

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h3>Produk Terlaris</h3>

      {sorted.length === 0 ? (
        <EmptyState
          title="Belum ada produk terjual"
          description="Produk terlaris akan tampil di sini."
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
              <th style={thStyle}>Produk</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Qty Terjual</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Pendapatan</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((item, index) => (
              <tr key={item.id || index}>
                <td style={tdStyle}>{item.name}</td>

                <td
                  style={{
                    ...tdStyle,
                    textAlign: 'right',
                  }}
                >
                  {item.qty_sold ?? 0}
                </td>

                <td
                  style={{
                    ...tdStyle,
                    textAlign: 'right',
                  }}
                >
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