'use client';

import React, { useEffect, useState } from 'react';

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
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/accounts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load accounts');
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
        setError(data.message ?? 'Failed to update account');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAccount(id: string) {
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
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Accounts</h1>

      <form onSubmit={createAccount} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="New account name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white" disabled={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((a) => (
            <tr key={a.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editing === a.id ? (
                  <input
                    className="border rounded px-2 py-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  a.name
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {Number(a.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editing === a.id ? (
                  <>
                    <button onClick={() => updateAccount(a.id)} className="mr-2 text-sm text-indigo-600">
                      Save
                    </button>
                    <button onClick={() => setEditing(null)} className="text-sm text-gray-600">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(a.id);
                        setEditName(a.name);
                      }}
                      className="mr-2 text-sm text-blue-600"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteAccount(a.id)} className="text-sm text-red-600">
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                No accounts found. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}