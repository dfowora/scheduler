import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import RosterGrid from './roster-grid';
import NewServiceForm from './new-service';
import DownloadPdfButton from './download-pdf-button';

export default async function CoordinatorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentMember } = await supabase
    .from('members')
    .select('is_coordinator')
    .eq('auth_user_id', user!.id)
    .single();

  if (!currentMember?.is_coordinator) {
    redirect('/dashboard');
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .gte('service_date', new Date().toISOString().slice(0, 10))
    .order('service_date', { ascending: true });

  const { data: availability } = await supabase
    .from('availability')
    .select('*, member:members(*)');

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, member:members(*)');

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Coordinator</p>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-moss-900">Build the roster</h1>
        <DownloadPdfButton
          services={services ?? []}
          assignments={(assignments ?? []) as any}
        />
      </div>

      <NewServiceForm />

      <RosterGrid
        services={services ?? []}
        availability={(availability ?? []) as any}
        assignments={(assignments ?? []) as any}
      />
    </main>
  );
}