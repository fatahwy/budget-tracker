 "use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '../components/ui/menu';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';


type User = {
  id: string;
  username: string;
  email: string;
  client_id?: string;
  default_account_id?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string>('');
  const [editingPassword, setEditingPassword] = useState<string>('');

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
    const payload: any = {};
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
    <div className="container mx-auto p-6">
      <div className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <Link href="/users/new" className="bg-green-600 text-white rounded px-3 py-1">Create User</Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border min-h-full">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">ID</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Username</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Email</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-2 py-2 text-sm text-gray-700">{u.id}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{u.username}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {editingId === u.id ? (
                      <input value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} className="border rounded px-2 py-1" />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td className="py-3 text-sm text-gray-800">
                    {editingId === u.id ? (
                      <>
                        <input type="password" placeholder="New password" value={editingPassword} onChange={(e) => setEditingPassword(e.target.value)} className="ml-2 border rounded px-2 py-1" />
                        <button className="mx-2 bg-blue-500 text-white rounded px-2 py-1" onClick={() => saveEdit(u)}>Save</button>
                        <button className=" bg-gray-300 rounded px-2 py-1" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <Menu>
                          <MenuTrigger>
                            <button className="bg-yellow-500 text-white rounded px-2 py-1">Actions</button>
                          </MenuTrigger>
                          <MenuContent align="start">
                            <MenuItem onClick={() => startEdit(u)}>Update</MenuItem>
                            <MenuItem onClick={() => deleteUser(u.id)}>Delete</MenuItem>
                          </MenuContent>
                        </Menu>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}