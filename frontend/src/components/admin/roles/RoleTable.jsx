import { Pencil, Trash2 } from 'lucide-react';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';

export default function RoleTable({ roles, onEdit, onDelete }) {
  if (roles.length === 0) {
    return (
      <EmptyState
        title="Belum ada role"
        description="Klik 'Tambah Role' untuk membuat role pertama."
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
            <th style={thStyle}>Nama Role</th>
            <th style={thStyle}>Permissions</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, idx) => (
            <tr
              key={role.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <td style={tdStyle}>
                <span style={{ color: '#475569', fontSize: '12px' }}>{idx + 1}</span>
              </td>
              <td style={tdStyle}>
                <Badge color="amber">{role.name}</Badge>
              </td>
              <td style={{ ...tdStyle, maxWidth: '480px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {role.permissions?.length > 0
                    ? role.permissions.map((p) => <Badge key={p} color="slate">{p}</Badge>)
                    : <span style={{ fontSize: '12px', color: '#334155' }}>—</span>
                  }
                </div>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => onEdit(role)}
                    style={editBtnStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(role)}
                    style={deleteBtnStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                  >
                    <Trash2 size={12} />
                    Hapus
                  </button>
                </div>
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

const editBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 12px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#e2e8f0',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
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