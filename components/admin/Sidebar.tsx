/**
 * Sidebar del admin
 *
 * Client Component: importa solo de auth-types (seguro en navegador).
 */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UsuarioAdmin } from '@/lib/auth-types';
import { LABELS_ROL } from '@/lib/auth-types';

export function Sidebar({ usuario }: { usuario: UsuarioAdmin }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const enlaces = [
    {
      href: '/admin',
      label: 'Kontrol panela',
      icono: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: '/admin/eventos',
      label: 'Ekitaldiak',
      icono: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Botón hamburguesa (móvil) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-lg border border-gris-medio"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Menú"
      >
        <svg className="w-6 h-6 text-morado" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {menuAbierto ? (
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </button>

      {/* Overlay (móvil) */}
      {menuAbierto && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gris-medio
          flex flex-col transition-transform duration-200 ease-out
          ${menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >

        {/* Logo */}
        <div className="p-6 border-b border-gris-medio">
          <Link href="/admin" onClick={() => setMenuAbierto(false)}>
            <div className="bg-gradient-morado rounded-full px-4 py-2 inline-block">
              <Image
                src="/mobidurango-logo.jpg"
                alt="Mobidurango"
                width={160}
                height={50}
                className="h-8 w-auto"
              />
            </div>
          </Link>
          <p className="text-xs text-gris-suave mt-3 uppercase tracking-wider font-semibold">
            Administrazio eremua
          </p>
        </div>

        {/* Enlaces de navegación */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {enlaces.map((enlace) => {
              const activo = pathname === enlace.href
                || (enlace.href !== '/admin' && pathname.startsWith(enlace.href));

              return (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    onClick={() => setMenuAbierto(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${activo
                        ? 'bg-morado-claro text-morado'
                        : 'text-gris-texto hover:bg-gris-claro'
                      }
                    `}
                  >
                    {enlace.icono}
                    {enlace.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuario + logout */}
        <div className="p-4 border-t border-gris-medio">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-gris-texto truncate">
              {usuario.nombre || usuario.email}
            </p>
            <p className="text-xs text-gris-suave">
              {LABELS_ROL[usuario.rol]}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gris-suave hover:text-morado hover:bg-gris-claro rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Itxi saioa
          </button>
        </div>

      </aside>
    </>
  );
}
