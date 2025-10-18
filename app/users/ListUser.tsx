'use client';

import React from 'react';
import { useApi } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Save, Trash, X } from 'lucide-react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import useGet from '../hooks/useGet';

type User = {
  id: string;
  username: string;
  email: string;
  client_id?: string;
  default_account_id?: string | null;
};

const ListUser: React.FC = () => {
  const { data: users, loading, error, reload } = useGet<User>('/api/users');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingEmail, setEditingEmail] = React.useState<string>('');
  const [editingPassword, setEditingPassword] = React.useState<string>('');

  // Modal state for delete confirmation (shared pattern with dashboard)
  const [confirmModal, setConfirmModal] = React.useState<null | { id: string; username?: string }>(null);

  const router = useRouter();
  const { request } = useApi();
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (error) {
      setLocalError(error);
      const t = setTimeout(() => setLocalError(null), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditingEmail(u.email ?? '');
    setEditingPassword('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingEmail('');
    setEditingPassword('');
  };

  const saveEdit = async (user: User) => {
    const payload: { email?: string; password?: string } = {};
    if (editingEmail && editingEmail !== user.email) payload.email = editingEmail;
    if (editingPassword) payload.password = editingPassword;
    if (!payload.email && !payload.password) {
      setLocalError('No changes to save');
      setTimeout(() => setLocalError(null), 2000);
      return;
    }
    try {
      const res = await request<{ message?: string }>({ url: `/api/users/${user.id}`, method: 'PUT', data: payload });
      if (res.status >= 200 && res.status < 300) {
        await reload();
        cancelEdit();
      } else {
        setLocalError(res.data?.message ?? 'Failed update user');
        setTimeout(() => setLocalError(null), 2000);
      }
    } catch {
      setLocalError('Request failed');
      setTimeout(() => setLocalError(null), 2000);
    }
  };

  const triggerDelete = (id: string, username?: string) => {
    setConfirmModal({ id, username });
  };

  async function handleModalConfirm() {
    if (!confirmModal) return;
    const id = confirmModal.id;
    try {
      const res = await request<{ message?: string }>({ url: `/api/users/${id}`, method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (res.status >= 200 && res.status < 300) {
        await reload();
      } else {
        setLocalError(res.data?.message ?? 'Failed to delete user');
        setTimeout(() => setLocalError(null), 2000);
      }
    } catch {
      setLocalError('Request failed');
      setTimeout(() => setLocalError(null), 2000);
    } finally {
      setConfirmModal(null);
    }
  }

  function cancelModal() {
    setConfirmModal(null);
  }

  const confirmMessage = confirmModal ? `Are you sure you want to delete user${confirmModal.username ? ` "${confirmModal.username}"` : ''}?` : '';

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex justify-between">
        <CardTitle>Users</CardTitle>
        <Button variant='success' onClick={() => router.push("/users/new")} className='flex items-center gap-1 text-sm' title='Add User'>
          <Plus size={14} />
          User
        </Button>
      </CardHeader>
      <CardContent>
        {localError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{localError}</div>}

        <div className="w-full overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">ID</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Username</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Email</th>
                <th className="px-2 py-1 text-right text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">Loading...</td>
                </tr>
              ) : users && users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2 text-sm text-gray-700">{u.id}</td>
                    <td className="p-2 text-sm text-gray-700">{u.username}</td>
                    <td className="p-2 text-sm text-gray-700">
                      {editingId === u.id ? (
                        <input value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} className="border rounded px-2 py-1" />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="py-3 p-2 text-sm text-gray-800">
                      <div className="flex gap-1 justify-end">
                        {editingId === u.id ? (
                          <>
                            <input type="password" placeholder="New password" value={editingPassword} onChange={(e) => setEditingPassword(e.target.value)} className="border rounded px-2 py-1" />
                            <Button variant='success' onClick={() => saveEdit(u)} title='Save'><Save size={14} /></Button>
                            <Button variant='secondary' onClick={cancelEdit} title='Cancel'><X size={14} /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant='primary' onClick={() => startEdit(u)} title='Update'><Pencil size={14} /></Button>
                            <Button variant='danger' onClick={() => triggerDelete(u.id, u.username)} title='Delete'><Trash size={14} /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">No users found. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfirmModal open={!!confirmModal} onCancel={cancelModal} onConfirm={handleModalConfirm} message={confirmMessage} />
      </CardContent>
    </Card>
  );
};

export default ListUser;