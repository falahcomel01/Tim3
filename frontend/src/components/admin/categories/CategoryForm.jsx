import { useState, useEffect } from "react";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "#0a0b0f",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const empty = {
  name: "",
  slug: "",
  description: "",
  status_id: 1,
};

export default function CategoryForm({ category, onSubmit }) {
  const [form, setForm] = useState(empty);

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        status_id: category.status_id || 1,
      });
    } else {
      setForm(empty);
    }
  }, [category]);

  const handleNameChange = (e) => {
    const name = e.target.value;

    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      name: form.name,
      slug: form.slug,
      description: form.description,
      status_id: Number(form.status_id),
    });

    if (!category) {
      setForm(empty);
    }
  };

  return (
    <div
      style={{
        background: "#121318",
        border: "1px solid rgba(212,175,55,.2)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 0 20px rgba(212,175,55,.08)",
      }}
    >
      <h2
        style={{
          color: "#D4AF37",
          marginBottom: "24px",
          fontWeight: "700",
        }}
      >
        {category ? "✏️ Edit Kategori" : "➕ Tambah Kategori"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Nama Kategori */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "6px",
            }}
          >
            Nama Kategori
          </label>

          <input
            type="text"
            required
            placeholder="Contoh: T-Shirt"
            value={form.name}
            style={inputStyle}
            onChange={handleNameChange}
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "6px",
            }}
          >
            Slug
          </label>

          <input
            type="text"
            value={form.slug}
            style={inputStyle}
            readOnly
          />
        </div>

        {/* Deskripsi */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "6px",
            }}
          >
            Deskripsi
          </label>

          <textarea
            rows={4}
            placeholder="Deskripsi kategori..."
            value={form.description}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "6px",
            }}
          >
            Status
          </label>

          <select
            value={form.status_id}
            style={inputStyle}
            onChange={(e) =>
              setForm({
                ...form,
                status_id: Number(e.target.value),
              })
            }
          >
            <option value={1}>🟢 Aktif</option>
            <option value={2}>🔴 Nonaktif</option>
          </select>
        </div>

        {/* Preview */}
        <div
          style={{
            background: "#0a0b0f",
            border: "1px solid rgba(212,175,55,.15)",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              color: "#D4AF37",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Preview Kategori
          </div>

          <div
            style={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {form.name || "Nama kategori"}
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            {form.slug || "slug-kategori"}
          </div>

          {form.description && (
            <div
              style={{
                color: "#cbd5e1",
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
              {form.description}
            </div>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          style={{
            background: "#D4AF37",
            color: "#000",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            transition: "0.2s",
          }}
        >
          {category ? "Update Kategori" : "Simpan Kategori"}
        </button>
      </form>
    </div>
  );
}