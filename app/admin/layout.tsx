/**
 * Layout del área admin
 *
 * Este layout envuelve TODAS las páginas bajo /admin/*
 * (excepto /admin/login, que tiene su propio diseño).
 *
 * Incluye:
 *   - Sidebar con navegación
 *   - Cabecera con info del usuario logueado
 *   - Botón logout
 */
import { exigirAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Si no está logueado, esto redirige a /admin/login
  const usuario = await exigirAdmin();

  return (
    <div className="min-h-screen bg-gris-claro flex">

      {/* Sidebar (fijo en desktop, colapsable en móvil) */}
      <Sidebar usuario={usuario} />

      {/* Contenido principal */}
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
