'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const supabase = createClient();

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? 'error' : 'sent');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">Service Team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-8">
          Let us know<br />when you're free.
        </h1>

        {status === 'sent' ? (
          <p className="text-moss-600 border border-moss-100 bg-moss-50 rounded-lg p-4">
            Check your email — we sent a sign-in link.
          </p>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-moss-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-moss-600 text-parchment rounded-lg px-4 py-3 font-medium hover:bg-moss-900 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-700">Something went wrong. Try again.</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
