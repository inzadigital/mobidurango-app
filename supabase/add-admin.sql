-- ============================================================
--  MOBIDURANGO - AÑADIR ADMIN INICIAL
-- ============================================================
--
--  Este script añade a iinza@durangokirolak.net como admin.
--
--  PREREQUISITO:
--    Primero tienes que haber creado el usuario desde
--    Authentication → Users → Add user en el dashboard de Supabase
--    con el email: iinza@durangokirolak.net
--
--  CÓMO USARLO:
--    1. Crea el usuario en Authentication (si no lo has hecho)
--    2. Ejecuta este script en SQL Editor
--    3. El usuario pasará a la lista de admins
-- ============================================================


-- Añadir el admin principal
-- Busca el UUID del usuario en auth.users por su email
-- y lo inserta en public.admin_users

INSERT INTO public.admin_users (id, email, nombre, rol, activo)
SELECT
  id,
  email,
  'Iñaki Inza' AS nombre,  -- Ajustar si es otro nombre
  'admin' AS rol,
  true AS activo
FROM auth.users
WHERE email = 'iinza@durangokirolak.net'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();


-- Verificar que se añadió correctamente
SELECT id, email, nombre, rol, activo, created_at
FROM public.admin_users
ORDER BY created_at DESC;
