import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../../components/product/ProductCard";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { storageUrl } from "../../services/config";

export default function ProductListPage() {
  const [products, setProducts]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState(""); // "" = Semua

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories({ per_page: 100 });
      const data = res.data?.data?.data ?? res.data?.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      const rawProducts = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : [];

      const formattedProducts = rawProducts.map((product) => ({
        ...product,
        image:
          product.images?.length > 0
            ? storageUrl(product.images[0].url)
            : null,
        gallery:
          product.images?.map((img) => ({
            ...img,
            fullUrl: storageUrl(img.url),
          })) || [],
        sizes: [
          ...new Set(
            (product.variants || []).map((variant) =>
              variant.name.split(" - ")[0]
            )
          ),
        ],
        specs: product.variants?.map((variant) => variant.name) || [],
        category: product.categories?.[0]?.name || "Produk",
        rating: 5,
        reviews: 0,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      activeCategory === "" ||
      (product.categories || []).some(
        (c) => String(c.id) === String(activeCategory)
      );

    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        justifyContent: "center", alignItems: "center",
        background: "#08090c", color: "#ffffff",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08090c", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
            Semua Produk
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            {filteredProducts.length} produk tersedia
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
            <Search
              size={15}
              style={{
                position: "absolute", left: "12px",
                top: "50%", transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                background: "#121318",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                color: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Dropdown kategori + tombol reset */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              style={{
                padding: "10px 14px",
                background: "#121318",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                color: activeCategory === "" ? "#64748b" : "#f59e0b",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
                minWidth: "180px",
              }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            {activeCategory !== "" && (
              <button
                onClick={() => setActiveCategory("")}
                style={{
                  padding: "10px 12px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px",
                  color: "#ef4444",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ✕ Reset
              </button>
            )}
          </div>
        </div>

        {/* Grid produk */}
        {filteredProducts.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#64748b", padding: "100px 0" }}>
            Tidak ada produk yang ditemukan.
          </div>
        )}

      </div>
    </div>
  );
}