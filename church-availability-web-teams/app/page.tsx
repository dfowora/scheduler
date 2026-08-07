import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import SignOutButton from './sign-out-button';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: memberships } = await supabase
    .from('members')
    .select('*, team:teams(*)')
    .eq('auth_user_id', user.id);

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400">{user.email}</p>
        <SignOutButton />
      </div>
      <h1 className="font-display text-3xl text-moss-900 mb-8">Your teams</h1>

      {!memberships || memberships.length === 0 ? (
        <p className="text-moss-400 mb-8">You're not part of any team yet.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {memberships.map((m: any) => (
            
              key={m.id}
              href={`/t/${m.team.slug}/dashboard`}
              className="block border border-moss-100 rounded-lg px-4 py-3 bg-white hover:bg-moss-50 transition-colors"
            >
              <span className="font-medium text-ink">{m.team.name}</span>
              {m.is_coordinator && (
                <span className="ml-2 text-xs text-gold uppercase tracking-wide">Coordinator</span>
              )}
            </a>
          ))}
        </div>
      )}

      
        href="/new-team"
        className="inline-block bg-moss-600 text-parchment rounded-lg px-5 py-3 font-medium hover:bg-moss-900 transition-colors"
      >
        Create a new team
      </a>
    </main>
  );
}