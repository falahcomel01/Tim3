import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Calendar, Shield, Key } from 'lucide-react';
import authService from '../../../services/authService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Badge from '../../../components/common/Badge';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getProfile()
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Gagal memuat profil'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '672px' }}>
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Profil Saya</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Informasi akun Anda</p>
      </div>

      {profile && (
        <div
          style={{
            backgroundColor: '#121318',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Avatar header */}
          <div
            className="flex items-center gap-4"
            style={{
              padding: '24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'rgba(245,158,11,0.15)',
                border: '1.5px solid rgba(245,158,11,0.4)',
              }}
            >
              <span className="text-xl font-bold" style={{ color: '#fbbf24' }}>
                {profile.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#ffffff', marginBottom: '2px' }}>
                {profile.name}
              </h2>
              <p className="text-sm" style={{ color: '#64748b', marginBottom: '8px' }}>
                {profile.email}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.roles?.map((r) => <Badge key={r} color="amber">{r}</Badge>)}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <InfoRow icon={User}     label="Nama"      value={profile.name} />
            <InfoRow icon={Mail}     label="Email"     value={profile.email} />
            <InfoRow
              icon={Calendar}
              label="Bergabung"
              value={new Date(profile.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            />

            {/* Roles */}
            <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-3">
                <Shield size={15} className="flex-shrink-0" style={{ color: '#64748b', marginTop: '1px' }} />
                <div>
                  <p className="text-xs" style={{ color: '#64748b', marginBottom: '8px' }}>Roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.roles?.length > 0
                      ? profile.roles.map((r) => <Badge key={r} color="amber">{r}</Badge>)
                      : <span className="text-xs" style={{ color: '#334155' }}>Tidak ada role</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-3">
                <Key size={15} className="flex-shrink-0" style={{ color: '#64748b', marginTop: '1px' }} />
                <div>
                  <p className="text-xs" style={{ color: '#64748b', marginBottom: '8px' }}>Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.permissions?.length > 0
                      ? profile.permissions.map((p) => <Badge key={p} color="blue">{p}</Badge>)
                      : <span className="text-xs" style={{ color: '#334155' }}>Tidak ada permission</span>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="flex-shrink-0" style={{ color: '#64748b' }} />
      <span className="text-xs" style={{ color: '#64748b', minWidth: '90px' }}>{label}</span>
      <span className="text-sm" style={{ color: '#e2e8f0', marginLeft: 'auto' }}>{value}</span>
    </div>
  );
}