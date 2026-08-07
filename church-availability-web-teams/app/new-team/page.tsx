'use client';

import { useEffect, useState } from 'react';
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
  const [checkedAuth, setCheckedAuth] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/new-team');
        return;
      }
      setCheckedAuth(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug) return;

    setSubmitting(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirect=/new-team');
      return;
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ name: name.trim(), slug })
      .select()
      .single();

    if (teamError || !team) {
      setSubmitting(false);
      setError(
        teamError?.code === '23505'
          ? 'That team name is already taken — try a slightly different name.'
          : `Something went wrong: ${teamError?.message}`
      );
      return;
    }

    const { error: memberError } = await supabase.from('members').insert({
      auth_user_id: user.id,
      team_id: team.id,
      full_name: user.email?.split('@')[0] ?? 'Coordinator',
      roles: [],
      is_coordinator: true,
    });

    setSubmitting(false);

    if (memberError) {
      setError(`Team created, but couldn't add you as coordinator: ${memberError.message}`);
      return;
    }

    router.push(`/t/${slug}/dashboard`);
  };

  if (!checkedAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-moss-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">New team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-8">Name your team</h1>

        {error && (
          <p className="text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

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
        </form>
        <p className="text-xs text-moss-400 mt-4">You'll become this team's coordinator immediately.</p>
      </div>
    </main>
  );
}