import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const supabase = await createClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/t/${teamSlug}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/t/${teamSlug}/login?error=session_failed`);
  }

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', teamSlug)
    .single();

  if (team) {
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('team_id', team.id)
      .maybeSingle();

    if (!existingMember) {
      const { count } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('team_id', team.id);

      const isFirstMember = (count ?? 0) === 0;

      await supabase.from('members').insert({
        auth_user_id: user.id,
        team_id: team.id,
        full_name: user.email?.split('@')[0] ?? 'New member',
        roles: [],
        is_coordinator: isFirstMember,
      });
    }
  }

  return NextResponse.redirect(`${origin}/t/${teamSlug}/dashboard`);
}