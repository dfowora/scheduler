'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import type { Roster } from '../../../../types/database';

export default function NewServiceForm({ teamId, rosters }: { teamId: string; rosters: Roster[] }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [rosterId, setRosterId] = useState(rosters[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterId) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('services')
      .insert({ title, service_date: date, service_time: time, team_id: teamId, roster_id: rosterId });
    setSubmitting(false);
    if (!error) {
      setTitle('');
      setDate('');
      router.refresh();
    }
  };

  if (rosters.length === 0) {
    return (
      <div className="border border-moss-100 rounded-xl p-5 bg-white mb-8">
        <p className="text-sm text-moss-400">Create a roster above first, then you can add services to it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-moss-100 rounded-xl p-5 bg-white mb-8 space-y-3">
      <p className="font-display text-lg text-moss-900">Add a service</p>
      <select
        required
        value={rosterId}
        onChange={(e) => setRosterId(e.target.value)}
        className="w-full border border-moss-100 rounded-lg px-3 py-2 bg-white"
      >
        {rosters.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <input
        required
        placeholder="Title (e.g. Sunday Service)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-moss-100 rounded-lg px-3 py-2"
      />
      <div className="flex gap-3">
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 border border-moss-100 rounded-lg px-3 py-2"
        />
        <input
          required
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1 border border-moss-100 rounded-lg px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-gold text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add service'}
      </button>
    </form>
  );
}