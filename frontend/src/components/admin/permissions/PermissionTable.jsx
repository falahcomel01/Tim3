import { Trash2 } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export default function PermissionTable({ permissions, onDelete }) {
  if (permissions.length === 0) {
    return (
      <EmptyState
        title="Belum ada permission"
        description="Klik 'Tambah Permission' untuk membuat permission pertama."
      />
    );
  }
 
  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: '10px',
        backgroundColor: '#121318',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Nama Permission</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm, idx) => (
            <tr
              key={perm.id ?? perm}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <td style={tdStyle}>
                <span style={{ color: '#475569', fontSize: '12px' }}>{idx + 1}</span>
              </td>
              <td style={tdStyle}>
                <Badge color="blue">{perm.name ?? perm}</Badge>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <button
                  onClick={() => onDelete(perm)}
                  style={deleteBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                >
                  <Trash2 size={12} />
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
const thStyle = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: '500',
  color: '#64748b',
  whiteSpace: 'nowrap',
};
 
const tdStyle = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
 
const deleteBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 12px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#f87171',
  backgroundColor: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.2)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
};
