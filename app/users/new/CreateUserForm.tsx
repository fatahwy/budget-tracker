'use client'

import React, { useState } from 'react';
import { FormInput } from '../../components/ui/FormInput';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

export function CreateUserForm() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/users');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data?.message ?? 'Failed to create user');
      }
    } catch {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-3">
      <div>
        <FormInput
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          type="text"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <FormInput
          id="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <FormInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="flex space-x-2">
        <Button type='button' onClick={() => router.push('/users')} className="rounded-md" variant='secondary'>
          Back
        </Button>
        <Button type="submit" className="rounded-md" disabled={loading}>
          {loading ? 'Loading...' : 'Save'}
        </Button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
    </form>
  );
}