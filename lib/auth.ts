import 'server-only';

/**
 * Helpers de autenticación y autorización — SOLO SERVIDOR.
 *
 * Este archivo usa cookies de Next.js, por lo que solo puede ser
 * usado desde Server Components, Route Handlers o Server Actions.
 *
 * Los tipos y helpers puros (UsuarioAdmin, Rol, LABELS_*, esAdmin,
 * puedeEditarEvento) están en ./auth-types.ts y se pueden usar
 * desde cualquier sitio.
 */
import { createSupabaseServerClient } from './supabase-server';
import { redirect } from 'next/navigation';
import type { UsuarioAdmin } from './auth-types';

// Re-exportar los tipos/constantes/funciones puras para que quien
// ya importaba de aquí no tenga que cambiar el import.
export type { Rol, UsuarioAdmin } from './auth-types';
export {
  LABELS_ROL,
  LABELS_ESTADO,
  COLORES_ESTADO,
  esAdmin,
  puedeEditarEvento,
} from './auth-types';

/**
 * Obtiene el usuario actualmente autenticado + sus datos de admin_users.
 * Devuelve null si no está logueado o no es un usuario del staff.
 */
export async function getUsuarioAdmin(): Promise<UsuarioAdmin | null> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminData, error } = await supabase
    .from('admin_users')
    .select('id, email, nombre, rol, activo, asociacion_nombre')
    .eq('id', user.id)
    .eq('activo', true)
    .single();

  if (error || !adminData) return null;

  return adminData as UsuarioAdmin;
}

/**
 * Exige que haya un usuario admin logueado.
 * Si no, redirige al login.
 */
export async function exigirAdmin(): Promise<UsuarioAdmin> {
  const usuario = await getUsuarioAdmin();

  if (!usuario) {
    redirect('/admin/login');
  }

  return usuario;
}

/**
 * Exige rol de admin (no editor).
 * Si no, redirige al dashboard general.
 */
export async function exigirRolAdmin(): Promise<UsuarioAdmin> {
  const usuario = await exigirAdmin();

  if (usuario.rol !== 'admin') {
    redirect('/admin');
  }

  return usuario;
}
