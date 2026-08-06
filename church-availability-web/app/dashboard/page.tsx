import { createClient } from '../../lib/supabase/server';
import AvailabilityGrid from './availability-grid';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('auth_user_id', user!.id)
    .single();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .gte('service_date', new Date().toISOString().slice(0, 10))
    .order('service_date', { ascending: true });

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('member_id', member?.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">
        {member?.full_name}
      </p>
      <h1 className="font-display text-3xl text-moss-900 mb-8">My availability</h1>
      <AvailabilityGrid
        memberId={member?.id}
        services={services ?? []}
        initialAvailability={availability ?? []}
      />
    </main>
  );
}
