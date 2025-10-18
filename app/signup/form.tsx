'use client';

import { useRouter } from 'next/navigation';
import { FormInput } from '@/app/components/ui/FormInput';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';

export function SignUpForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        router.push('/login');
      } else {
        setError(data.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      setError('Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
      <FormInput
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        placeholder="Username"
      />
      <div>
        <FormInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
        />
      </div>
      <div className="mb-4 relative">
        <FormInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
        />
        {password.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-8 text-sm text-indigo-600"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <Button
        type="submit"
        className="w-full rounded-md px-4 py-2"
      >
        {isSubmitting ? 'Loading...' : 'Sign Up'}
      </Button>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign In
        </Link>
      </p>
    </form>
  );
}
