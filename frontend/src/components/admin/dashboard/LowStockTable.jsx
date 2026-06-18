import EmptyState from '../../common/EmptyState';

export default function LowStockTable({ data = [], loading = false }) {
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
      <h3 style={{ marginBottom: '16px' }}>Stok Menipis</h3>

      {data.length === 0 ? (
        <EmptyState
          title="Stok aman"
          description="Tidak ada produk dengan stok menipis saat ini."
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
              <th
                style={{
                  padding: '10px',
                  borderBottom: '2px solid #ddd',
                  textAlign: 'left',
                }}
              >
                Produk
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '2px solid #ddd',
                  textAlign: 'left',
                }}
              >
                SKU
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '2px solid #ddd',
                  textAlign: 'right',
                }}
              >
                Stok
              </th>
              <th
                style={{
                  padding: '10px',
                  borderBottom: '2px solid #ddd',
                  textAlign: 'right',
                }}
              >
                Batas Min.
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {p.name}
                </td>

                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {p.sku || '-'}
                </td>

                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                  }}
                >
                  {p.stock}
                </td>

                <td
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    textAlign: 'right',
                  }}
                >
                  {p.threshold ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}