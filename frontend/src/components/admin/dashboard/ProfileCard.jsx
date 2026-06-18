export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        background: '#fff',
      }}
    >
      <h3>Profil Pengguna</h3>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '10px',
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Nama</td>
            <td style={{ padding: '8px' }}>{user.name}</td>
          </tr>

          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Email</td>
            <td style={{ padding: '8px' }}>{user.email}</td>
          </tr>

          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Roles</td>
            <td style={{ padding: '8px' }}>
              {user.roles?.length > 0
                ? user.roles.join(', ')
                : 'Tidak ada role'}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Permissions</td>
            <td style={{ padding: '8px' }}>
              {user.permissions?.length > 0
                ? user.permissions.join(', ')
                : 'Tidak ada permission'}
            </td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ marginTop: '20px' }}>Data Mentah Backend</h4>
      <pre
        style={{
          padding: '10px',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}