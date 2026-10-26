import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the auth session cookie if needed.
  const { data } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if ((path.startsWith('/profile') || path.startsWith('/admin')) && !data.user) {
    const to = request.nextUrl.clone();
    to.pathname = '/signin';
    to.searchParams.set('next', path);
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  // Skip static files. The public review pages stay fast: no redirect logic applies to them.
  matcher: ['/((?!_next/static|_next/image|icon.png|apple-icon.png|logo.png|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
};
