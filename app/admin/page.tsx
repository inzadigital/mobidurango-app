/**
 * Dashboard del admin
 *
 * URL: /admin
 * Muestra resumen con:
 *   - Saludo al usuario
 *   - Cards con cifras rápidas (eventos totales, pendientes de aprobación, etc.)
 *   - Accesos rápidos
 */
import { exigirAdmin, esAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const usuario = await exigirAdmin();
  const supabase = await createSupabaseServerClient();

  // Contar eventos por estado
  const { count: totalEventos } = await supabase
    .from('eventos')
    .select('*', { count: 'exact', head: true });

  const { count: publicados } = await supabase
    .from('eventos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'publicado');

  const { count: pendientes } = await supabase
    .from('eventos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente_aprobacion');

  const { count: borradores } = await supabase
    .from('eventos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'borrador');

  return (
    <div className="animate-fade-in">

      {/* Cabecera */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl md:text-4xl text-gris-texto uppercase tracking-tight mb-2">
          Kaixo, {usuario.nombre || usuario.email.split('@')[0]}
        </h1>
        <p className="text-gris-suave">
          Ongi etorri Mobidurango kudeaketa panelera.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

        <Tarjeta
          label="Ekitaldiak guztira"
          valor={totalEventos ?? 0}
          color="morado"
        />

        <Tarjeta
          label="Argitaratuta"
          valor={publicados ?? 0}
          color="verde"
        />

        {esAdmin(usuario) && (
          <Tarjeta
            label="Onartzeko"
            valor={pendientes ?? 0}
            color="amarillo"
            destacar={(pendientes ?? 0) > 0}
          />
        )}

        <Tarjeta
          label="Zirriborroak"
          valor={borradores ?? 0}
          color="gris"
        />

      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Link
          href="/admin/eventos/nuevo"
          className="bg-morado hover:bg-morado-oscuro text-white p-6 rounded-xl transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-heading text-lg uppercase mb-1">
            Ekitaldi berria
          </h2>
          <p className="text-sm opacity-90">
            Sortu ekitaldi berri bat eskuz
          </p>
        </Link>

        <Link
          href="/admin/eventos"
          className="bg-white border-2 border-gris-medio hover:border-morado text-gris-texto p-6 rounded-xl transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-morado-claro text-morado rounded-lg p-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gris-suave group-hover:text-morado group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-heading text-lg uppercase mb-1">
            Ekitaldiak ikusi
          </h2>
          <p className="text-sm text-gris-suave">
            Kudeatu dauden ekitaldi guztiak
          </p>
        </Link>

      </div>

    </div>
  );
}


/* =========================================================
   Subcomponente: tarjeta de métrica
   ========================================================= */
function Tarjeta({
  label,
  valor,
  color,
  destacar = false,
}: {
  label: string;
  valor: number;
  color: 'morado' | 'verde' | 'amarillo' | 'gris';
  destacar?: boolean;
}) {
  const colorClases = {
    morado: 'text-morado',
    verde: 'text-green-600',
    amarillo: 'text-yellow-600',
    gris: 'text-gris-oscuro',
  };

  return (
    <div className={`
      bg-white rounded-xl p-5 border transition-all
      ${destacar ? 'border-amarillo shadow-lg ring-2 ring-amarillo/30' : 'border-gris-medio'}
    `}>
      <p className="text-xs text-gris-suave uppercase tracking-wider mb-2 font-semibold">
        {label}
      </p>
      <p className={`font-heading text-4xl ${colorClases[color]}`}>
        {valor}
      </p>
    </div>
  );
}
