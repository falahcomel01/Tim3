export default function CategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#94a3b8",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#121318",
        border: "1px solid rgba(212,175,55,.15)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(212,175,55,.08)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#0a0b0f",
            }}
          >
            <th
              style={{
                padding: "16px",
                textAlign: "left",
                color: "#D4AF37",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid rgba(212,175,55,.15)",
                width: 80,
              }}
            >
              ID
            </th>

            <th
              style={{
                padding: "16px",
                textAlign: "left",
                color: "#D4AF37",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid rgba(212,175,55,.15)",
              }}
            >
              Nama Kategori
            </th>

            <th
              style={{
                padding: "16px",
                textAlign: "left",
                color: "#D4AF37",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid rgba(212,175,55,.15)",
              }}
            >
              Slug
            </th>

            <th
              style={{
                padding: "16px",
                textAlign: "left",
                color: "#D4AF37",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid rgba(212,175,55,.15)",
                width: 140,
              }}
            >
              Status
            </th>

            <th
              style={{
                padding: "16px",
                textAlign: "center",
                color: "#D4AF37",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid rgba(212,175,55,.15)",
                width: 180,
              }}
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Belum ada data kategori
              </td>
            </tr>
          ) : (
            categories.map((category) => {
              const isActive =
                category.status_id === 1 ||
                category.status?.id === 1 ||
                category.status?.name === "Aktif";

              return (
                <tr
                  key={category.id}
                  style={{
                    borderBottom:
                      "1px solid rgba(255,255,255,.04)",
                  }}
                >
                  <td
                    style={{
                      padding: "16px",
                      color: "#ffffff",
                    }}
                  >
                    #{category.id}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      color: "#ffffff",
                      fontWeight: 600,
                    }}
                  >
                    {category.name}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      color: "#94a3b8",
                    }}
                  >
                    {category.slug || "-"}
                  </td>

                  <td
                    style={{
                      padding: "16px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: isActive
                          ? "rgba(16,185,129,.12)"
                          : "rgba(239,68,68,.12)",
                        border: isActive
                          ? "1px solid rgba(16,185,129,.25)"
                          : "1px solid rgba(239,68,68,.25)",
                        color: isActive
                          ? "#10b981"
                          : "#ef4444",
                      }}
                    >
                      ● {isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => onEdit(category)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border:
                            "1px solid rgba(212,175,55,.3)",
                          background:
                            "rgba(212,175,55,.08)",
                          color: "#D4AF37",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => onDelete(category)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border:
                            "1px solid rgba(239,68,68,.25)",
                          background:
                            "rgba(239,68,68,.08)",
                          color: "#ef4444",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}