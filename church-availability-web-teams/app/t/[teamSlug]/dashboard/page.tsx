import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import AvailabilityGrid from './availability-grid';
import NameEditor from './name-editor';

export default async function DashboardPage({ params }: { params: { teamSlug: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', params.teamSlug)
    .single();

  if (!team) {
    redirect('/');
  }

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('auth_user_id', user!.id)
    .eq('team_id', team.id)
    .single();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('team_id', team.id)
    .gte('service_date', new Date().toISOString().slice(0, 10))
    .order('service_date', { ascending: true });

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('member_id', member?.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-1">{team.name}</p>

      {member?.is_coordinator && (
        <div className="mb-4">
          <a href={`/t/${params.teamSlug}/coordinator`} className="text-sm text-moss-600 underline">
            Go to coordinator view →
          </a>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400">{member?.full_name}</p>
        <NameEditor memberId={member!.id} currentName={member!.full_name} />
      </div>

      <h1 className="font-display text-3xl text-moss-900 mb-8">My availability</h1>
      <AvailabilityGrid
        memberId={member?.id}
        services={services ?? []}
        initialAvailability={availability ?? []}
      />
    </main>
  );
}
