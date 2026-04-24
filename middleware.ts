/**
 * Middleware de Next.js
 *
 * Se ejecuta ANTES de cada petición a rutas protegidas.
 * Su trabajo es:
 *   1. Refrescar la sesión de Supabase (si está caducando)
 *   2. Redirigir al login si alguien intenta entrar en /admin sin estar logueado
 *
 * Se aplica solo a las rutas que coincidan con el "matcher" al final.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar sesión (IMPORTANTE para que expiración automática funcione)
  const { data: { user } } = await supabase.auth.getUser();

  // Protección de rutas /admin (excepto /admin/login)
  const url = request.nextUrl.pathname;
  const esAdminProtegido = url.startsWith('/admin') && url !== '/admin/login';

  if (esAdminProtegido && !user) {
    // No logueado → redirigir a login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está logueado e intenta ir a /admin/login → mandarlo a /admin
  if (url === '/admin/login' && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = '/admin';
    return NextResponse.redirect(adminUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     *   - _next/static (archivos estáticos)
     *   - _next/image (optimización de imágenes)
     *   - favicon.ico, etc.
     *   - api/* (ya tienen su propia lógica)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
