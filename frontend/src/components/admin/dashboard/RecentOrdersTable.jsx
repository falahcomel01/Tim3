import EmptyState from '../../common/EmptyState';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function RecentOrdersTable({ data = [], loading = false }) {
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
      <h3 style={{ marginBottom: '16px' }}>Pesanan Terbaru</h3>

      {data.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan terbaru akan tampil di sini."
        />
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Pelanggan</th>
              <th style={thStyle}>Email</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Items</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {data.map((order) => (
              <tr key={order.id}>
                <td style={tdStyle}>{order.id}</td>
                <td style={tdStyle}>{order.customer_name || '-'}</td>
                <td style={tdStyle}>{order.customer_email || '-'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {order.items_count ?? '-'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {formatRupiah(order.total)}
                </td>
                <td style={tdStyle}>{order.status || '-'}</td>
                <td style={tdStyle}>{formatDate(order.ordered_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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