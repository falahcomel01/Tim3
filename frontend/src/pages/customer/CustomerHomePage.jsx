import { useState } from 'react';
import HeroSection from '../HeroSection';
import AboutSection from '../AboutSection';
import ProductSection from '../ProductSection';
import ProductDetailModal from '../../components/ProductDetailModal';

const productsData = [
  { id: 1, name: 'Artikel 1', price: 150000, category: 'Kaos', tag: 'Best Seller',
    description: 'Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.',
    rating: 5, reviews: 15, badgeText: 'HOT ITEM',
    features: ['Bahan 100% Premium Cotton Combed 24s', 'Sablon Plastisol Premium Halus', 'Potongan Oversized Mewah & Unisex'] },
  { id: 2, name: 'Artikel 2', price: 150000, category: 'Kaos', tag: 'Best Seller',
    description: 'Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.',
    rating: 5, reviews: 34, badgeText: 'HOT ITEM',
    features: ['Bahan 100% Premium Cotton Combed 24s', 'Sablon Plastisol Premium Halus', 'Potongan Oversized Mewah & Unisex'] },
  { id: 3, name: 'Artikel 3', price: 150000, category: 'Kaos', tag: 'Best Seller',
    description: 'Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.',
    rating: 5, reviews: 4, badgeText: 'HOT ITEM',
    features: ['Bahan 100% Premium Cotton Combed 24s', 'Sablon Plastisol Premium Halus', 'Potongan Oversized Mewah & Unisex'] },
  { id: 4, name: 'Artikel 4', price: 150000, category: 'Kaos', tag: 'Best Seller',
    description: 'Kaos potongan oversize premium berkelas distro dengan bahan katun tebal lembut khas SIBER.',
    rating: 5, reviews: 21, badgeText: 'HOT ITEM',
    features: ['Bahan 100% Premium Cotton Combed 24s', 'Sablon Plastisol Premium Halus', 'Potongan Oversized Mewah & Unisex'] },
];

export default function CustomerHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeQuickView, setActiveQuickView] = useState(null);

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <HeroSection scrollToId={scrollToId} />
      <AboutSection />
      {activeQuickView && (
        <ProductDetailModal
          product={activeQuickView}
          onClose={() => setActiveQuickView(null)}
        />
      )}
    </>
  );
}
