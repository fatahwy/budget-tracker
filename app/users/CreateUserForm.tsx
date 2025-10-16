import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function CreateUserForm({ onUserCreated }: { onUserCreated: (user: any) => void }) {
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
        onUserCreated(data);
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data?.message ?? 'Gagal membuat pengguna');
      }
    } catch {
      setError('Permintaan gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="flex space-x-2">
        <Link href='/users' className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400">
          Back
        </Link>
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
    </form>
  );
}