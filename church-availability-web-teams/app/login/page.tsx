'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'working'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('working');
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setStatus('idle');
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(searchParams.get('redirect') || '/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">Service Team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-8">Welcome back</h1>

        {errorMessage && (
          <p className="text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3 mb-4">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-moss-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-moss-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={status === 'working'}
            className="w-full bg-moss-600 text-parchment rounded-lg px-4 py-3 font-medium hover:bg-moss-900 transition-colors disabled:opacity-60"
          >
            {status === 'working' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-moss-400 mt-4">
          No account yet?{' '}
          <a href="/signup" className="text-moss-600 underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}