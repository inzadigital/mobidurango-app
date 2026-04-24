-- ============================================================
--  MOBIDURANGO - ESQUEMA DE BASE DE DATOS
--  Versión: 1.0 (Fase A)
-- ============================================================
--
--  Este script crea las tablas necesarias para la app de Mobidurango
--  con Row Level Security (RLS) configurado correctamente.
--
--  CÓMO EJECUTARLO:
--    1. Entra al dashboard de Supabase
--    2. Menú izquierdo → SQL Editor (icono >_)
--    3. Pega este SQL completo
--    4. Botón "Run" (o Ctrl+Enter)
--    5. Verifica en Table Editor que las tablas se crearon
--
--  IMPORTANTE:
--    - Este script es IDEMPOTENTE (puede ejecutarse varias veces sin problema)
--    - Crea las tablas, políticas RLS y datos de ejemplo básicos
--    - NO crea usuarios admin (eso se hace manualmente en Authentication)
-- ============================================================


-- ============================================================
--  TABLA: admin_users
--  Lista blanca de usuarios con permisos de administración.
--  Solo quienes están en esta tabla pueden gestionar eventos.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT NOT NULL DEFAULT 'admin' CHECK (rol IN ('admin', 'editor')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_users IS
  'Lista blanca de usuarios con permisos de administración';


-- ============================================================
--  TABLA: eventos
--  Todos los eventos del calendario Mobidurango.
--  Incluye actividades recurrentes y eventos puntuales.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido bilingüe (euskera principal, castellano opcional)
  titulo_eu TEXT NOT NULL,
  titulo_es TEXT,
  detalle_eu TEXT,
  detalle_es TEXT,

  -- Fechas
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,

  -- Clasificación
  tipo TEXT NOT NULL DEFAULT 'puntual'
    CHECK (tipo IN ('semanal', 'puntual', 'mensual')),
  categoria TEXT,  -- libre: "KOI", "Ibilaldi", "David Health", "Charla", etc.

  -- Ubicación
  lugar TEXT,
  direccion TEXT,

  -- Organizador (para cuando metamos eventos de asociaciones)
  organizador TEXT DEFAULT 'Mobidurango',

  -- Publicación y destacados
  published BOOLEAN NOT NULL DEFAULT false,  -- solo los true aparecen
  destacado BOOLEAN NOT NULL DEFAULT false,  -- aparece en web estática

  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS eventos_fecha_idx
  ON public.eventos (fecha_inicio);
CREATE INDEX IF NOT EXISTS eventos_published_idx
  ON public.eventos (published) WHERE published = true;
CREATE INDEX IF NOT EXISTS eventos_destacado_idx
  ON public.eventos (destacado) WHERE destacado = true;
CREATE INDEX IF NOT EXISTS eventos_tipo_idx
  ON public.eventos (tipo);

COMMENT ON TABLE public.eventos IS
  'Eventos del calendario Mobidurango (recurrentes y puntuales)';
COMMENT ON COLUMN public.eventos.destacado IS
  'Si es true, aparece en la web estática de durangokirolak.net';


-- ============================================================
--  TABLA: chat_historial (preparada para Fase D)
--  Guarda las conversaciones del admin con el asistente IA.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensajes JSONB NOT NULL DEFAULT '[]'::jsonb,
  resumen TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_historial_admin_idx
  ON public.chat_historial (admin_id);

COMMENT ON TABLE public.chat_historial IS
  'Historial de conversaciones con el asistente IA (Fase D)';


-- ============================================================
--  FUNCIÓN AUXILIAR: is_admin()
--  Devuelve true si el usuario autenticado está en admin_users
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND activo = true
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Devuelve true si el usuario autenticado es admin activo';


-- ============================================================
--  FUNCIÓN AUXILIAR: trigger para updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- Aplicar el trigger a las tablas que tienen updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.admin_users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.eventos;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.chat_historial;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.chat_historial
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();


-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--
--  Activamos RLS en todas las tablas y definimos qué
--  puede hacer cada "rol" (anon, authenticated, admin).
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_historial ENABLE ROW LEVEL SECURITY;


-- ============================================================
--  POLÍTICAS: admin_users
-- ============================================================

-- Solo el propio admin puede verse a sí mismo
DROP POLICY IF EXISTS "Admins ven su propio registro"
  ON public.admin_users;
CREATE POLICY "Admins ven su propio registro"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Nadie puede modificar admin_users desde la API (solo desde dashboard Supabase)
-- (no hay policy de INSERT, UPDATE, DELETE → todo bloqueado por defecto)


-- ============================================================
--  POLÍTICAS: eventos
-- ============================================================

-- LECTURA: cualquiera puede ver eventos publicados
DROP POLICY IF EXISTS "Cualquiera lee eventos publicados"
  ON public.eventos;
CREATE POLICY "Cualquiera lee eventos publicados"
  ON public.eventos FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- LECTURA ADMIN: los admins ven TODOS los eventos (incluso borradores)
DROP POLICY IF EXISTS "Admins leen todos los eventos"
  ON public.eventos;
CREATE POLICY "Admins leen todos los eventos"
  ON public.eventos FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ESCRITURA: solo admins crean eventos
DROP POLICY IF EXISTS "Admins crean eventos"
  ON public.eventos;
CREATE POLICY "Admins crean eventos"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ACTUALIZACIÓN: solo admins actualizan eventos
DROP POLICY IF EXISTS "Admins actualizan eventos"
  ON public.eventos;
CREATE POLICY "Admins actualizan eventos"
  ON public.eventos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- BORRADO: solo admins borran eventos
DROP POLICY IF EXISTS "Admins borran eventos"
  ON public.eventos;
CREATE POLICY "Admins borran eventos"
  ON public.eventos FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
--  POLÍTICAS: chat_historial
-- ============================================================

-- Cada admin solo ve SUS propios chats
DROP POLICY IF EXISTS "Admins ven sus chats"
  ON public.chat_historial;
CREATE POLICY "Admins ven sus chats"
  ON public.chat_historial FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());

-- Cada admin solo crea sus propios chats
DROP POLICY IF EXISTS "Admins crean sus chats"
  ON public.chat_historial;
CREATE POLICY "Admins crean sus chats"
  ON public.chat_historial FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.is_admin());

-- Cada admin solo actualiza sus propios chats
DROP POLICY IF EXISTS "Admins actualizan sus chats"
  ON public.chat_historial;
CREATE POLICY "Admins actualizan sus chats"
  ON public.chat_historial FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());

-- Cada admin solo borra sus propios chats
DROP POLICY IF EXISTS "Admins borran sus chats"
  ON public.chat_historial;
CREATE POLICY "Admins borran sus chats"
  ON public.chat_historial FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid() AND public.is_admin());


-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================

-- Mostrar resumen de lo creado (útil al ejecutar)
SELECT 'admin_users' AS tabla, COUNT(*) AS registros FROM public.admin_users
UNION ALL
SELECT 'eventos', COUNT(*) FROM public.eventos
UNION ALL
SELECT 'chat_historial', COUNT(*) FROM public.chat_historial;
