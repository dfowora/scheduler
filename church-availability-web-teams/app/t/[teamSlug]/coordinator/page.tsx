import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import RosterGrid from './roster-grid';
import NewServiceForm from './new-service';
import CreateRosterForm from './create-roster';
import DownloadPdfButton from './download-pdf-button';

export default async function CoordinatorPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>;
}) {
  const { teamSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/t/${teamSlug}/login`);
  }

  const { data: team } = await supabase.from('teams').select('*').eq('slug', teamSlug).single();

  if (!team) {
    redirect('/');
  }

  const { data: currentMember } = await supabase
    .from('members')
    .select('is_coordinator')
    .eq('auth_user_id', user.id)
    .eq('team_id', team.id)
    .single();

  if (!currentMember?.is_coordinator) {
    redirect(`/t/${teamSlug}/dashboard`);
  }

  const { data: rosters } = await supabase
    .from('rosters')
    .select('*')
    .eq('team_id', team.id)
    .order('created_at', { ascending: true });

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('team_id', team.id)
    .gte('service_date', new Date().toISOString().slice(0, 10))
    .order('service_date', { ascending: true });

  const serviceIds = (services ?? []).map((s) => s.id);

  const { data: availability } = serviceIds.length
    ? await supabase.from('availability').select('*, member:members(*)').in('service_id', serviceIds)
    : { data: [] as any[] };

  const { data: assignments } = serviceIds.length
    ? await supabase.from('assignments').select('*, member:members(*)').in('service_id', serviceIds)
    : { data: [] as any[] };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">{team.name} · Coordinator</p>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-moss-900">Build the roster</h1>
        <DownloadPdfButton
          teamName={team.name}
          rosters={rosters ?? []}
          services={services ?? []}
          assignments={(assignments ?? []) as any}
        />
      </div>

      <CreateRosterForm teamId={team.id} />
      <NewServiceForm teamId={team.id} rosters={rosters ?? []} />

      <RosterGrid
        rosters={rosters ?? []}
        services={services ?? []}
        availability={(availability ?? []) as any}
        assignments={(assignments ?? []) as any}
      />
    </main>
  );
}