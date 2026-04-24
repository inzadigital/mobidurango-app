/**
 * Cliente Supabase para el servidor (SSR)
 *
 * Este cliente se usa en:
 *   - Server Components (app/admin/.../page.tsx)
 *   - Route Handlers (app/api/.../route.ts)
 *   - Server Actions
 *
 * Gestiona cookies automáticamente, lo que permite mantener
 * la sesión del usuario entre peticiones.
 */
import { createServerClient } from '@supabase/ssr';
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // El "setAll" se llama desde Server Components a veces.
            // Esto se ignora porque middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}
