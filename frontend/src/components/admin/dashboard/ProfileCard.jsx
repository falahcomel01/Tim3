import Badge from '../../common/Badge';

export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: '#121318',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
          }}
        >
          <span className="text-lg font-bold" style={{ color: '#fbbf24' }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold" style={{ color: '#ffffff' }}>{user.name}</p>
          <p className="text-xs" style={{ color: '#64748b' }}>{user.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>Roles</p>
          <div className="flex flex-wrap gap-1.5">
            {user.roles?.length > 0
              ? user.roles.map((r) => <Badge key={r} color="amber">{r}</Badge>)
              : <span className="text-xs" style={{ color: '#334155' }}>Tidak ada role</span>
            }
          </div>
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>Permissions</p>
          <div className="flex flex-wrap gap-1.5">
            {user.permissions?.length > 0
              ? user.permissions.map((p) => <Badge key={p} color="blue">{p}</Badge>)
              : <span className="text-xs" style={{ color: '#334155' }}>Tidak ada permission</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
