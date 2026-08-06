'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewTeamPage() {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug) return;

    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('teams').insert({ name: name.trim(), slug });

    setSubmitting(false);

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'That team name is already taken — try a slightly different name.'
          : 'Something went wrong. Try again.'
      );
      return;
    }

    router.push(`/t/${slug}/login`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">New team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-8">Name your team</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Riverside Worship Team"
            className="w-full border border-moss-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-moss-600 text-parchment rounded-lg px-4 py-3 font-medium hover:bg-moss-900 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create team'}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
        <p className="text-xs text-moss-400 mt-4">
          Whoever signs in first on the next screen automatically becomes this team's coordinator.
        </p>
      </div>
    </main>
  );
}
