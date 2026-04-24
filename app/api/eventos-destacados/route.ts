/**
 * Endpoint: /api/eventos-destacados
 *
 * Este endpoint lo CONSUME la web estática de durangokirolak.net
 * Se llama desde el script JavaScript que añadimos en la web estática:
 *   fetch('https://mobidurango.vercel.app/api/eventos-destacados')
 *
 * Devuelve los próximos eventos destacados (máximo 3) en formato JSON:
 * [
 *   { fecha: "15 maiatza",
 *     titulo: "Ibilaldi berezia",
 *     detalle: "Kurutziagatik irteera 10:00etan" },
 *   ...
 * ]
 *
 * CORS ya está configurado en next.config.js (Access-Control-Allow-Origin: *)
 * así que la web estática puede llamarlo sin problemas.
 *
 * IMPORTANTE: este endpoint usa el cliente público (anon key).
 * Solo devolverá eventos con published=true gracias a las reglas RLS.
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Cache durante 5 minutos (reduce carga en Supabase)
export const revalidate = 300;

export async function GET() {
  try {
    // Consulta: próximos eventos destacados publicados
    const hoy = new Date().toISOString();

    const { data, error } = await supabase
      .from('eventos')
      .select('fecha_inicio, titulo_eu, titulo_es, detalle_eu, detalle_es')
      .eq('published', true)
      .eq('destacado', true)
      .gte('fecha_inicio', hoy)
      .order('fecha_inicio', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error consultando eventos destacados:', error);
      // Devolver array vacío en lugar de error para no romper la web estática
      return NextResponse.json([], { status: 200 });
    }

    // Si no hay datos, devolver array vacío (la web estática oculta la sección)
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Formatear los datos en el formato que espera la web estática
    const eventos = data.map((evento) => ({
      fecha: formatearFecha(evento.fecha_inicio),
      titulo: evento.titulo_eu || '',
      detalle: evento.detalle_eu || '',
    }));

    return NextResponse.json(eventos, { status: 200 });

  } catch (error) {
    console.error('Error inesperado en /api/eventos-destacados:', error);
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * Formatea una fecha ISO (2026-05-15T10:00:00.000Z) a formato euskera
 * Ejemplo: "15 maiatza"
 */
function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const dia = fecha.getDate();

  const meses = [
    'urtarrila', 'otsaila', 'martxoa', 'apirila',
    'maiatza', 'ekaina', 'uztaila', 'abuztua',
    'iraila', 'urria', 'azaroa', 'abendua',
  ];
  const mes = meses[fecha.getMonth()];

  return `${dia} ${mes}`;
}

/**
 * OPTIONS: preflight de CORS.
 * Aunque Next.js ya lo gestiona con los headers de next.config.js,
 * añadir OPTIONS explícito ayuda en algunos navegadores.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
