'use client';
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";

type Account = {
  id: string;
  name: string;
  balance?: number;
  created_at?: string | Date;
};

type Transaction = {
  id: string;
  date_input: string | Date;
  account: { id: string; name: string };
  category?: { name?: string } | null;
  total: number;
  is_expense: boolean;
  // other fields ignored for display
};

export default function ClientDashboard({ accounts, transactions, defaultAccountId }: { accounts: Account[]; transactions: Transaction[]; defaultAccountId?: string; }) {
  const [selectedAccount, setSelectedAccount] = useState<string>(defaultAccountId ?? accounts?.[0]?.id ?? "");
  const [list, setList] = useState<Transaction[]>(transactions ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTotal, setEditedTotal] = useState<number | undefined>(undefined);
  const [editedDateInput, setEditedDateInput] = useState<string>(""); // yyyy-mm-dd
  const [editedAccountId, setEditedAccountId] = useState<string>("");

  // Sync list with props
  const hasAccounts = accounts && accounts.length > 0;
  const canCreateTransaction = hasAccounts && !!defaultAccountId;

  useEffect(() => {
    if (transactions) setList(transactions);
  }, [transactions]);

  // Ensure a default selection when accounts arrive
  useEffect(() => {
    if (!selectedAccount && accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  const balanceFromAccounts = useMemo(() => {
    return accounts?.reduce((acc, a) => acc + (a.balance ?? 0), 0) ?? 0;
  }, [accounts]);

  const balanceFromTransactions = useMemo(() => {
    const byAccount: Record<string, number> = {};
    (list ?? []).forEach((t) => {
      const accId = t.account?.id ?? "";
      const delta = t.is_expense ? -t.total : t.total;
      byAccount[accId] = (byAccount[accId] ?? 0) + delta;
    });
    return byAccount;
  }, [list]);

  const displayBalance = useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    if (!selectedAccount) return 0;
    const acc = accounts.find((a) => a.id === selectedAccount);
    const byId = balanceFromTransactions[selectedAccount] ?? 0;
    return byId !== 0 ? byId : (acc?.balance ?? 0);
  }, [accounts, selectedAccount, balanceFromAccounts, balanceFromTransactions]);

  const filtered = useMemo(() => {
    if (!selectedAccount) return list;
    return list.filter((t) => t.account?.id === selectedAccount);
  }, [selectedAccount, list]);

  // Helpers
  const deleteTxn = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setList(prev => prev.filter(t => t.id !== id));
        if (editingId === id) setEditingId(null);
      } else {
        // Optional: show error
      }
    } catch (e) {
      // ignore
    }
  };

  const startEdit = (trx: Transaction) => {
    setEditingId(trx.id);
    setEditedTotal(trx.total);
    const dateVal = trx.date_input ? (typeof trx.date_input === 'string' ? trx.date_input : new Date(trx.date_input).toISOString().slice(0, 10)) : "";
    setEditedDateInput(dateVal);
    setEditedAccountId(trx.account?.id ?? "");
  };

  const saveEdit = async (trx: Transaction) => {
    const payload = {
      id: trx.id,
      total: editedTotal ?? trx.total,
      dateInput: editedDateInput || (typeof trx.date_input === 'string' ? trx.date_input : new Date(trx.date_input).toISOString()),
      accountId: editedAccountId || trx.account?.id
    };
    const res = await fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setList(prev => prev.map(t => t.id === trx.id ? {
        ...t,
        total: editedTotal ?? t.total,
        date_input: editedDateInput || t.date_input,
        account: { id: editedAccountId || t.account?.id, name: accounts?.find(a => a.id === (editedAccountId || t.account?.id))?.name ?? t.account?.name }
      } : t));
      setEditingId(null);
    }
  };

  // UI
  return (
    <div className="min-h-screen container mx-auto p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="space-x-4">
          {canCreateTransaction ? (
            <Link href="/transactions/new" className="rounded-md bg-green-600 px-4 py-2 text-white">
              New Transaction
            </Link>
          ) : (
            <button className="rounded-md bg-green-600 px-4 py-2 text-white opacity-50" disabled title={hasAccounts ? 'Pilih akun default untuk membuat transaksi' : 'Tidak ada akun'}>
              New Transaction
            </button>
          )}
        </div>
      </div>
      {!hasAccounts ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Perhatian:</strong> Belum ada akun. Buat akun untuk mulai menggunakan dashboard.
        </div>
      ) :
        <>
          <div className="mb-2 text-lg font-semibold">
            Balance: ${displayBalance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value;
                setSelectedAccount(value);
                // save as default for user and refresh session on success
                if (value) {
                  try {
                    const res = await fetch('/api/users/default-account', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accountId: value }),
                    });
                    // const data = await res.json();
                    // if (res.ok && data?.defaultAccountId) {
                    //   window.location.reload(); // refresh session to reflect new default account
                    // }
                  } catch {
                    // ignore errors
                  }
                }
              }}
              className="border rounded px-3 py-2"
              disabled={!hasAccounts}
            >
              {accounts?.map((acc) => (
                <option key={acc?.id} value={acc?.id}>{acc?.name}</option>
              ))}
            </select>
          </div>
        </>
      }

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Recent Transactions</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="py-2 text-left text-sm font-medium text-gray-500">Account</th>
              <th className="py-2 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="py-2 text-right text-sm font-medium text-gray-500">Amount</th>
              <th className="py-2 text-center text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trx) => (
              <tr key={trx.id} className="border-b">
                <td className="py-3 text-sm text-gray-800">
                  {editingId === trx.id ? (
                    <input type="date" className="border rounded px-2 py-1" value={editedDateInput} onChange={e => setEditedDateInput(e.target.value)} />
                  ) : (
                    new Date(trx.date_input).toLocaleDateString('id-ID')
                  )}
                </td>
                <td className="py-3 text-sm text-gray-800">{trx.account?.name}</td>
                <td className="py-3 text-sm text-gray-800">{trx.category?.name ?? ""}</td>
                <td className={`py-3 text-right text-sm ${trx.is_expense ? "text-red-600" : "text-green-600"}`}>
                  {trx.is_expense ? "-" : "+"}${(trx.total ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-sm text-center text-gray-800">
                  {editingId === trx.id ? (
                    <>
                      <input type="number" step="0.01" className="border rounded px-2 py-1 w-24" value={editedTotal ?? trx.total} onChange={e => setEditedTotal(parseFloat(e.target.value))} />
                      <button className="ml-2 bg-blue-500 text-white rounded px-2 py-1" onClick={() => saveEdit(trx)}>
                        Save
                      </button>
                      <button className="ml-2 bg-gray-300 rounded px-2 py-1" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="bg-yellow-500 text-white rounded px-2 py-1" onClick={() => startEdit(trx)}>
                        Update
                      </button>
                      <button className="ml-2 bg-red-600 text-white rounded px-2 py-1" onClick={() => deleteTxn(trx.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}