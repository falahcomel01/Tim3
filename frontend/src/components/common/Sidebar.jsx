import { NavLink } from 'react-router-dom';
import { LayoutDashboard,Shirt ,  User, Shield, Key, Users, X, StretchHorizontal, } from 'lucide-react';

const menuItems = [
  { label: 'Dashboard',              icon: LayoutDashboard,  to: '/admin/dashboard' },
  { label: 'Manage Product',         icon: Shirt,            to: '/admin/product' },
  { label: 'Manage Categories ',     icon: StretchHorizontal,to: '/admin/categories' },
  { label: 'Profile',                icon: User,             to: '/admin/profile' },
  { label: 'Roles',                  icon: Shield,           to: '/admin/roles' },
  { label: 'Permissions',            icon: Key,              to: '/admin/permissions' },
  { label: 'Users',                  icon: Users,            to: '/admin/users' },
];

export default function Sidebar({ isOpen, onClose, isDesktop }) {
  const visible = isDesktop || isOpen;

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
        height: '100%',
        width: '256px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0b0f',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        paddingTop: isDesktop ? '64px' : '0',
      }}>
        {/* Mobile header */}
        {!isDesktop && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Menu</span>
            <button
              onClick={onClose}
              style={{
                padding: '6px', borderRadius: '8px', background: 'none',
                border: 'none', cursor: 'pointer', color: '#94a3b8',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {menuItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (!isDesktop) onClose(); }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '4px',
                textDecoration: 'none',
                transition: 'all 0.15s',
                backgroundColor: isActive ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: isActive ? '#f59e0b' : '#94a3b8',
                border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} style={{ color: isActive ? '#f59e0b' : '#64748b', flexShrink: 0 }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          fontSize: '11px',
          color: '#334155',
        }}>
          SIBER Admin Panel v1.0
        </div>
      </aside>
    </>
  );
}
