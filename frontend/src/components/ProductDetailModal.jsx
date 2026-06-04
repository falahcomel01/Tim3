import { useState } from "react";
import {
  X,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
}

export default function ProductDetailModal({
  product,
  onClose,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState(product?.variants?.[0] || null);

  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];

  const imageUrl = (url) => {
    if (!url)
      return "https://via.placeholder.com/500x500?text=No+Image";

    return `http://localhost:8000${url}`;
  };

  const nextImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.price;

  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#121318",
          borderRadius: "20px",
          overflow: "hidden",
          border:
            "1px solid rgba(255,255,255,.08)",
          display: "flex",
          position: "relative",
        }}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,.08)",
            color: "#fff",
            cursor: "pointer",
            zIndex: 99,
          }}
        >
          <X size={18} />
        </button>

        {/* IMAGE SECTION */}
        <div
          style={{
            width: "45%",
            background: "#0f172a",
            position: "relative",
          }}
        >
          <img
            src={
              images.length
                ? imageUrl(
                    images[activeImage]?.url
                  )
                : "https://via.placeholder.com/500"
            }
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    "rgba(0,0,0,.5)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={nextImage}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    "rgba(0,0,0,.5)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* THUMBNAILS */}
          {images.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                display: "flex",
                gap: 8,
                overflowX: "auto",
              }}
            >
              {images.map((img, index) => (
                <img
                  key={img.id}
                  src={imageUrl(img.url)}
                  alt=""
                  onClick={() =>
                    setActiveImage(index)
                  }
                  style={{
                    width: 65,
                    height: 65,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border:
                      activeImage === index
                        ? "2px solid #f59e0b"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div
          style={{
            flex: 1,
            padding: "32px",
            overflowY: "auto",
            maxHeight: "90vh",
          }}
        >
          <h2
            style={{
              color: "#fff",
              marginBottom: 12,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {product.name}
          </h2>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f59e0b",
              marginBottom: 12,
            }}
          >
            {formatRupiah(currentPrice)}
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 16,
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                fill="#f59e0b"
                color="#f59e0b"
              />
            ))}
          </div>

          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            {product.description}
          </p>

          {/* VARIANT */}
          {variants.length > 0 && (
            <>
              <h4
                style={{
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Pilih Varian
              </h4>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(
                        variant
                      )
                    }
                    style={{
                      padding:
                        "10px 14px",
                      borderRadius: 10,
                      border:
                        selectedVariant?.id ===
                        variant.id
                          ? "1px solid #f59e0b"
                          : "1px solid rgba(255,255,255,.1)",
                      background:
                        selectedVariant?.id ===
                        variant.id
                          ? "rgba(245,158,11,.15)"
                          : "#1e1f24",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      {variant.name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#f59e0b",
                      }}
                    >
                      {formatRupiah(
                        variant.price
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <span
              style={{
                padding:
                  "6px 12px",
                borderRadius: 20,
                background:
                  currentStock > 0
                    ? "rgba(74,222,128,.1)"
                    : "rgba(239,68,68,.1)",
                color:
                  currentStock > 0
                    ? "#4ade80"
                    : "#ef4444",
                fontWeight: 600,
              }}
            >
              Stok : {currentStock}
            </span>
          </div>

          <button
            disabled={currentStock <= 0}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background:
                currentStock > 0
                  ? "#f59e0b"
                  : "#334155",
              color:
                currentStock > 0
                  ? "#000"
                  : "#94a3b8",
              fontWeight: 700,
              cursor:
                currentStock > 0
                  ? "pointer"
                  : "not-allowed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShoppingCart size={16} />
            {currentStock > 0
              ? "Tambah ke Keranjang"
              : "Stok Habis"}
          </button>
        </div>
      </div>
    </div>
  );
}