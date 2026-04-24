/**
 * Editar evento existente
 * URL: /admin/eventos/[id]
 */
import { exigirAdmin, puedeEditarEvento } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { EventoForm } from '@/components/admin/EventoForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await exigirAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !evento) {
    notFound();
  }

  // Comprobar permisos de edición
  if (!puedeEditarEvento(usuario, evento.created_by)) {
    redirect('/admin/eventos');
  }

  // Convertir timestamptz a datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocalDatetime = (iso: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <EventoForm
      usuario={usuario}
      modo="editar"
      datosIniciales={{
        id: evento.id,
        titulo_eu: evento.titulo_eu || '',
        titulo_es: evento.titulo_es || '',
        detalle_eu: evento.detalle_eu || '',
        detalle_es: evento.detalle_es || '',
        fecha_inicio: toLocalDatetime(evento.fecha_inicio),
        fecha_fin: toLocalDatetime(evento.fecha_fin),
        tipo: evento.tipo,
        categoria: evento.categoria || '',
        lugar: evento.lugar || '',
        direccion: evento.direccion || '',
        organizador: evento.organizador || 'Mobidurango',
        destacado: evento.destacado,
        estado: evento.estado,
      }}
    />
  );
}
