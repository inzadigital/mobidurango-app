/**
 * Formulario de evento (crear/editar)
 *
 * Campos:
 *   - Bilingüe: título EU/ES, detalle EU/ES
 *   - Fechas inicio/fin
 *   - Tipo (semanal/puntual/mensual)
 *   - Categoría, lugar, organizador
 *   - Destacado (para web estática)
 *   - Estado (según rol)
 *
 * Permisos:
 *   - Admin: puede marcar como 'publicado' directamente
 *   - Editor: solo puede enviar como 'borrador' o 'pendiente_aprobacion'
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { UsuarioAdmin } from '@/lib/auth';

export interface EventoFormData {
  id?: string;
  titulo_eu: string;
  titulo_es: string;
  detalle_eu: string;
  detalle_es: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: 'semanal' | 'puntual' | 'mensual';
  categoria: string;
  lugar: string;
  direccion: string;
  organizador: string;
  destacado: boolean;
  estado: 'borrador' | 'pendiente_aprobacion' | 'publicado' | 'rechazado';
}

interface EventoFormProps {
  usuario: UsuarioAdmin;
  datosIniciales?: Partial<EventoFormData>;
  modo: 'crear' | 'editar';
}

const VALORES_DEFECTO: EventoFormData = {
  titulo_eu: '',
  titulo_es: '',
  detalle_eu: '',
  detalle_es: '',
  fecha_inicio: '',
  fecha_fin: '',
  tipo: 'puntual',
  categoria: '',
  lugar: '',
  direccion: '',
  organizador: 'Mobidurango',
  destacado: false,
  estado: 'borrador',
};

export function EventoForm({ usuario, datosIniciales, modo }: EventoFormProps) {
  const router = useRouter();
  const [datos, setDatos] = useState<EventoFormData>({
    ...VALORES_DEFECTO,
    ...datosIniciales,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esAdmin = usuario.rol === 'admin';

  function actualizar<K extends keyof EventoFormData>(
    campo: K,
    valor: EventoFormData[K]
  ) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(nuevoEstado: EventoFormData['estado']) {
    setError(null);
    setGuardando(true);

    const payload = {
      titulo_eu: datos.titulo_eu.trim(),
      titulo_es: datos.titulo_es.trim() || null,
      detalle_eu: datos.detalle_eu.trim() || null,
      detalle_es: datos.detalle_es.trim() || null,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin || null,
      tipo: datos.tipo,
      categoria: datos.categoria.trim() || null,
      lugar: datos.lugar.trim() || null,
      direccion: datos.direccion.trim() || null,
      organizador: datos.organizador.trim() || 'Mobidurango',
      destacado: datos.destacado,
      estado: nuevoEstado,
      created_by: usuario.id,
    };

    try {
      if (modo === 'crear') {
        const { error: err } = await supabase.from('eventos').insert(payload);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('eventos')
          .update(payload)
          .eq('id', datos.id!);
        if (err) throw err;
      }
      router.push('/admin/eventos');
      router.refresh();
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Errore bat gertatu da.');
      setGuardando(false);
    }
  }

  async function borrar() {
    if (!datos.id) return;
    if (!confirm('Ziur zaude ekitaldi hau ezabatu nahi duzula?')) return;

    setGuardando(true);
    const { error: err } = await supabase
      .from('eventos')
      .delete()
      .eq('id', datos.id);

    if (err) {
      setError(err.message);
      setGuardando(false);
      return;
    }

    router.push('/admin/eventos');
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 animate-fade-in"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl md:text-3xl text-gris-texto uppercase tracking-tight">
          {modo === 'crear' ? 'Ekitaldi berria' : 'Ekitaldia editatu'}
        </h1>
      </div>

      {/* Sección: contenido bilingüe */}
      <Seccion titulo="Edukia">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Campo label="Izenburua (EU)" requerido>
            <input
              type="text"
              required
              value={datos.titulo_eu}
              onChange={(e) => actualizar('titulo_eu', e.target.value)}
              className={inputClases}
              maxLength={200}
            />
          </Campo>
          <Campo label="Izenburua (ES)">
            <input
              type="text"
              value={datos.titulo_es}
              onChange={(e) => actualizar('titulo_es', e.target.value)}
              className={inputClases}
              maxLength={200}
            />
          </Campo>
          <Campo label="Xehetasuna (EU)">
            <textarea
              value={datos.detalle_eu}
              onChange={(e) => actualizar('detalle_eu', e.target.value)}
              className={`${inputClases} min-h-24`}
              rows={3}
              maxLength={2000}
            />
          </Campo>
          <Campo label="Xehetasuna (ES)">
            <textarea
              value={datos.detalle_es}
              onChange={(e) => actualizar('detalle_es', e.target.value)}
              className={`${inputClases} min-h-24`}
              rows={3}
              maxLength={2000}
            />
          </Campo>
        </div>
      </Seccion>

      {/* Sección: fechas y tipo */}
      <Seccion titulo="Data eta mota">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Campo label="Hasiera" requerido>
            <input
              type="datetime-local"
              required
              value={datos.fecha_inicio}
              onChange={(e) => actualizar('fecha_inicio', e.target.value)}
              className={inputClases}
            />
          </Campo>
          <Campo label="Amaiera">
            <input
              type="datetime-local"
              value={datos.fecha_fin}
              onChange={(e) => actualizar('fecha_fin', e.target.value)}
              className={inputClases}
            />
          </Campo>
          <Campo label="Mota">
            <select
              value={datos.tipo}
              onChange={(e) =>
                actualizar('tipo', e.target.value as EventoFormData['tipo'])
              }
              className={inputClases}
            >
              <option value="puntual">Puntuala</option>
              <option value="semanal">Astekoa</option>
              <option value="mensual">Hilekoa</option>
            </select>
          </Campo>
        </div>
      </Seccion>

      {/* Sección: lugar y organizador */}
      <Seccion titulo="Kokapena eta antolatzailea">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Campo label="Kategoria">
            <input
              type="text"
              value={datos.categoria}
              onChange={(e) => actualizar('categoria', e.target.value)}
              className={inputClases}
              placeholder="KOI, Ibilaldi, David Health..."
              maxLength={100}
            />
          </Campo>
          <Campo label="Lekua">
            <input
              type="text"
              value={datos.lugar}
              onChange={(e) => actualizar('lugar', e.target.value)}
              className={inputClases}
              placeholder="Landako 2, Kurutziaga..."
              maxLength={200}
            />
          </Campo>
          <Campo label="Helbidea">
            <input
              type="text"
              value={datos.direccion}
              onChange={(e) => actualizar('direccion', e.target.value)}
              className={inputClases}
              maxLength={300}
            />
          </Campo>
          <Campo label="Antolatzailea">
            <input
              type="text"
              value={datos.organizador}
              onChange={(e) => actualizar('organizador', e.target.value)}
              className={inputClases}
              maxLength={200}
            />
          </Campo>
        </div>
      </Seccion>

      {/* Sección: publicación */}
      <Seccion titulo="Argitaratzea">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={datos.destacado}
            onChange={(e) => actualizar('destacado', e.target.checked)}
            className="w-5 h-5 rounded border-gris-medio text-morado focus:ring-morado"
          />
          <div>
            <p className="font-medium text-gris-texto">Nabarmendua</p>
            <p className="text-xs text-gris-suave">
              Webgune estatikoan azalduko da "Hurrengo ekitaldi bereziak" ataleko zerrendan
            </p>
          </div>
        </label>
      </Seccion>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gris-medio">

        <button
          type="button"
          onClick={() => guardar('borrador')}
          disabled={guardando || !datos.titulo_eu || !datos.fecha_inicio}
          className="px-6 py-3 bg-gris-medio text-gris-texto font-medium rounded-lg hover:bg-gris-oscuro hover:text-white disabled:opacity-50 transition-colors"
        >
          Zirriborroa gorde
        </button>

        {!esAdmin && (
          <button
            type="button"
            onClick={() => guardar('pendiente_aprobacion')}
            disabled={guardando || !datos.titulo_eu || !datos.fecha_inicio}
            className="px-6 py-3 bg-amarillo text-gris-texto font-medium rounded-lg hover:brightness-95 disabled:opacity-50 transition-all"
          >
            Bidali onartzeko
          </button>
        )}

        {esAdmin && (
          <button
            type="button"
            onClick={() => guardar('publicado')}
            disabled={guardando || !datos.titulo_eu || !datos.fecha_inicio}
            className="px-6 py-3 bg-morado text-white font-medium rounded-lg hover:bg-morado-oscuro disabled:opacity-50 transition-colors"
          >
            Argitaratu
          </button>
        )}

        {modo === 'editar' && (
          <button
            type="button"
            onClick={borrar}
            disabled={guardando}
            className="ml-auto px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
          >
            Ezabatu
          </button>
        )}

      </div>
    </form>
  );
}

/* =========== Subcomponentes helpers =========== */

const inputClases =
  'w-full px-4 py-2.5 border border-gris-medio rounded-lg focus:ring-2 focus:ring-morado focus:border-morado transition-colors';

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gris-medio p-5 md:p-6">
      <h2 className="font-heading text-sm text-morado uppercase tracking-wider mb-5">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function Campo({
  label,
  children,
  requerido = false,
}: {
  label: string;
  children: React.ReactNode;
  requerido?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gris-texto mb-1.5">
        {label}
        {requerido && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
