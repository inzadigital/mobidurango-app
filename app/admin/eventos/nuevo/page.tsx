/**
 * Crear evento nuevo
 * URL: /admin/eventos/nuevo
 */
import { exigirAdmin } from '@/lib/auth';
import { EventoForm } from '@/components/admin/EventoForm';

export default async function NuevoEventoPage() {
  const usuario = await exigirAdmin();

  return <EventoForm usuario={usuario} modo="crear" />;
}
