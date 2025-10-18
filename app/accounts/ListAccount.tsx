'use client';
import { useApi } from '../hooks/useApi';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import useGet from '../hooks/useGet';

type Account = {
  id: string;
  name: string;
  balance?: number;
  created_at?: string;
};

const AccountsCRUD: FC = () => {
  const { data: accounts, loading, error, reload } = useGet<Account>('/api/accounts');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [confirmModal, setConfirmModal] = useState<null | { type: 'delete'; id: string; name?: string }>(null);

  const router = useRouter();
  const { request } = useApi();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const t = setTimeout(() => setLocalError(null), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);

  async function updateAccount(id: string) {
    const accountsArr = accounts ?? [];
    const original = accountsArr.find(a => a.id === id);
    if (original && original.name === editName) {
      setEditing(null);
      return;
    }
    if (!window.confirm('Are you sure want to save changes?')) return;
    try {
      const res = await request<{ message?: string }>({ url: '/api/accounts', method: 'PUT', data: { id, name: editName } });
      const data = res.data;
      if (res.status >= 200 && res.status < 300) {
        await reload();
        setEditing(null);
      } else {
        setLocalError(data?.message ?? 'Failed to update');
        setTimeout(() => setLocalError(null), 2000);
      }
    } catch (err) {
      setLocalError('Failed to update');
      setTimeout(() => setLocalError(null), 2000);
    }
  }

  function triggerDelete(id: string) {
    const name = accounts?.find(a => a.id === id)?.name;
    setConfirmModal({ type: 'delete', id, name });
  }

  async function handleModalConfirm() {
    if (!confirmModal) return;
    if (confirmModal.type === 'delete' && confirmModal.id) {
      try {
        const res = await request<{ message?: string }>({ url: '/api/accounts', method: 'DELETE', data: { id: confirmModal.id } });
        if (res.status >= 200 && res.status < 300) {
          await reload();
        } else {
          const data = res.data;
          setLocalError(data?.message ?? 'Failed to delete');
          setTimeout(() => setLocalError(null), 2000);
        }
      } catch (err) {
        setLocalError('Failed to delete');
        setTimeout(() => setLocalError(null), 2000);
      } finally {
        setConfirmModal(null);
      }
    } else {
      setConfirmModal(null);
    }
  }

  function cancelModal() {
    setConfirmModal(null);
  }

  function renderBalance(bal?: number) {
    return Number(bal ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0 });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex justify-between">
        <CardTitle>Accounts</CardTitle>
        <Button variant='success' onClick={() => router.push("/accounts/new")} className="flex items-center gap-1 text-sm" title="Add Account">
          <Plus size={14} />
          Account
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
        {localError && <div className="text-sm text-red-600 mb-4">{localError}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Account</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Balance</th>
                <th className="px-2 py-1 text-right text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                accounts && accounts.length > 0 ? accounts.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2 text-sm text-gray-800">
                      {editing === a.id ? (
                        <Input
                          className="border rounded px-2 py-1"
                          value={editName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                        />
                      ) : (
                        a.name
                      )}
                    </td>
                    <td className="p-2 text-sm text-gray-800">
                      {renderBalance(a.balance)}
                    </td>
                    <td className="p-2 text-sm text-gray-800">
                      <div className="flex gap-1 justify-end">
                        {editing === a.id ? (
                          <>
                            <Button variant="success" onClick={() => updateAccount(a.id)}>Save</Button>
                            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="primary" onClick={() => { setEditing(a.id); setEditName(a.name); }} title="Update">
                              <Pencil size={14} />
                            </Button>
                            <Button title="Delete" variant="danger" onClick={() => triggerDelete(a.id)}>
                              <Trash size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                      No accounts found. Create one to get started.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {confirmModal && (
          <ConfirmModal
            open={!!confirmModal}
            onCancel={cancelModal}
            onConfirm={handleModalConfirm}
            message={`Are you sure you want to delete account${confirmModal.name ? ` "${confirmModal.name}"` : ''}?`}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsCRUD;