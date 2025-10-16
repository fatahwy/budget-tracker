'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '../components/ui/menu';

type Account = {
  id: string;
  name: string;
  balance?: number;
  created_at?: string;
};

export default function AccountsCRUD() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoadingAccounts(true);
    try {
      const res = await fetch('/api/accounts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load accounts');
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) {
      setError('Account name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Failed to create account');
      } else {
        setNewName('');
        await fetchAccounts();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  async function updateAccount(id: string) {
    if (!window.confirm('Simpan perubahan akun ini?')) return;
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAccounts();
        setEditing(null);
      } else {
        setError(data.message ?? 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update');
    }
  }

  async function deleteAccount(id: string) {
    if (!window.confirm('Hapus akun ini?')) return;
    try {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.message ?? 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete');
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createAccount} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="New account name"
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </form>

          {loadingAccounts && <div className="text-sm mb-4 text-gray-600">Memuat akun...</div>}
          {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {
                loadingAccounts ?
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                      Loading...
                    </td>
                  </tr>
                  :
                  (
                    accounts.length > 0 ?
                      accounts.map((a) => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editing === a.id ? (
                              <Input
                                className="border rounded px-2 py-1"
                                value={editName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                              />
                            ) : (
                              a.name
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {Number(a.balance ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 text-sm text-center text-gray-800">
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> */}
                            { editing === a.id ? (
                              <Menu>
                                <MenuTrigger>
                                  <button className="px-2 py-1 rounded bg-gray-100">Actions</button>
                                </MenuTrigger>
                                <MenuContent align="start">
                                  <MenuItem onClick={() => updateAccount(a.id)}>Save</MenuItem>
                                  <MenuItem onClick={() => setEditing(null)}>Cancel</MenuItem>
                                </MenuContent>
                              </Menu>
                            ) : (
                              <Menu>
                                <MenuTrigger>
                                  <button className="px-2 py-1 rounded bg-gray-100">Actions</button>
                                </MenuTrigger>
                                <MenuContent align="start">
                                  <MenuItem onClick={() => {
                                    setEditing(a.id);
                                    setEditName(a.name);
                                  }}>Edit</MenuItem>
                                  <MenuItem onClick={() => deleteAccount(a.id)}>Delete</MenuItem>
                                </MenuContent>
                              </Menu>
                            )}
                          </td>
                        </tr>
                      ))
                      :
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                          No accounts found. Create one to get started.
                        </td>
                      </tr>
                  )
              }
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}