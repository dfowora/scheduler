'use client';

import { use, useEffect, useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';

export default function LoginPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = use(params);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // Supabase sends errors as a URL hash fragment (#error=...), and our
    // callback route sends them as a query param (?error=...) — check both.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);

    const hashError = hash.get('error_description') || hash.get('error');
    const queryError = query.get('error');

    if (hashError) setErrorMessage(decodeURIComponent(hashError.replace(/\+/g, ' ')));
    else if (queryError) setErrorMessage(decodeURIComponent(queryError.replace(/\+/g, ' ')));
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/t/${teamSlug}/auth/callback` },
    });
    setStatus(error ? 'error' : 'sent');
    if (error) setErrorMessage(error.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">Service Team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-8">
          Let us know<br />when you're free.
        </h1>

        {errorMessage && (
          <p className="text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3 mb-4">
            {errorMessage}
          </p>
        )}

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
              {status === 'sending' ? 'Sending...' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}