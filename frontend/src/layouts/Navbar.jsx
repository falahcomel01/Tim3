function Navbar({ scrollToId }) {
  return (
    <nav className="navbar" style={{ background: '#08090c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo Left with Custom SVG & Requested CSS classes */}
        <a 
          href="#" 
          className="nav-logo" 
          onClick={(e) => { 
            e.preventDefault(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}
        >
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-black" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="var(--primary)" 
              strokeWidth="2.5"
              style={{ width: '20px', height: '20px' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" 
              />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Siber Merch</span>
        </a>

        {/* Navigation Menu Links */}
        <ul className="nav-menu" style={{ display: 'flex', gap: '24px', listStyle: 'none' }}>
          <li>
            <a 
              href="#" 
              className="nav-link active"
              onClick={(e) => { 
                e.preventDefault(); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#katalog" 
              onClick={(e) => { e.preventDefault(); scrollToId('katalog'); }} 
              className="nav-link"
            >
              Koleksi Kaos
            </a>
          </li>
          <li>
            <a 
              href="#footer" 
              onClick={(e) => { e.preventDefault(); scrollToId('footer'); }} 
              className="nav-link"
            >
              Tentang SIBER
            </a>
          </li>
        </ul>

        {/* Call to Action Button on Right (Balanced navbar) */}
        <div className="nav-actions">
          <button 
            onClick={() => scrollToId('katalog')} 
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', fontWeight: '600' }}
          >
            Pesan Sekarang
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
