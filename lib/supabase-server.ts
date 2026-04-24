import 'server-only';

/**
 * Cliente Supabase para el servidor (SSR)
 *
 * Este cliente se usa en:
 *   - Server Components (app/admin/.../page.tsx)
 *   - Route Handlers (app/api/.../route.ts)
 *   - Server Actions
 *
 * La directiva `server-only` arriba garantiza que este archivo
 * NUNCA será incluido en el bundle del navegador.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components pueden llamar setAll pero no pueden modificar cookies.
            // El middleware ya refresca la sesión, así que ignoramos el error aquí.
          }
        },
      },
    }
  );
}
