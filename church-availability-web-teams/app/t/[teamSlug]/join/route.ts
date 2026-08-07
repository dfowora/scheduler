import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?redirect=${encodeURIComponent(`/t/${teamSlug}/join`)}`
    );
  }

  const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single();

  if (!team) {
    return NextResponse.redirect(`${origin}/`);
  }

  const { data: existingMember } = await supabase
    .from('members')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('team_id', team.id)
    .maybeSingle();

  if (!existingMember) {
    const { data: memberCount } = await supabase.rpc('team_member_count', {
      check_team_id: team.id,
    });

    await supabase.from('members').upsert(
      {
        auth_user_id: user.id,
        team_id: team.id,
        full_name: user.email?.split('@')[0] ?? 'New member',
        roles: [],
        is_coordinator: (memberCount ?? 0) === 0,
      },
      { onConflict: 'auth_user_id,team_id', ignoreDuplicates: true }
    );
  }

  return NextResponse.redirect(`${origin}/t/${teamSlug}/dashboard`);
}