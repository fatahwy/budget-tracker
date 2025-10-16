'use client';
import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Account, Category } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  initial: { total: number, dateInput: string, categoryId: string, note?: string, isExpense: boolean, accountId: string },
  categories: Category[],
  trxId: string
};

export function EditTransactionForm({ initial, categories, trxId }: Props) {
  const [total, setTotal] = useState<number>(initial.total ?? 0);
  const [categoryId, setCategoryId] = useState<string>(initial.categoryId ?? '');
  const [note, setNote] = useState<string>(initial.note ?? '');
  const [isExpense, setIsExpense] = useState<boolean>(initial.isExpense ?? true);
  const [dateInput, setDateInput] = useState<string>(initial.dateInput ?? '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload: any = {
      id: trxId,
      total,
      dateInput,
      note,
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Transaction updated');
        router.push('/dashboard');
      } else {
        setError(data?.message ?? 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="block w-full rounded-md px-3 py-2 shadow-sm border"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Total</label>
        <input
          type="text"
          value={total}
          onChange={(e) => {
            const v = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
            setTotal(v);
          }}
          className="block w-full rounded-md px-3 py-2 shadow-sm border"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`block w-full rounded-md px-3 py-2 shadow-sm border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="flex justify-end space-x-2">
        <Link href='/dashboard' className="rounded-md bg-gray-300 px-4 py-2 text-gray-800">
          Back
        </Link>
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white" disabled={loading}>
          {loading ? 'Loading...' : 'Update'}
        </button>
      </div>
    </form>
  );
}