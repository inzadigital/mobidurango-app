/**
 * Helpers de autenticación y autorización
 *
 * Funciones reutilizables para verificar si un usuario está logueado,
 * si tiene rol específico, y obtener información del usuario actual.
 *
 * SOLO para uso en servidor (Server Components, Route Handlers).
 */
import { createSupabaseServerClient } from './supabase-server';
import { redirect } from 'next/navigation';

export type Rol = 'admin' | 'editor_mobidurango' | 'editor_asociacion';

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  activo: boolean;
  asociacion_nombre: string | null;
}

/**
 * Obtiene el usuario actualmente autenticado + sus datos de admin_users.
 * Devuelve null si no está logueado o no es un usuario del staff.
 */
export async function getUsuarioAdmin(): Promise<UsuarioAdmin | null> {
  const supabase = await createSupabaseServerClient();

  // ¿Está autenticado?
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // ¿Está en admin_users?
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

/**
 * Devuelve true si el usuario es admin (no editor).
 */
export function esAdmin(usuario: UsuarioAdmin | null): boolean {
  return usuario?.rol === 'admin';
}

/**
 * Devuelve true si el usuario puede editar un evento concreto.
 * - Admins: pueden editar todo
 * - Editores: solo eventos creados por ellos
 */
export function puedeEditarEvento(
  usuario: UsuarioAdmin | null,
  eventoCreatedBy: string | null
): boolean {
  if (!usuario) return false;
  if (usuario.rol === 'admin') return true;
  return eventoCreatedBy === usuario.id;
}

/**
 * Etiquetas legibles de los roles (para mostrar en UI)
 */
export const LABELS_ROL: Record<Rol, string> = {
  admin: 'Administradorea',
  editor_mobidurango: 'Mobidurango editorea',
  editor_asociacion: 'Elkarteko editorea',
};

/**
 * Etiquetas legibles de los estados (para mostrar en UI)
 */
export const LABELS_ESTADO: Record<string, string> = {
  borrador: 'Zirriborroa',
  pendiente_aprobacion: 'Onartzeko',
  publicado: 'Argitaratuta',
  rechazado: 'Baztertuta',
};

/**
 * Colores para cada estado (Tailwind classes)
 */
export const COLORES_ESTADO: Record<string, string> = {
  borrador: 'bg-gray-200 text-gray-700',
  pendiente_aprobacion: 'bg-amarillo text-gris-texto',
  publicado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
};
