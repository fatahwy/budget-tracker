'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '../components/ui/menu';
import Link from 'next/link';

type Account = {
  id: string;
  name: string;
  balance?: number;
  created_at?: string;
};

export default function AccountsCRUD() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    <Card className="max-w-2xl">
      <CardHeader className='flex justify-between'>
        <CardTitle>Accounts</CardTitle>
        <div className="flex">
          <Link href="/users/new" className={`rounded-md bg-green-600 px-3 py-1 text-white`}>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
              Account
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Account</th>
                <th className="px-2 py-1 text-left text-sm font-semibold text-gray-500">Balance</th>
                <th className="px-2 py-1 text-right text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody >
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
                        <tr key={a.id} className="border-b">
                          <td className="p-2 text-sm text-gray-800">
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
                          <td className="p-2 text-sm text-gray-800">
                            {Number(a.balance ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })}
                          </td>
                          <td className="p-2 text-sm text-gray-800">
                            <div className='flex gap-1 justify-end'>
                              {editing === a.id ? (
                                <>
                                  <Button variant='success' onClick={() => updateAccount(a.id)}>Save</Button>
                                  <Button variant='secondary' onClick={() => setEditing(null)}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button variant='primary' onClick={() => {
                                    setEditing(a.id);
                                    setEditName(a.name);
                                  }}>Edit</Button>
                                  <Button variant='danger' onClick={() => deleteAccount(a.id)}>Delete</Button>
                                </>
                              )}
                            </div>
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
  );
}