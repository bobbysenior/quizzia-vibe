import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Next.js restricts cookie modification to Server Actions / Route Handlers.
          // Supabase may attempt to set cookies during token refresh. We gracefully ignore
          // errors here to avoid breaking server components.
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options);
            } catch (e) {
              // Silently ignore – cookie setting is not allowed in this context.
            }
          }
        },
      },
    }
  );
}
