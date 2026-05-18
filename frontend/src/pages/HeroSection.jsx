import { ShoppingBag, Sparkles } from 'lucide-react';
import bannerImg from '../assets/banner1.jpeg';

function HeroSection({ scrollToId }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-tag-badge">
          <Sparkles size={13} /> Official SIBERMERCH Online Store
        </div>
        
        <h1 className="hero-title">
          SIBER <span>MERCH</span>
        </h1>
        
        <p className="hero-subtitle">
          Pilihan merchandise resmi Mahasiswa Sistem Informasi . Di realisasikan oleh Divisi Kewirausahaan <span className="siber-bold">SIBERMERCH 2025</span>
        </p>

        <div className="hero-buttons">
          <button 
            onClick={() => scrollToId('katalog')} 
            className="btn btn-primary"
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            <ShoppingBag size={16} /> Lihat Koleksi Kaos
          </button>
        </div>

        {/* Centered Banner Showcase */}
        <div className="hero-banner-wrapper">
          <img 
            src={bannerImg} 
            alt="Himpunan Mahasiswa Sistem Informasi SIBER" 
            className="hero-banner-img" 
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
