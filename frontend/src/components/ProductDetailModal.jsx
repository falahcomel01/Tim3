import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { storageUrl } from "../services/config";

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
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];

  // Ambil ukuran unik dari nama variant (format: "S - Lengan pendek")
  const sizes = [
    ...new Set(
      variants
        .map((v) => v.name?.split(" - ")[0])
        .filter(Boolean)
    ),
  ];

  // Filter tipe berdasarkan ukuran yang dipilih
  const typesForSize = selectedSize
    ? variants.filter((v) =>
        v.name?.startsWith(selectedSize + " - ")
      )
    : [];

  // Cari variant yang cocok dengan kombinasi ukuran + tipe
  const selectedVariant =
    selectedSize && selectedType
      ? variants.find(
          (v) =>
            v.name === `${selectedSize} - ${selectedType}`
        ) || null
      : null;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.price;

  const currentStock = selectedVariant
    ? selectedVariant.stock
    : null; // null = belum pilih variant lengkap

  const imageUrl = (url) => storageUrl(url);

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

  const handleChat = () => {
    onClose();
    navigate('/customer-service', {
      state: {
        subject: `Tanya ${product.name}`,
        message: `Halo admin, saya ingin bertanya tentang ${product.name}${selectedSize ? ` ukuran ${selectedSize}` : ''}.`,
      },
    });
  };

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
          border: "1px solid rgba(255,255,255,.08)",
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
                ? imageUrl(images[activeImage]?.url)
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
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,.5)",
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
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,.5)",
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
                  onClick={() => setActiveImage(index)}
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

          {/* PILIH UKURAN */}
          {variants.length > 0 && (
            <>
              <h4
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Pilih Ukuran Kaos
              </h4>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedType(null); // reset tipe saat ukuran berubah
                    }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      border:
                        selectedSize === size
                          ? "1px solid #f59e0b"
                          : "1px solid rgba(255,255,255,.1)",
                      background:
                        selectedSize === size
                          ? "rgba(245,158,11,.15)"
                          : "#1e1f24",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* PILIH TIPE — muncul setelah ukuran dipilih */}
              {selectedSize && typesForSize.length > 0 && (
                <>
                  <h4
                    style={{
                      color: "#94a3b8",
                      fontSize: 11,
                      letterSpacing: 1,
                      marginBottom: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    Spesifikasi Kaos
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    {typesForSize.map((variant) => {
                      const tipe = variant.name?.split(" - ")[1];
                      const isSelected = selectedType === tipe;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedType(tipe)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: isSelected
                              ? "1px solid #f59e0b"
                              : "1px solid rgba(255,255,255,.1)",
                            background: isSelected
                              ? "rgba(245,158,11,.15)"
                              : "#1e1f24",
                            color: "#fff",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div>{tipe}</div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#f59e0b",
                            }}
                          >
                            {formatRupiah(variant.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* STOK */}
          <div style={{ marginBottom: 24 }}>
            {currentStock === null ? (
              <span
                style={{
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Pilih ukuran dan tipe untuk melihat stok
              </span>
            ) : (
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  background:
                    currentStock > 0
                      ? "rgba(74,222,128,.1)"
                      : "rgba(239,68,68,.1)",
                  color:
                    currentStock > 0 ? "#4ade80" : "#ef4444",
                  fontWeight: 600,
                }}
              >
                Stok: {currentStock}
              </span>
            )}
          </div>

          {/* CHAT ADMIN — hanya untuk user yg sudah login */}
          {isAuthenticated && (
            <button
              onClick={handleChat}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "8px",
                border: "1px solid rgba(245,158,11,0.35)",
                background: "rgba(245,158,11,0.1)",
                color: "#f59e0b",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <MessageCircle size={17} />
              Chat Admin
            </button>
          )}

          {/* TOMBOL KERANJANG */}
          <button
            disabled={!selectedVariant || currentStock <= 0}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background:
                selectedVariant && currentStock > 0
                  ? "#f59e0b"
                  : "#334155",
              color:
                selectedVariant && currentStock > 0
                  ? "#000"
                  : "#94a3b8",
              fontWeight: 700,
              cursor:
                selectedVariant && currentStock > 0
                  ? "pointer"
                  : "not-allowed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShoppingCart size={16} />
            {!selectedVariant
              ? "Pilih Varian Terlebih Dahulu"
              : currentStock > 0
              ? "Tambah ke Keranjang"
              : "Stok Habis"}
          </button>
        </div>
      </div>
    </div>
  );
}
