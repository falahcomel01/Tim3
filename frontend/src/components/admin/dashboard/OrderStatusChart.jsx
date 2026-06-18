export default function OrderStatusChart({ data = [], loading = false }) {
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h3 style={{ marginBottom: "16px" }}>Status Pesanan</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "2px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Status
            </th>
            <th
              style={{
                borderBottom: "2px solid #ddd",
                padding: "10px",
                textAlign: "right",
              }}
            >
              Jumlah
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {item.status}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    textAlign: "right",
                  }}
                >
                  {item.count}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="2"
                style={{
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}