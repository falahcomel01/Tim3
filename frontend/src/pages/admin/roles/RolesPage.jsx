import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roleService from '../../../services/roleService';
import permissionService from '../../../services/permissionService';
import RoleTable from '../../../components/admin/roles/RoleTable';
import RoleForm from '../../../components/admin/roles/RoleForm';
import RoleDeleteModal from '../../../components/admin/roles/RoleDeleteModal';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getRoles(),
        permissionService.getPermissions(),
      ]);
      setRoles(rolesRes.data || []);
      setAllPermissions((permsRes.data || []).map((p) => p.name ?? p));
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => { setEditTarget(null); setFormModal(true); };
  const handleOpenEdit   = (role) => { setEditTarget(role); setFormModal(true); };
  const handleCloseForm  = () => { setFormModal(false); setEditTarget(null); };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editTarget) {
        await roleService.updateRole(editTarget.id, data);
        toast.success('Role berhasil diupdate');
      } else {
        await roleService.createRole(data);
        toast.success('Role berhasil dibuat');
      }
      handleCloseForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan role');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await roleService.deleteRole(deleteTarget.id);
      toast.success('Role berhasil dihapus');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus role');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Manajemen Role</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{roles.length} role terdaftar</p>
        </div>

        {/* Tombol Tambah Role */}
        <button
          onClick={handleOpenCreate}
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
        >
          <Plus size={14} />
          Tambah Role
        </button>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <RoleTable roles={roles} onEdit={handleOpenEdit} onDelete={setDeleteTarget} />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formModal}
        onClose={handleCloseForm}
        title={editTarget ? 'Edit Role' : 'Tambah Role'}
        maxWidth="max-w-xl"
      >
        <RoleForm
          onSubmit={handleSubmit}
          loading={formLoading}
          defaultValues={editTarget}
          allPermissions={allPermissions}
        />
      </Modal>

      {/* Delete Modal */}
      <RoleDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        role={deleteTarget}
        loading={deleteLoading}
      />
    </div>
  );
}