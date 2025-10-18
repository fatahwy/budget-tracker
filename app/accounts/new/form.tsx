'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/app/components/ui/FormInput';

export function NewAccountForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      router.push('/accounts');
    } else {
      setError(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <FormInput label="Account Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Account Name" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Account
      </button>
    </form>
  );
}
