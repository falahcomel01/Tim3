import { useState, useEffect, useRef } from "react";

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: '#0a0b0f',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: '6px',
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const empty = {
  name: '',
  price: '',
  stock: '',
  description: '',
  status_id: 1,
  categories: [],
  variants: [],
  images: [],
};

const statuses = [
  { id: 1, name: 'Aktif' },
  { id: 2, name: 'Nonaktif' },
  { id: 3, name: 'Habis' },
];

// --- TagInput ---
const TagInput = ({ label, tags, onChange }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px',
            fontSize: '13px', color: '#f59e0b',
          }}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '15px', lineHeight: 1, padding: 0 }}
            >×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          placeholder={`Tambah ${label.toLowerCase()}...`}
          style={{ ...inputStyle, flex: 1 }}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        />
        <button
          type="button"
          onClick={addTag}
          style={{
            padding: '8px 16px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
            color: '#94a3b8', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >+ Tambah</button>
      </div>
    </div>
  );
};

// --- VariantBuilder ---
const VariantBuilder = ({ variants, onChange, initialVariants }) => {
  const parseAttr = (idx) => {
    if (!initialVariants?.length) return null;
    const vals = [...new Set(initialVariants.map(v => v.name?.split(' - ')[idx]).filter(Boolean))];
    return vals.length ? vals : null;
  };

  const [sizes,   setSizes]   = useState(() => parseAttr(0) ?? ['S', 'M', 'L', 'XL', 'XXL']);
  const [sleeves, setSleeves] = useState(() => parseAttr(1) ?? ['Lengan pendek', 'Lengan panjang']);

  const generateVariants = () => {
    const existing = {};
    variants.forEach(v => { existing[v.name] = v; });
    const combos = [];
    sizes.forEach(sz => {
      sleeves.forEach(sl => {
        const name = `${sz} - ${sl}`;
        combos.push(existing[name] || { name, price: '', stock: '', status_id: 1 });
      });
    });
    onChange(combos);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index) => onChange(variants.filter((_, i) => i !== index));

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
        Variant Produk
      </h3>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '12px',
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Definisikan atribut</p>
        <TagInput label="Ukuran"       tags={sizes}   onChange={setSizes}   />
        <TagInput label="Jenis Variasi" tags={sleeves} onChange={setSleeves} />
        <button
          type="button"
          onClick={generateVariants}
          style={{
            padding: '8px 20px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Buat ({sizes.length * sleeves.length} Macam variant)
        </button>
      </div>

      {variants.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 100px 40px',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['Nama variant', 'Harga (Rp)', 'Stok', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#64748b', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {variants.map((v, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 100px 40px',
              gap: '8px',
              padding: '8px 14px',
              alignItems: 'center',
              borderBottom: i < variants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{v.name}</span>
              <input type="number" placeholder="0" value={v.price} min="0"
                style={{ ...inputStyle, padding: '6px 10px', textAlign: 'right' }}
                onChange={e => updateVariant(i, 'price', e.target.value)} />
              <input type="number" placeholder="0" value={v.stock} min="0"
                style={{ ...inputStyle, padding: '6px 10px', textAlign: 'right' }}
                onChange={e => updateVariant(i, 'stock', e.target.value)} />
              <button type="button" onClick={() => removeVariant(i)}
                style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '6px', color: '#ef4444', cursor: 'pointer',
                  padding: '6px', fontSize: '14px', lineHeight: 1,
                }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- ImageUploader ---
const ImageUploader = ({ images, existingImages, onChange, onRemoveExisting }) => {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    onChange([...images, ...files]);
    e.target.value = '';
  };

  const removeNew = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>Foto Produk</label>
      {existingImages?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {existingImages.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img
                src={img.url ?? img.image_url ?? img}
                alt={`existing-${i}`}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button type="button" onClick={() => onRemoveExisting(i)}
                style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#ef4444', border: 'none',
                  color: '#fff', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {images.map((file, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)' }}
              />
              <button type="button" onClick={() => removeNew(i)}
                style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#ef4444', border: 'none',
                  color: '#fff', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      <button type="button" onClick={() => inputRef.current.click()}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
          width: '100%', justifyContent: 'center',
        }}>
        <span style={{ fontSize: '18px' }}>📷</span>
        Pilih foto (bisa lebih dari satu)
      </button>
      <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
        Format: JPG, PNG, WEBP. Foto pertama akan jadi gambar utama.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ProductForm — FIXED: product id + category id
// ─────────────────────────────────────────────────────────────
const ProductForm = ({ product, onSubmit, categories = [] }) => {
  const [form, setForm]                     = useState(empty);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (product) {
      setForm({
        name:        product.name        || '',
        price:       product.price       || '',
        stock:       product.stock       || '',
        description: product.description || '',
        status_id:   product.status_id ?? product.status?.id ?? 1,

        // FIX 1: normalisasi categories — support object {id, name} maupun angka langsung
        categories: Array.isArray(product.categories)
          ? product.categories.map(c => (typeof c === 'object' && c !== null ? c.id : c))
          : [],

        variants: Array.isArray(product.variants) ? product.variants : [],
        images:   [],
      });
      setExistingImages(Array.isArray(product.images) ? product.images : []);
    } else {
      setForm(empty);
      setExistingImages([]);
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();

    // FIX 2: sertakan product id saat mode edit agar backend tahu record mana yang diupdate
    if (product?.id) {
      fd.append('id', product.id);
    }

    fd.append('name',        form.name);
    fd.append('description', form.description || '');
    fd.append('price',       Number(form.price));
    fd.append('stock',       Number(form.stock));
    fd.append('status_id',   Number(form.status_id));

    // FIX 3: kirim semua category id; jika kosong tetap kirim array kosong agar backend bisa clear
    if (form.categories.length > 0) {
      form.categories.forEach(id => fd.append('categories[]', id));
    } else {
      fd.append('categories[]', ''); // sinyal "kosongkan kategori"
    }

    form.images.forEach(file => fd.append('images[]', file));

    // FIX 4: kirim id gambar yang masih dipertahankan (bukan yang dihapus user)
    existingImages.forEach(img => {
      const id = img?.id ?? img;
      if (id) fd.append('existing_image_ids[]', id);
    });

    form.variants.forEach((v, index) => {
      // FIX 5: sertakan id variant jika sudah ada (mode edit), supaya backend bisa update bukan insert baru
      if (v.id) fd.append(`variants[${index}][id]`, v.id);
      fd.append(`variants[${index}][name]`,      v.name);
      fd.append(`variants[${index}][price]`,     Number(v.price));
      fd.append(`variants[${index}][stock]`,     Number(v.stock));
      fd.append(`variants[${index}][status_id]`, Number(v.status_id || 1));
    });

    onSubmit(fd);

    if (!product) {
      setForm(empty);
      setExistingImages([]);
    }
  };

  const focus = (e) => (e.target.style.borderColor = 'rgba(245,158,11,0.5)');
  const blur  = (e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)');

  // Nilai kategori yang sedang dipilih (ambil id pertama, karena single-select)
  const selectedCategoryId = form.categories[0] ?? '';

  return (
    <div style={{
      background: '#121318',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
        {product ? '✏️ Edit Produk' : '➕ Tambah Produk'}
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Nama + Harga */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Field label="Nama Produk">
            <input type="text" placeholder="Masukkan nama produk" value={form.name} required
              style={inputStyle} onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Harga (Rp)">
            <input type="number" placeholder="Contoh: 150000" value={form.price} required min="0"
              style={inputStyle} onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </Field>
        </div>

        {/* Stok + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Field label="Stok yang disediakan">
            <input type="number" placeholder="Jumlah stok" value={form.stock} required min="0"
              style={inputStyle} onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
          </Field>
          <Field label="Status">
            <select value={form.status_id} required style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, status_id: Number(e.target.value) }))}>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>

        {/* Kategori */}
        <div style={{ marginBottom: '12px' }}>
          <Field label="Kategori">
            <select
              value={selectedCategoryId}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focus}
              onBlur={blur}
              onChange={e => setForm(p => ({
                ...p,
                // FIX 6: simpan sebagai Number agar cocok dengan id dari API
                categories: e.target.value ? [Number(e.target.value)] : [],
              }))}
            >
              <option value="">— Pilih kategori —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </Field>
          {categories.length === 0 && (
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>
              Belum ada kategori. Tambah kategori dulu di halaman Manage Kategori.
            </p>
          )}
        </div>

        {/* Deskripsi */}
        <div style={{ marginBottom: '16px' }}>
          <Field label="Deskripsi Produk">
            <textarea placeholder="Tuliskan deskripsi produk..." value={form.description} rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '90px', lineHeight: 1.6 }}
              onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </Field>
        </div>

        {/* Upload Foto */}
        <ImageUploader
          images={form.images}
          existingImages={existingImages}
          onChange={images => setForm(p => ({ ...p, images }))}
          onRemoveExisting={idx => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
        />

        {/* Variants */}
        <VariantBuilder
          variants={form.variants}
          onChange={variants => setForm(p => ({ ...p, variants }))}
          initialVariants={product?.variants ?? []}
        />

        {/* Tombol */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{
            padding: '10px 24px', background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px',
            color: '#f59e0b', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>
            {product ? 'Update Produk' : 'Simpan Produk'}
          </button>
          {product && (
            <button type="button" onClick={() => onSubmit(null)} style={{
              padding: '10px 24px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              color: '#94a3b8', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>
              Batal
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default ProductForm;