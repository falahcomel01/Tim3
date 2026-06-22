import kaos2 from '../../assets/kaos2.jpeg';
import kaos3 from '../../assets/kaos3.jpeg';
import kaos4 from '../../assets/kaos4.jpeg';
import banner from '../../assets/banner.jpeg';

const products = [
  {
    id: 1,
    name: "Artikel 1",
    price: 75000,
    stock: 20,
    category: "Kaos",
    description: "Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.",
    image: kaos2,
    badge: "Best Seller",
    rating: 4.8,
    reviews: 28,
    sizes: ["S", "M", "L", "XL", "XXL"],
    specs: [
      "Bahan 100% Premium Cotton Combed 24s",
      "Sablon Plastisol Premium Halus",
      "Potongan Oversized Mewah & Unisex",
    ],
  },
  {
    id: 2,
    name: "Artikel 2",
    price: 75000,
    stock: 15,
    category: "Kaos",
    description: "Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.",
    image: kaos3,
    badge: "Best Seller",
    rating: 4.9,
    reviews: 34,
    sizes: ["S", "M", "L", "XL", "XXL"],
    specs: [
      "Bahan 100% Premium Cotton Combed 24s",
      "Sablon Plastisol Premium Halus",
      "Potongan Oversized Mewah & Unisex",
    ],
  },
  {
    id: 3,
    name: "Artikel 3",
    price: 75000,
    stock: 12,
    category: "Kaos",
    description: "Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.",
    image: kaos4,
    badge: null,
    rating: 4.7,
    reviews: 19,
    sizes: ["S", "M", "L", "XL", "XXL"],
    specs: [
      "Bahan 100% Premium Cotton Combed 24s",
      "Sablon Plastisol Premium Halus",
      "Potongan Oversized Mewah & Unisex",
    ],
  },
   {
    id: 4,
    name: "Artikel 4",
    price: 75000,
    stock: 12,
    category: "Kaos",
    description: "Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.",
    image: banner,
    badge: null,
    rating: 4.9,
    reviews: 21,
    sizes: ["S", "M", "L", "XL", "XXL"],
    specs: [
      "Bahan 100% Premium Cotton Combed 24s",
      "Sablon Plastisol Premium Halus",
      "Potongan Oversized Mewah & Unisex",
    ],
  },
];

export default products;