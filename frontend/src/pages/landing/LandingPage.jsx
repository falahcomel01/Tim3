import { useState } from 'react';
import '../../styles/landing.css';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import HeroSection from '../HeroSection';
import AboutSection from '../AboutSection';
import ProductSection from '../ProductSection';
import ProductDetailModal from '../../components/ProductDetailModal';


export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeQuickView, setActiveQuickView] = useState(null);

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar scrollToId={scrollToId} />
      <HeroSection scrollToId={scrollToId} />
      <AboutSection />
      <Footer scrollToId={scrollToId} />
      {activeQuickView && (
        <ProductDetailModal
          product={activeQuickView}
          onClose={() => setActiveQuickView(null)}
        />
      )}
    </>
  );
}
