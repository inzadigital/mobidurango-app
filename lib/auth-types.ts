/**
 * Tipos y constantes compartidos entre servidor y cliente.
 *
 * Este archivo NO importa nada de servidor (cookies, headers, etc.)
 * por lo que puede ser usado desde Client Components sin problemas.
 */

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

/**
 * Devuelve true si el usuario es admin (no editor).
 * Función pura, sin lado de servidor.
 */
export function esAdmin(usuario: UsuarioAdmin | null): boolean {
  return usuario?.rol === 'admin';
}

/**
 * Devuelve true si el usuario puede editar un evento concreto.
 * Función pura, sin lado de servidor.
 */
export function puedeEditarEvento(
  usuario: UsuarioAdmin | null,
  eventoCreatedBy: string | null
): boolean {
  if (!usuario) return false;
  if (usuario.rol === 'admin') return true;
  return eventoCreatedBy === usuario.id;
}
