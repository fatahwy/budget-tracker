'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import CreatableSelect from 'react-select/creatable';
import { Category } from '@prisma/client';
import { Button } from '@/app/components/ui/button';
import { FormInput } from '@/app/components/ui/FormInput';

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

  const [categoryOptions, setCategoryOptions] = useState<{ value: string, label: string }[]>([]);

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
    axios.get('/api/categories')
      .then((res) => {
        const data = res.data;
        const cats = data?.categories as Category[] | undefined;
        if (cats && Array.isArray(cats)) {
          const categoryOptions = cats.map((c) => ({ value: c.id, label: c.name }));
          setCategoryOptions(categoryOptions);
        }
      })
      .catch(() => { })
  }, []);

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
      const res = await axios.post('/api/transactions', parsed);

      const data = res.data;

      if (res.status >= 200 && res.status < 300) {
        setSuccess(data.message);
        router.push('/dashboard');
      } else {
        setError(data?.message ?? 'Something went wrong');
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
        <FormInput
          label="Date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          type="date"
          error={fieldErrors.dateInput}
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
        <FormInput
          label="Total"
          value={String(total)}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value.replace(/[^\d]/g, '')) : 0;
            setTotal(v);
          }}
          type="text"
          error={fieldErrors.total}
        />
      </div>
      <FormInput
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        as="textarea"
        rows={4}
        error={fieldErrors.note}
      />

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