// CategoryForm.jsx
import { useState, useEffect } from "react";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "#0a0b0f",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const empty = { name: "", slug: "", description: "", status_id: 1 };

const generateSlug = (value) =>
  value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

export default function CategoryForm({ category, onSubmit, existingCategories = [] }) {
  const [form, setForm]         = useState(empty);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (category) {
      setForm({
        name:        category.name        || "",
        slug:        category.slug        || "",
        description: category.description || "",
        status_id:   category.status_id   || 1,
      });
    } else {
      setForm(empty);
    }
    setNameError("");
  }, [category]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));

    // Cek duplikat — abaikan kategori yang sedang diedit
    const duplicate = existingCategories.some(
      (c) =>
        c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        c.id !== category?.id
    );
    setNameError(duplicate ? `Kategori "${name}" sudah ada.` : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameError) return;

    onSubmit({
      name:        form.name,
      slug:        form.slug,
      description: form.description,
      status_id:   Number(form.status_id),
    });

    if (!category) setForm(empty);
  };

  return (
    <div style={{
      background: "#111215",
      border: "1px solid rgba(212,175,55,.15)",
      borderRadius: "10px",
      padding: "28px",
      marginBottom: "24px",
    }}>

      <form onSubmit={handleSubmit}>
        {/* Grid 2 kolom: Nama + Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "16px", marginBottom: "16px" }}>

          {/* Nama Kategori */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
              Nama Kategori <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: T-Shirt"
              value={form.name}
              style={{
                ...inputStyle,
                border: nameError
                  ? "1px solid rgba(239,68,68,.5)"
                  : "1px solid rgba(212,175,55,0.15)",
              }}
              onChange={handleNameChange}
            />
            {nameError && (
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444" }}>
                ⚠ {nameError}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={form.status_id}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, status_id: Number(e.target.value) })}
            >
              <option value={1}>Aktif</option>
              <option value={2}>Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Deskripsi */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
            Deskripsi <span style={{ color: "#475569", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Deskripsi singkat kategori ini..."
            value={form.description}
            style={{ ...inputStyle, resize: "vertical" }}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={!!nameError || !form.name.trim()}
            style={{
              padding: "10px 22px",
              background: nameError || !form.name.trim()
                ? "rgba(212,175,55,.25)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: nameError || !form.name.trim() ? "#64748b" : "#1a0f00",
              border: "none",
              borderRadius: "8px",
              cursor: nameError || !form.name.trim() ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.01em",
            }}
          >
            {category ? "Update Kategori" : "Simpan Kategori"}
          </button>

          <button
            type="button"
            onClick={() => onSubmit(null)}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "#64748b",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}