'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import CreatableSelect from 'react-select/creatable';
import { Category } from '@prisma/client';
import { Button } from '@/app/components/ui/button';

export function NewTransactionForm() {
  const [total, setTotal] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  const formSchema = z.object({
    total: z.number().gt(0, { message: 'Total must be greater than 0' }),
    categoryId: z.string(),
    note: z.string().optional(),
    isExpense: z.boolean(),
    dateInput: z.string().min(1, 'Date is required'),
  });
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const cats = data?.categories as Category[] | undefined;
        if (cats && Array.isArray(cats)) {
          setLocalCategories(cats);
        }
      })
      .catch(() => { })
  }, []);

  const categoryOptions = localCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const parsed = {
      total,
      categoryId,
      note,
      isExpense,
      dateInput,
    };

    const validation = formSchema.safeParse(parsed);
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error?.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errs[key] = issue.message;
      });
      setFieldErrors(errs);
      setIsLoading(false);
      return;
    }
    setFieldErrors({});

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        router.push('/dashboard');
      } else {
        setError(data.message);
        setIsLoading(false);
      }
    } catch {
      setError('Something went wrong');
      setIsLoading(false);
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
          className={`block w-full rounded-md px-3 py-2 shadow-sm border ${fieldErrors.dateInput ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
          required
        />
        {fieldErrors.dateInput && <p className="text-sm text-red-600 mt-1">{fieldErrors.dateInput}</p>}
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
        {hasMounted && (
          <CreatableSelect
            isClearable
            onChange={(option) => setCategoryId(option?.value || null)}
            options={categoryOptions}
          />
        )}
        {fieldErrors.categoryId && <p className="text-sm text-red-600 mt-1">{fieldErrors.categoryId}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Total</label>
        <input
          type="text"
          value={total}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value.replace(/[^\d]/g, '')) : 0;
            setTotal(v);
          }}
          className={`block w-full rounded-md px-3 py-2 shadow-sm border ${fieldErrors.total ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
          required
        />
        {fieldErrors.total && <p className="text-sm text-red-600 mt-1">{fieldErrors.total}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`block w-full rounded-md px-3 py-2 shadow-sm border ${fieldErrors.note ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {fieldErrors.note && <p className="text-sm text-red-600 mt-1">{fieldErrors.note}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <div className="flex space-x-4 justify-end">
        <Button
          type='button'
          variant="secondary"
          onClick={() => router.push('/dashboard')}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant='success'
          disabled={isLoading}
        >
          {isLoading ? 'Loading...'
            : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                <span>Save</span>
              </span>
            )}
        </Button>
      </div>
    </form>
  );
}