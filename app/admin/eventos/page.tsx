/**
 * Lista de eventos del admin
 *
 * URL: /admin/eventos
 * Muestra tabla con todos los eventos (según permisos RLS)
 * y enlaces para crear/editar.
 */
import { exigirAdmin, LABELS_ESTADO, COLORES_ESTADO, LABELS_ROL } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function EventosListaPage() {
  const usuario = await exigirAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: eventos } = await supabase
    .from('eventos')
    .select('id, titulo_eu, fecha_inicio, tipo, estado, destacado, organizador, created_by')
    .order('fecha_inicio', { ascending: false });

  return (
    <div className="animate-fade-in">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-gris-texto uppercase tracking-tight">
            Ekitaldiak
          </h1>
          <p className="text-sm text-gris-suave mt-1">
            {eventos?.length ?? 0} ekitaldi guztira
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-morado hover:bg-morado-oscuro text-white font-heading uppercase text-sm tracking-wide px-5 py-3 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ekitaldi berria
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gris-medio overflow-hidden">

        {(!eventos || eventos.length === 0) ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gris-medio mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gris-suave mb-4">Ez dago ekitaldirik oraindik</p>
            <Link
              href="/admin/eventos/nuevo"
              className="text-morado hover:underline text-sm font-medium"
            >
              Sortu lehen ekitaldia →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gris-claro border-b border-gris-medio">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gris-suave uppercase tracking-wider">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gris-suave uppercase tracking-wider">Izenburua</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gris-suave uppercase tracking-wider hidden md:table-cell">Antolatzailea</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gris-suave uppercase tracking-wider">Egoera</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gris-suave uppercase tracking-wider">Ekintzak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-medio">
                {eventos.map((evento) => {
                  const fecha = new Date(evento.fecha_inicio);
                  const fechaStr = fecha.toLocaleDateString('eu', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  const horaStr = fecha.toLocaleTimeString('eu', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={evento.id} className="hover:bg-gris-claro/50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gris-texto whitespace-nowrap">
                        <div className="font-medium">{fechaStr}</div>
                        <div className="text-xs text-gris-suave">{horaStr}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gris-texto flex items-center gap-2">
                          {evento.titulo_eu}
                          {evento.destacado && (
                            <span title="Nabarmendua">
                              <svg className="w-4 h-4 text-amarillo" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gris-suave">{evento.tipo}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gris-suave hidden md:table-cell">
                        {evento.organizador}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${COLORES_ESTADO[evento.estado]}`}>
                          {LABELS_ESTADO[evento.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/eventos/${evento.id}`}
                          className="text-morado hover:underline text-sm font-medium"
                        >
                          Editatu
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
