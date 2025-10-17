'use client';
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

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
  note?: string;
};

export default function ClientDashboard({ defaultAccountId }: { defaultAccountId?: string; }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(defaultAccountId ?? accounts?.[0]?.id ?? "");
  const [list, setList] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

  // New modal state
  const [confirmModal, setConfirmModal] = useState<null | { type: 'save' | 'delete'; trx?: Transaction }>(null);

  // Sync with props
  const hasAccounts = accounts && accounts.length > 0;
  const canCreateTransaction = hasAccounts && !!defaultAccountId;

  // Pagination + filtering
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(list?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / pageSize));

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages]);

  // UI default account
  useEffect(() => { if (!selectedAccount && accounts && accounts.length > 0) { setSelectedAccount(accounts[0].id); } }, [accounts]);

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
    } finally {
      setLoadingAccounts(false);
    }
  }

  const balanceFromAccounts = useMemo(() => accounts?.find(a => a.id === selectedAccount)?.balance ?? 0, [accounts, selectedAccount]);

  // Helpers
  const deleteTxn = async (id: string) => {
    const target = list.find(t => t.id === id);
    setConfirmModal({ type: 'delete', trx: target ?? undefined });
  };

  const performDelete = async (id: string) => {
    try {
      const res = await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) {
        setList(prev => prev.filter(t => t.id !== id));
        if (editingId === id) setEditingId(null);
        fetchAccounts();
      }
    } catch { /* ignore */ }
  };

  const handleModalConfirm = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'delete' && confirmModal.trx?.id) {
      await performDelete(confirmModal.trx.id);
    }
    setConfirmModal(null);
  };

  // Fetch transactions when the selected account changes
  useEffect(() => {
    if (!selectedAccount) return;
    (async () => {
      setLoadingTransactions(true);
      try {
        const res = await fetch(`/api/transactions?accountId=${selectedAccount}&page=${currentPage}&limit=${pageSize}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.transactions) setList(data.transactions);
          if (typeof data?.total === 'number') setTotalCount(data.total);
        }
      } catch {
        // Ignore fetch errors for resilience
      } finally {
        setLoadingTransactions(false);
      }
    })();
  }, [selectedAccount, currentPage]);

  // UI
  return (
    <Card className="max-w-4xl">
      <CardHeader className="flex justify-between">
        <CardTitle>Dashboard</CardTitle>
        <div className="flex">
          <Link href={canCreateTransaction ? "/transactions/new" : ''} className={`rounded-md bg-green-600 px-3 py-1 text-white ${canCreateTransaction ? '' : 'opacity-50'}`}>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
              Transaction
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAccounts && !loadingAccounts ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
            <strong className="font-semibold">Perhatian:</strong> Belum ada akun. Buat akun untuk mulai input transaksi.
          </div>
        ) : (
          <>
            <div className="mb-2 text-lg font-semibold">
              Balance: {balanceFromAccounts.toLocaleString('id-ID', { minimumFractionDigits: 0 })}
            </div>

            {
              !loadingAccounts &&
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  value={selectedAccount}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value;
                    setSelectedAccount(value);
                    if (value) {
                      await fetch('/api/users/default-account', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accountId: value }),
                      });
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
            }
          </>
        )}

        {/* Pagination controls with numeric page buttons */}
        {totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
            <div className="space-x-1 text-sm">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-2 py-1 border rounded" aria-label="Previous page">Prev</button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded border ${isActive ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
                    aria-label={`Page ${page}`}
                    style={{ minWidth: 32 }}
                  >
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-2 py-1 border rounded" aria-label="Next page">Next</button>
            </div>
          </div>
        )}

        {/* Transactions table */}
        <h2 className="mb-2 text-xl">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left text-sm font-medium text-gray-500">No.</th>
                <th className="p-2 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="p-2 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="p-2 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="p-2 text-left text-sm font-medium text-gray-500">Note</th>
                <th className="p-2 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                loadingTransactions ?
                  <tr><td colSpan={6} className="px-6 py-4 text-sm text-gray-500 text-center">Loading...</td></tr>
                  :
                  (
                    list.length > 0 ?
                      list.map((trx, idx) => (
                        <tr key={trx.id} className="border-b">
                          <td className="p-2 text-sm text-gray-800">{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td className="p-2 text-sm text-gray-800">
                            {
                              new Date(trx.date_input).toLocaleDateString('id-ID')
                            }
                          </td>
                          <td className="p-2 text-sm text-gray-800">{trx.category?.name ?? ""}</td>
                          <td className={`p-2 text-sm ${trx.is_expense ? "text-red-600" : "text-green-600"}`}>
                            {trx.is_expense ? "-" : "+"}{(trx.total ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })}
                          </td>
                          <td className="p-2 text-sm text-gray-800">{trx.note}</td>
                          <td className="p-2 text-sm text-right text-gray-800">
                            <div className='flex gap-1 justify-end'>
                              <Link className="bg-blue-600 text-white px-2 py-1 rounded cursor-pointer" href={`/transactions/edit/${trx.id}`}>Update</Link>
                              <Button variant="danger" onClick={() => deleteTxn(trx.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                      :
                      <tr><td colSpan={5} className="px-6 py-4 text-sm text-gray-500 text-center">No transactions for this page</td></tr>
                  )
              }
            </tbody>
          </table>
        </div>

        {/* Confirmation modal for Save/Delete actions */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded shadow p-6 w-96">
              <div className="font-semibold text-lg mb-2">
                {confirmModal.type === 'save' ? 'Konfirmasi Simpan Transaksi' : 'Konfirmasi Hapus Transaksi'}
              </div>
              <div className="text-sm mb-4">
                {confirmModal.type === 'save'
                  ? 'Apakah Anda yakin ingin menyimpan perubahan pada transaksi ini?'
                  : 'Apakah Anda yakin ingin menghapus transaksi ini?'}
              </div>
              <div className="flex justify-end space-x-2">
                <button className="px-3 py-1 rounded bg-gray-300" onClick={() => setConfirmModal(null)}>
                  Batal
                </button>
                <button className={`px-3 py-1 rounded ${confirmModal.type === 'save' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`} onClick={handleModalConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}