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
const VariantBuilder = ({ variants, onChange, initialVariants, totalStock }) => {
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
    if (field === 'stock') {
      const newVal = Number(value) || 0;
      // Hitung total stok variant lain (selain index ini)
      const otherTotal = variants.reduce((sum, v, i) => {
        return i !== index ? sum + (Number(v.stock) || 0) : sum;
      }, 0);
      // Blok jika total akan melebihi stok keseluruhan
      const maxStock = Number(totalStock) || 0;
      if (maxStock > 0 && otherTotal + newVal > maxStock) return;
    }
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index) => onChange(variants.filter((_, i) => i !== index));

  // Hitung total stok yang sudah terpakai di variant
  const usedStock   = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const maxStock    = Number(totalStock) || 0;
  const sisaStock   = maxStock > 0 ? maxStock - usedStock : null;
  const isOverLimit = maxStock > 0 && usedStock > maxStock;

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
        <TagInput label="Ukuran"        tags={sizes}   onChange={setSizes}   />
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
        <>
          {/* Info sisa stok */}
          {maxStock > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '10px',
              background: isOverLimit
                ? 'rgba(239,68,68,0.08)'
                : sisaStock === 0
                ? 'rgba(251,191,36,0.08)'
                : 'rgba(16,185,129,0.08)',
              border: `1px solid ${isOverLimit
                ? 'rgba(239,68,68,0.25)'
                : sisaStock === 0
                ? 'rgba(251,191,36,0.25)'
                : 'rgba(16,185,129,0.25)'}`,
            }}>
              <span style={{
                fontSize: '13px',
                color: isOverLimit ? '#ef4444' : sisaStock === 0 ? '#fbbf24' : '#10b981',
                fontWeight: 500,
              }}>
                {isOverLimit
                  ? `⚠️ Melebihi stok! Total variant: ${usedStock} dari ${maxStock}`
                  : sisaStock === 0
                  ? `✓ Stok terdistribusi penuh (${usedStock}/${maxStock})`
                  : `Sisa stok belum terdistribusi: ${sisaStock} dari ${maxStock}`}
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: isOverLimit ? '#ef4444' : '#94a3b8',
              }}>
                {usedStock} / {maxStock}
              </span>
            </div>
          )}

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

            {variants.map((v, i) => {
              // Hitung stok maksimal yang bisa diisi untuk variant ini
              const otherTotal = variants.reduce((sum, vv, ii) => {
                return ii !== i ? sum + (Number(vv.stock) || 0) : sum;
              }, 0);
              const maxForThis = maxStock > 0 ? maxStock - otherTotal : Infinity;
              const isThisOver = Number(v.stock) > maxForThis;

              return (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 100px 40px',
                  gap: '8px',
                  padding: '8px 14px',
                  alignItems: 'center',
                  borderBottom: i < variants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: isThisOver ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}>
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{v.name}</span>
                  <input
                    type="number" placeholder="0" value={v.price} min="0"
                    style={{ ...inputStyle, padding: '6px 10px', textAlign: 'right' }}
                    onChange={e => updateVariant(i, 'price', e.target.value)}
                  />
                  <input
                    type="number" placeholder="0" value={v.stock} min="0"
                    // max dibatasi agar tidak bisa diketik melebihi sisa stok
                    max={maxStock > 0 ? maxForThis : undefined}
                    style={{
                      ...inputStyle,
                      padding: '6px 10px',
                      textAlign: 'right',
                      borderColor: isThisOver ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)',
                    }}
                    onChange={e => updateVariant(i, 'stock', e.target.value)}
                  />
                  <button type="button" onClick={() => removeVariant(i)}
                    style={{
                      background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '6px', color: '#ef4444', cursor: 'pointer',
                      padding: '6px', fontSize: '14px', lineHeight: 1,
                    }}>✕</button>
                </div>
              );
            })}

            {/* Baris total */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 100px 40px',
              gap: '8px',
              padding: '10px 14px',
              background: isOverLimit
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(245,158,11,0.05)',
              borderTop: `1px solid ${isOverLimit ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)'}`,
            }}>
              <span style={{ fontSize: '12px', color: isOverLimit ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                Total stok variant
              </span>
              <span />
              <span style={{
                fontSize: '13px',
                color: isOverLimit ? '#ef4444' : '#f59e0b',
                fontWeight: 700,
                textAlign: 'right',
              }}>
                {usedStock}{maxStock > 0 ? ` / ${maxStock}` : ''}
              </span>
              <span />
            </div>
          </div>
        </>
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
// ProductForm
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

    // Validasi: total stok variant tidak boleh melebihi stok keseluruhan
    if (form.variants.length > 0) {
      const usedStock = form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      const maxStock  = Number(form.stock) || 0;
      if (usedStock > maxStock) {
        alert(`Total stok variant (${usedStock}) melebihi stok keseluruhan (${maxStock}). Harap sesuaikan stok variant.`);
        return;
      }
    }

    const fd = new FormData();

    if (product?.id) fd.append('id', product.id);

    fd.append('name',        form.name);
    fd.append('description', form.description || '');
    fd.append('price',       Number(form.price));
    fd.append('stock',       Number(form.stock));
    fd.append('status_id',   Number(form.status_id));

    if (form.categories.length > 0) {
      form.categories.forEach(id => fd.append('categories[]', id));
    } else {
      fd.append('categories[]', '');
    }

    form.images.forEach(file => fd.append('images[]', file));
    existingImages.forEach(img => {
      const id = img?.id ?? img;
      if (id) fd.append('existing_image_ids[]', id);
    });

    form.variants.forEach((v, index) => {
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
          <Field label="Stok Keseluruhan">
            <input
              type="number" placeholder="Contoh: 110" value={form.stock} required min="0"
              style={inputStyle} onFocus={focus} onBlur={blur}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
            />
            {form.variants.length > 0 && (
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                Stok ini jadi batas maksimal distribusi ke semua variant di bawah.
              </p>
            )}
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

        {/* Variants — kirim totalStock agar variant tahu batas maksimalnya */}
        <VariantBuilder
          variants={form.variants}
          onChange={variants => setForm(p => ({ ...p, variants }))}
          initialVariants={product?.variants ?? []}
          totalStock={form.stock}
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