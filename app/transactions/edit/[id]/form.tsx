'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import { ArrowLeft, Pencil } from 'lucide-react';
import { FormInput } from '@/app/components/ui/FormInput';

type Props = {
  initial: { total: number, dateInput: string, categoryId: string, note?: string, isExpense: boolean, accountId: string },
  trxId: string
};

export function EditTransactionForm({ initial, trxId }: Props) {
  const [total, setTotal] = useState<number>(initial.total ?? 0);
  const [categoryId, setCategoryId] = useState<string>(initial.categoryId ?? '');
  const [note, setNote] = useState<string>(initial.note ?? '');
  const [isExpense, setIsExpense] = useState<boolean>(initial.isExpense ?? true);
  const [dateInput, setDateInput] = useState<string>(initial.dateInput ?? '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<{ value: string, label: string }[]>([]);

  const router = useRouter();

  useEffect(() => {
    axios.get('/api/categories')
      .then((res) => {
        const data = res.data;
        const cats = data?.categories as Category[] | undefined;
        if (cats && Array.isArray(cats)) {
          const categoryOptions = cats.map((c) => ({ value: c.id, label: c.name }));
          setCategoryOptions(categoryOptions);
        }
      })
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      id: trxId,
      total,
      isExpense,
      categoryId,
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
        setLoading(false);
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  let categorySelect = categoryOptions.find(c => c.value === categoryId);
  if (!categorySelect && categoryId) {
    categorySelect = { value: categoryId, label: categoryId };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <div>
        <FormInput
          label="Date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          type="date"
          error={null}
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
        <CreatableSelect
          isClearable
          value={categorySelect}
          onChange={(option) => setCategoryId(option?.value || '')}
          options={categoryOptions}
        />
      </div>
      <div>
        <FormInput
          label="Total"
          value={String(total)}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value.replace(/[^\d]/g, '')) : 0;
            setTotal(v);
          }}
          type="text"
          error={null}
        />
      </div>
      <div>
        <FormInput
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          as="textarea"
          rows={4}
          error={null}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="flex justify-end space-x-2">
        <Button
          type='button'
          variant="secondary"
          onClick={() => router.push('/dashboard')}
          className='flex items-center gap-1'
        >
          <ArrowLeft/>
          Back
        </Button>
        <Button
          type="submit"
          variant='success'
          disabled={loading}
        >
          {loading ? 'Loading...' : 
          <div className='flex items-center gap-1'>
            <Pencil size={14} />
            Update
          </div>
          }
        </Button>
      </div>
    </form>
  );
}