import { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ChevronDown, User, LogOut, ShoppingCart, Package, Home as HomeIcon, Menu, X, Headphones } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../../services/authService';
import ComingSoonModal from '../../components/common/ComingSoonModal';

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px', fontSize: '13px',
        color: danger ? '#f87171' : '#cbd5e1',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)';
        e.currentTarget.style.color = danger ? '#fca5a5' : '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = danger ? '#f87171' : '#cbd5e1';
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(null); // nama fitur yang coming soon
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) {}
    localStorage.clear();
    toast.success('Logout berhasil');
    navigate('/login');
  };


  const navItems = [
    { label: 'Home',         icon: HomeIcon,     to: '/customer',  comingSoon: false },
    { label: 'Bantuan',      icon: Headphones,   to: '/customer-service', comingSoon: false },
    { label: 'Produk',       icon: Package,      to: '/products',  comingSoon: false },
    { label: 'Pesanan Saya', icon: Package,      to: null,         comingSoon: 'Pesanan Saya' },
    { label: 'Keranjang',    icon: ShoppingCart, to: null,         comingSoon: 'Keranjang' },
  ];

  const handleNavClick = (item, e) => {
    if (item.comingSoon) {
      e.preventDefault();
      setMobileOpen(false);
      setComingSoon(item.comingSoon);
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,9,12,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0',
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: '64px',
        }}>

          {/* Logo */}
          <NavLink to="/customer" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', color: '#ffffff', flexShrink: 0,
          }}>
            <div style={{
              background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="#f59e0b" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.5px' }}>Siber Merch</span>
          </NavLink>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <ul style={{ display: 'flex', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }}>
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.comingSoon ? (
                    <button
                      onClick={() => setComingSoon(item.comingSoon)}
                      style={{
                        fontSize: '14px', fontWeight: 500, color: '#94a3b8',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, letterSpacing: '0.3px',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <NavLink
                      to={item.to}
                      end
                      style={({ isActive }) => ({
                        fontSize: '14px', fontWeight: 500,
                        color: isActive ? '#f59e0b' : '#94a3b8',
                        textDecoration: 'none', letterSpacing: '0.3px',
                        transition: 'color 0.15s',
                      })}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  padding: '8px', borderRadius: '8px', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#94a3b8',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* User dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', borderRadius: '8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'rgba(245,158,11,0.2)',
                  border: '1px solid rgba(245,158,11,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                {!isMobile && (
                  <span style={{
                    fontSize: '13px', fontWeight: 600, color: '#ffffff',
                    maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user?.name || 'User'}
                  </span>
                )}
                <ChevronDown size={14} style={{ color: '#64748b' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '220px', borderRadius: '12px',
                  backgroundColor: '#121318',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  {/* User info */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{user?.name}</p>
                    <p style={{
                      fontSize: '11px', color: '#64748b', marginTop: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{user?.email}</p>
                  </div>

                  <DropdownItem
                    icon={User}
                    label="Ubah Profil"
                    onClick={() => { setDropdownOpen(false); setComingSoon('Ubah Profil'); }}
                  />

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <DropdownItem
                      icon={LogOut}
                      label="Logout"
                      danger
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && mobileOpen && (
          <div style={{
            padding: '8px 16px 16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {navItems.map((item) => (
              item.comingSoon ? (
                <button
                  key={item.label}
                  onClick={() => { setMobileOpen(false); setComingSoon(item.comingSoon); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500,
                    color: '#94a3b8', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? '#f59e0b' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                  })}
                >
                  <item.icon size={16} /> {item.label}
                </NavLink>
              )
            ))}
          </div>
        )}
      </nav>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={!!comingSoon}
        onClose={() => setComingSoon(null)}
        feature={comingSoon}
      />
    </>
  );
}
