/**
 * Cliente de Supabase
 *
 * Este archivo centraliza toda la conexión con la base de datos.
 * Si algún día cambiamos de proveedor, solo tocamos este archivo.
 *
 * Hay dos clientes:
 *
 * 1. supabase (público, para frontend)
 *    - Usa la clave publishable (anon)
 *    - Respeta Row Level Security (RLS)
 *    - Se puede usar en cualquier parte de la app
 *
 * 2. supabaseAdmin (secreto, SOLO servidor)
 *    - Usa la service_role key
 *    - Bypassea RLS
 *    - NUNCA llamar desde componentes de cliente
 *    - Solo para endpoints /api o scripts internos
 */
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Verificación temprana: si faltan las variables, avisar claro
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Revisa tu .env.local o las variables en Vercel.'
  );
}

/**
 * Cliente público de Supabase.
 * Usar este en todos los componentes y páginas normales.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Cliente admin (SOLO para uso en servidor).
 * Usar con cuidado. Bypassea RLS.
 *
 * Esta función crea el cliente solo si se llama desde servidor,
 * y solo si la service_role key está configurada.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está configurada. Se requiere para operaciones admin.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
