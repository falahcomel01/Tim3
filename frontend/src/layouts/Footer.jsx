function Footer({ scrollToId }) {
  const handleLinkClick = (e, id) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <footer id="footer" className="footer" style={{ background: '#08090c', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-brand-title">SIBER<span>MERCH</span></h3>
            <p className="footer-brand-desc">
              Divisi Kewirausahaan Resmi Himpunan Mahasiswa Sistem Informasi SIBER. Kami menghadirkan kaos premium berkelas distro yang memadukan identitas keilmuan dan semangat sinergi mahasiswa Sistem Informasi.
            </p>
          </div>

          <div>
            <h4 className="footer-column-title">Pilar SIBER</h4>
            <ul className="footer-links">
              <li className="footer-link">Brain Ethic & Research</li>
              <li className="footer-link">Sistem Informasi Bersinergi</li>
              <li className="footer-link">Sinergi dalam Kode</li>
              <li className="footer-link">Kolaborasi Digital</li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Bantuan & Info</h4>
            <ul className="footer-links">
              <li>
                <a 
                  href="#katalog" 
                  onClick={(e) => handleLinkClick(e, 'katalog')} 
                  className="footer-link"
                >
                  Ukuran & Bahan
                </a>
              </li>
              <li className="footer-link" style={{ cursor: 'default' }}>Grup WA Panitia SIBER</li>
              <li className="footer-link" style={{ cursor: 'default' }}>Kontak Himpunan</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Himpunan Mahasiswa Sistem Informasi SIBER. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
