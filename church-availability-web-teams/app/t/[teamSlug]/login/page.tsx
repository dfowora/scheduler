'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

export default function LoginPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const { teamSlug } = use(params);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('working');
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus('idle');
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStep('code');
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('working');
    setErrorMessage('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (error || !data.user) {
      setStatus('error');
      setErrorMessage(error?.message ?? 'Invalid code. Try again.');
      return;
    }

    const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single();

    if (team) {
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .eq('team_id', team.id)
        .maybeSingle();

      if (!existingMember) {
        const { count } = await supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', team.id);

        await supabase.from('members').insert({
          auth_user_id: data.user.id,
          team_id: team.id,
          full_name: data.user.email?.split('@')[0] ?? 'New member',
          roles: [],
          is_coordinator: (count ?? 0) === 0,
        });
      }
    }

    router.push(`/t/${teamSlug}/dashboard`);
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

        {step === 'email' ? (
          <form onSubmit={sendCode} className="space-y-3">
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
              disabled={status === 'working'}
              className="w-full bg-moss-600 text-parchment rounded-lg px-4 py-3 font-medium hover:bg-moss-900 transition-colors disabled:opacity-60"
            >
              {status === 'working' ? 'Sending...' : 'Send sign-in code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <p className="text-sm text-moss-600 mb-2">
              Check your email for a 6-digit code and enter it below.
            </p>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className="w-full border border-moss-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold text-center text-lg tracking-widest"
            />
            <button
              type="submit"
              disabled={status === 'working'}
              className="w-full bg-moss-600 text-parchment rounded-lg px-4 py-3 font-medium hover:bg-moss-900 transition-colors disabled:opacity-60"
            >
              {status === 'working' ? 'Verifying...' : 'Verify and sign in'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-moss-400 underline"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}