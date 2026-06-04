import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../../components/product/ProductCard";
import { getProducts } from "../../services/productService";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      const rawProducts = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : [];

      const formattedProducts = rawProducts.map((product) => ({
        ...product,

        // gambar utama
        image:
          product.images?.length > 0
            ? `http://localhost:8000${product.images[0].url}`
            : null,

        // semua gambar
        gallery:
          product.images?.map((img) => ({
            ...img,
            fullUrl: `http://localhost:8000${img.url}`,
          })) || [],

        // ukuran dari variant
        sizes: [
          ...new Set(
            (product.variants || []).map((variant) =>
              variant.name.split(" - ")[0]
            )
          ),
        ],

        // spesifikasi / variant
        specs:
          product.variants?.map((variant) => variant.name) || [],

        category:
          product.categories?.[0]?.name || "Produk",

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

  const categories = [
    "Semua",
    ...new Set(
      products.flatMap((product) =>
        (product.categories || []).map((category) => category.name)
      )
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      activeCategory === "Semua" ||
      (product.categories || []).some(
        (category) => category.name === activeCategory
      );

    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#08090c",
          color: "#ffffff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08090c",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "28px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            Semua Produk
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            {filteredProducts.length} produk tersedia
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: "250px",
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
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
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor:
                    activeCategory === category
                      ? "#f59e0b"
                      : "rgba(255,255,255,0.1)",
                  background:
                    activeCategory === category
                      ? "rgba(245,158,11,0.15)"
                      : "transparent",
                  color:
                    activeCategory === category
                      ? "#f59e0b"
                      : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: "100px 0",
            }}
          >
            Tidak ada produk yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}