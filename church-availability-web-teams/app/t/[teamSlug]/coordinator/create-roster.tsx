'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

export default function CreateRosterForm({ teamId }: { teamId: string }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('rosters').insert({ team_id: teamId, name: name.trim() });
    setSubmitting(false);
    if (!error) {
      setName('');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-moss-100 rounded-xl p-5 bg-white mb-4 space-y-3">
      <p className="font-display text-lg text-moss-900">Create a roster</p>
      <input
        required
        placeholder="e.g. August 2026"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-moss-100 rounded-lg px-3 py-2"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-moss-600 text-parchment rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? 'Creating…' : 'Create roster'}
      </button>
    </form>
  );
}