'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Account, Category } from '@prisma/client';

interface NewTransactionFormProps {
  accounts: Account[];
  categories: Category[];
}

export function NewTransactionForm({ accounts, categories }: NewTransactionFormProps) {
  const [total, setTotal] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total, categoryId, note, isExpense, dateInput, accountId }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      router.push('/dashboard');
    } else {
      setError(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
        <div className="flex items-center space-x-4">
          <label>
            <input
              type="radio"
              checked={isExpense}
              onChange={() => setIsExpense(true)}
              className="mr-1"
            />
            Expense
          </label>
          <label>
            <input
              type="radio"
              checked={!isExpense}
              onChange={() => setIsExpense(false)}
              className="mr-1"
            />
            Income
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        {hasMounted && <CreatableSelect
          isClearable
          onChange={(option) => setCategoryId(option?.value || null)}
          options={categoryOptions}
        />}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Total</label>
        <input
          type="number"
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Transaction
      </button>
    </form>
  );
}