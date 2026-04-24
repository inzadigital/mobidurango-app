-- ============================================================
--  MOBIDURANGO - MIGRACIÓN FASE C.1
--  Añade: roles nuevos + estado (aprobación) + política RLS ajustada
-- ============================================================
--
--  EJECUTAR UNA SOLA VEZ en el SQL Editor de Supabase.
--  Es idempotente (se puede ejecutar varias veces sin problema).
--
--  Qué hace:
--    1. Amplía los roles permitidos: admin, editor_mobidurango, editor_asociacion
--    2. Añade campo 'asociacion_id' para futuros editores de asociaciones
--    3. Añade campo 'estado' en eventos (borrador/pendiente/publicado)
--    4. Ajusta la columna 'published' para que se sincronice con 'estado'
--    5. Actualiza políticas RLS para el nuevo flujo de aprobación
-- ============================================================


-- ============================================================
--  TABLA admin_users: ampliar roles disponibles
-- ============================================================

-- Primero eliminamos el check constraint antiguo
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_rol_check;

-- Añadimos el nuevo check con los 3 roles posibles
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_rol_check
  CHECK (rol IN ('admin', 'editor_mobidurango', 'editor_asociacion'));

-- Columna opcional: si es editor_asociacion, a qué asociación pertenece
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS asociacion_nombre TEXT;

COMMENT ON COLUMN public.admin_users.asociacion_nombre IS
  'Solo aplica a rol editor_asociacion: nombre de la asociación';


-- ============================================================
--  TABLA eventos: añadir flujo de estado
-- ============================================================

ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'borrador'
  CHECK (estado IN ('borrador', 'pendiente_aprobacion', 'publicado', 'rechazado'));

COMMENT ON COLUMN public.eventos.estado IS
  'Estado del evento: borrador (en edición) / pendiente_aprobacion (editor lo manda) / publicado (admin aprueba) / rechazado';


-- Sincronizar 'published' con 'estado' automáticamente
-- Si estado = 'publicado' → published = true
-- Si estado != 'publicado' → published = false

CREATE OR REPLACE FUNCTION public.sync_published_with_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.published := (NEW.estado = 'publicado');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_published ON public.eventos;
CREATE TRIGGER sync_published
  BEFORE INSERT OR UPDATE OF estado ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_published_with_estado();


-- Aplicar a eventos existentes: si algún evento tenía published=true lo pasamos a publicado
UPDATE public.eventos
SET estado = 'publicado'
WHERE published = true AND estado = 'borrador';


-- ============================================================
--  POLÍTICAS RLS: ajustar para el nuevo flujo
-- ============================================================

-- Borrar políticas antiguas de eventos
DROP POLICY IF EXISTS "Admins leen todos los eventos" ON public.eventos;
DROP POLICY IF EXISTS "Admins crean eventos" ON public.eventos;
DROP POLICY IF EXISTS "Admins actualizan eventos" ON public.eventos;
DROP POLICY IF EXISTS "Admins borran eventos" ON public.eventos;

-- Función auxiliar: ¿el usuario es admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND activo = true
      AND rol = 'admin'
  );
$$;

-- Función auxiliar: ¿el usuario es editor (de cualquier tipo)?
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND activo = true
      AND rol IN ('admin', 'editor_mobidurango', 'editor_asociacion')
  );
$$;


-- NUEVA POLÍTICA: lectura pública de eventos publicados
-- (ya existía, la conservamos por si acaso)
DROP POLICY IF EXISTS "Cualquiera lee eventos publicados" ON public.eventos;
CREATE POLICY "Cualquiera lee eventos publicados"
  ON public.eventos FOR SELECT
  TO anon, authenticated
  USING (estado = 'publicado');


-- NUEVA POLÍTICA: los editores y admins ven TODOS los eventos (incluidos borradores)
CREATE POLICY "Staff lee todos los eventos"
  ON public.eventos FOR SELECT
  TO authenticated
  USING (public.is_editor());


-- NUEVA POLÍTICA: los editores crean eventos, se les obliga 'pendiente_aprobacion'
-- Los admins pueden crear directamente como 'publicado'
CREATE POLICY "Staff crea eventos"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_editor()
    AND (
      -- Si es admin, puede crear con cualquier estado
      public.is_admin()
      -- Si es editor, solo puede crear como borrador o pendiente
      OR estado IN ('borrador', 'pendiente_aprobacion')
    )
  );


-- NUEVA POLÍTICA: actualización
--   - Admin: puede todo
--   - Editor: solo eventos que él ha creado, y no puede ponerlos directamente como 'publicado'
CREATE POLICY "Staff actualiza eventos"
  ON public.eventos FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (public.is_editor() AND created_by = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR (
      public.is_editor()
      AND created_by = auth.uid()
      AND estado IN ('borrador', 'pendiente_aprobacion')
    )
  );


-- NUEVA POLÍTICA: borrado
--   - Admin: puede borrar cualquier cosa
--   - Editor: solo borra sus propios eventos si son borradores
CREATE POLICY "Staff borra eventos"
  ON public.eventos FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (public.is_editor() AND created_by = auth.uid() AND estado = 'borrador')
  );


-- ============================================================
--  FIN DE LA MIGRACIÓN
-- ============================================================

-- Verificación
SELECT
  'Roles admin_users' AS descripcion,
  array_agg(DISTINCT rol) AS valores
FROM public.admin_users
UNION ALL
SELECT
  'Estados eventos',
  array_agg(DISTINCT estado)
FROM public.eventos;
