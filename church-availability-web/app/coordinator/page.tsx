import { createClient } from '../../lib/supabase/server';
import RosterGrid from './roster-grid';

export default async function CoordinatorPage() {
  const supabase = createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .gte('service_date', new Date().toISOString().slice(0, 10))
    .order('service_date', { ascending: true });

  const { data: availability } = await supabase
    .from('availability')
    .select('*, member:members(*)');

  const { data: assignments } = await supabase.from('assignments').select('*');

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Coordinator</p>
      <h1 className="font-display text-3xl text-moss-900 mb-8">Build the roster</h1>
      <RosterGrid
        services={services ?? []}
        availability={(availability ?? []) as any}
        assignments={assignments ?? []}
      />
    </main>
  );
}
