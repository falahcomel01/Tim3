export default function CategoryDeleteModal({
  category,
  onConfirm,
  onCancel,
}) {
  if (!category) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#121318",
          padding: 24,
          borderRadius: 12,
          minWidth: 350,
          color: "#fff",
        }}
      >
        <h3>Hapus Kategori</h3>

        <p>
          Yakin ingin menghapus kategori:
        </p>

        <strong>{category.name}</strong>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}