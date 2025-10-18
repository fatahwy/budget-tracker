'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FormInput } from '@/app/components/ui/FormInput';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        router.push('/dashboard');
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
      <Button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-md px-4 py-2 ${isSubmitting ? 'opacity-50' : ''}`}
      >
        {isSubmitting ? 'Loading...' : 'Login'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </form>
  );
}
