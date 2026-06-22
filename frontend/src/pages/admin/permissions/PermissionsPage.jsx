import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import permissionService from '../../../services/permissionService';
import PermissionTable from '../../../components/admin/permissions/PermissionTable';
import PermissionForm from '../../../components/admin/permissions/PermissionForm';
import PermissionDeleteModal from '../../../components/admin/permissions/PermissionDeleteModal';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPermissions = async () => {
    try {
      const res = await permissionService.getPermissions();
      setPermissions(res.data || []);
    } catch {
      toast.error('Gagal memuat permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await permissionService.createPermission(data.name);
      toast.success('Permission berhasil dibuat');
      setFormModal(false);
      fetchPermissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat permission');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await permissionService.deletePermission(deleteTarget.id);
      toast.success('Permission berhasil dihapus');
      setDeleteTarget(null);
      fetchPermissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus permission');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Manajemen Permission</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{permissions.length} permission terdaftar</p>
        </div>

        <button
          onClick={() => setFormModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: '#1a1a1a',
            fontWeight: '600',
            fontSize: '13px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d97706'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f59e0b'; }}
        >
          <Plus size={14} />
          Tambah Permission
        </button>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <PermissionTable permissions={permissions} onDelete={setDeleteTarget} />
      )}

      {/* Form Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title="Tambah Permission">
        <PermissionForm onSubmit={handleCreate} loading={formLoading} />
      </Modal>

      {/* Delete Modal */}
      <PermissionDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        permission={deleteTarget}
        loading={deleteLoading}
      />
    </div>
  );
}