import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { KeyRound, Trash2, Shield, ChevronDown } from 'lucide-react';
import userService from '../../../services/userService';
import roleService from '../../../services/roleService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

const pwSchema = z.object({
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

const roleSchema = z.object({
  role: z.string().min(1, 'Role wajib dipilih'),
});

const inputSt = (err) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#e2e8f0',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: `1px solid ${err ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
  outline: 'none',
  boxSizing: 'border-box',
});

const labelSt = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: '8px',
};

const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '5px 12px', fontSize: '12px', fontWeight: '500',
  borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.15s',
};
const btnGhost    = { ...btnBase, color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };
const btnOutline  = { ...btnBase, color: '#fbbf24', backgroundColor: 'rgba(245,158,11,0.08)',  border: '1px solid rgba(245,158,11,0.2)' };
const btnDanger   = { ...btnBase, color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)',    border: '1px solid rgba(239,68,68,0.2)' };
const btnPrimary  = { ...btnBase, padding: '9px 20px', fontSize: '13px', fontWeight: '600', color: '#1a1a1a', backgroundColor: '#f59e0b', border: 'none' };
const btnDangerMd = { ...btnBase, padding: '9px 20px', fontSize: '13px', fontWeight: '600', color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' };
const btnGhostMd  = { ...btnBase, padding: '9px 20px', fontSize: '13px', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };

export default function UsersPage() {
  const [users, setUsers]             = useState([]);
  const [roles, setRoles]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pwTarget, setPwTarget]       = useState(null);
  const [roleTarget, setRoleTarget]   = useState(null);
  const [delTarget, setDelTarget]     = useState(null);
  const [pwLoading, setPwLoading]     = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [delLoading, setDelLoading]   = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch {
      toast.error('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const { register: regPw, handleSubmit: handlePw, formState: { errors: pwErrors }, reset: resetPw } = useForm({ resolver: zodResolver(pwSchema) });
  const { register: regRole, handleSubmit: handleRole, formState: { errors: roleErrors }, reset: resetRole } = useForm({ resolver: zodResolver(roleSchema) });

  const onChangePassword = async (data) => {
    setPwLoading(true);
    try {
      await userService.changePassword(pwTarget.id, data.password, data.password_confirmation);
      toast.success(`Password ${pwTarget.name} berhasil diubah`);
      setPwTarget(null); resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally { setPwLoading(false); }
  };

  const onAssignRole = async (data) => {
    setRoleLoading(true);
    try {
      await userService.assignRole(roleTarget.id, data.role);
      toast.success(`Role berhasil di-assign ke ${roleTarget.name}`);
      setRoleTarget(null); resetRole(); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal assign role');
    } finally { setRoleLoading(false); }
  };

  const onDeleteUser = async () => {
    setDelLoading(true);
    try {
      await userService.deleteUser(delTarget.id);
      toast.success(`User ${delTarget.name} berhasil dihapus`);
      setDelTarget(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus user');
    } finally { setDelLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Manajemen User</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{users.length} user terdaftar</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)' }}>
        {users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '14px' }}>Belum ada user</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#','Nama','Email','Role','Bergabung','Aksi'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748b',
                    textAlign: i === 5 ? 'right' : 'left', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span style={{ marginLeft: '6px', fontSize: '11px', color: '#f59e0b' }}>(Anda)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{user.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {user.roles?.length > 0
                        ? user.roles.map((r) => <Badge key={r} color={r === 'admin' ? 'amber' : 'blue'}>{r}</Badge>)
                        : <span style={{ fontSize: '12px', color: '#475569' }}>—</span>
                      }
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button style={btnGhost} onClick={() => { setRoleTarget(user); resetRole(); }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}>
                        <Shield size={12} /> Role
                      </button>
                      <button style={btnOutline} onClick={() => { setPwTarget(user); resetPw(); }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.08)'; }}>
                        <KeyRound size={12} /> Password
                      </button>
                      {user.id !== currentUser.id && (
                        <button style={btnDanger} onClick={() => setDelTarget(user)}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}>
                          <Trash2 size={12} /> Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal: Ganti Password ── */}
      <Modal isOpen={!!pwTarget} onClose={() => { setPwTarget(null); resetPw(); }} title={`Ganti Password — ${pwTarget?.name}`}>
        <div style={{ padding: '4px 2px' }}>
          <form onSubmit={handlePw(onChangePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelSt}>Password Baru</label>
              <input
                {...regPw('password')}
                type="password"
                placeholder="Min. 8 karakter"
                style={inputSt(pwErrors.password)}
                onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                onBlur={(e) => { e.target.style.borderColor = pwErrors.password ? '#ef4444' : 'rgba(255,255,255,0.1)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              />
              {pwErrors.password && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{pwErrors.password.message}</p>}
            </div>

            <div>
              <label style={labelSt}>Konfirmasi Password</label>
              <input
                {...regPw('password_confirmation')}
                type="password"
                placeholder="Ulangi password"
                style={inputSt(pwErrors.password_confirmation)}
                onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                onBlur={(e) => { e.target.style.borderColor = pwErrors.password_confirmation ? '#ef4444' : 'rgba(255,255,255,0.1)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              />
              {pwErrors.password_confirmation && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{pwErrors.password_confirmation.message}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" style={btnGhostMd} onClick={() => { setPwTarget(null); resetPw(); }}>Batal</button>
              <button type="submit" style={btnPrimary} disabled={pwLoading}>
                {pwLoading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── Modal: Assign Role ── */}
      <Modal isOpen={!!roleTarget} onClose={() => { setRoleTarget(null); resetRole(); }} title={`Assign Role — ${roleTarget?.name}`}>
        <div style={{ padding: '4px 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '20px', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Shield size={13} style={{ color: '#64748b', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Role saat ini:&nbsp;
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{roleTarget?.roles?.join(', ') || '—'}</span>
            </span>
          </div>

          <form onSubmit={handleRole(onAssignRole)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelSt}>Pilih Role</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                <select
                  {...regRole('role')}
                  style={{ ...inputSt(roleErrors.role), paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; }}
                  onBlur={(e) => { e.target.style.borderColor = roleErrors.role ? '#ef4444' : 'rgba(255,255,255,0.1)'; }}
                >
                  <option value="" style={{ backgroundColor: '#121318' }}>-- Pilih Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name} style={{ backgroundColor: '#121318' }}>{r.name}</option>
                  ))}
                </select>
              </div>
              {roleErrors.role && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{roleErrors.role.message}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" style={btnGhostMd} onClick={() => { setRoleTarget(null); resetRole(); }}>Batal</button>
              <button type="submit" style={btnPrimary} disabled={roleLoading}>
                {roleLoading ? 'Menyimpan...' : 'Assign Role'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── Modal: Hapus User ── */}
      <Modal isOpen={!!delTarget} onClose={() => setDelTarget(null)} title="Hapus User">
        <div style={{ padding: '4px 2px' }}>
          <div style={{ padding: '14px 16px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#e2e8f0', margin: '0 0 6px' }}>
              Hapus user <span style={{ fontWeight: 600, color: '#ffffff' }}>"{delTarget?.name}"</span>?
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              Semua token user akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button style={btnGhostMd} onClick={() => setDelTarget(null)} disabled={delLoading}>Batal</button>
            <button style={btnDangerMd} onClick={onDeleteUser} disabled={delLoading}>
              {delLoading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}