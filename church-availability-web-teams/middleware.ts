import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // pathname looks like /t/<teamSlug>/dashboard/... or /t/<teamSlug>/coordinator/...
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const isTeamProtectedRoute =
    segments[0] === 't' && (segments[2] === 'dashboard' || segments[2] === 'coordinator');

  if (!user && isTeamProtectedRoute) {
    const teamSlug = segments[1];
    const url = request.nextUrl.clone();
    url.pathname = `/t/${teamSlug}/login`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/t/:team/dashboard/:path*', '/t/:team/coordinator/:path*'],
};
