/**
 * Cliente Supabase para el navegador (browser)
 *
 * Este es el cliente que usan los Client Components ('use client').
 * Gestiona las cookies automáticamente para mantener la sesión.
 *
 * NOTA: este archivo sustituye al antiguo lib/supabase.ts
 * que usaba @supabase/supabase-js. Ahora usamos @supabase/ssr
 * que funciona mejor con Next.js App Router.
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export directo para compatibilidad con código existente
export const supabase = createSupabaseBrowserClient();
