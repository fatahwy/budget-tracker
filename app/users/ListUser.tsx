"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Save, Trash, X } from 'lucide-react';

type User = {
  id: string;
  username: string;
  email: string;
  client_id?: string;
  default_account_id?: string | null;
};

export default function ListAccount() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string>('');
  const [editingPassword, setEditingPassword] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setError('Response tidak valid');
        }
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (error.length > 0) {
      setTimeout(() => setError(''), 2000);
    }
  }, [error])

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
      setError('Tidak ada perubahan yang dilakukan');
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, email: payload.email ?? u.email } : u));
        cancelEdit();
      } else {
        setError(data?.message ?? 'Gagal memperbarui');
      }
    } catch {
      setError('Permintaan gagal');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Hapus pengguna ini?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        setError(data?.message ?? 'Gagal menghapus');
      }
    } catch {
      setError('Permintaan gagal');
    }
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex justify-between">
        <CardTitle>Users</CardTitle>
        <div className="flex">
          <Button onClick={() => router.push("/users/new")} className='flex items-center' title='Add User'>
            <Plus />
            User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

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
              {
                loading ?
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                      Loading...
                    </td>
                  </tr>
                  :
                  (
                    users.length > 0 ?
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
                            <div className='flex gap-1 justify-end'>
                              {editingId === u.id ? (
                                <>
                                  <input type="password" placeholder="New password" value={editingPassword} onChange={(e) => setEditingPassword(e.target.value)} className="border rounded px-2 py-1" />
                                  <Button variant='success' onClick={() => saveEdit(u)} title='Save'><Save size={14} /></Button>
                                  <Button variant='secondary' onClick={cancelEdit} title='Cancel'><X size={14} /></Button>
                                </>
                              ) : (
                                <>
                                  <Button variant='primary' onClick={() => startEdit(u)} title='Update'><Pencil size={14} /></Button>
                                  <Button variant='danger' onClick={() => deleteUser(u.id)} title='Delete'><Trash size={14} /></Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                      :
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                          No users found. Create one to get started.
                        </td>
                      </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}