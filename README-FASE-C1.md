# Mobidurango — Fase C.1 (Admin CRUD)

Panel admin con login, CRUD de eventos, roles y flujo de aprobación.

## Archivos que añade este paquete

```
app/admin/layout.tsx
app/admin/page.tsx                       (dashboard)
app/admin/login/page.tsx
app/admin/eventos/page.tsx               (lista)
app/admin/eventos/nuevo/page.tsx
app/admin/eventos/[id]/page.tsx          (editar)

components/admin/Sidebar.tsx
components/admin/EventoForm.tsx

lib/supabase.ts                          (REEMPLAZA el existente - ahora usa @supabase/ssr)
lib/supabase-server.ts                   (nuevo)
lib/auth.ts                              (nuevo)

middleware.ts                            (nuevo - raíz del proyecto)
package.json                             (REEMPLAZA - next 15.2.4 + @supabase/ssr)

supabase/migration-c1.sql                (ejecutar en Supabase SQL Editor)
```

## Despliegue (3 pasos)

### 1. Ejecutar migración SQL

Supabase → SQL Editor → pegar `supabase/migration-c1.sql` → Run.

Añade: roles (`editor_mobidurango`, `editor_asociacion`), columna `estado`, trigger sync con `published`, políticas RLS actualizadas.

Idempotente. Verifica al final con el SELECT que devuelve los roles/estados existentes.

### 2. Subir archivos a GitHub

Drag-and-drop en github.com/inzadigital/mobidurango-app/upload/main.

Cuidado al **reemplazar** `lib/supabase.ts` y `package.json` (GitHub te avisará). Los demás son nuevos.

Commit message: `Fase C.1: admin CRUD`

### 3. Verificar deploy

Vercel detecta el push automáticamente.

- `https://mobidurango.vercel.app/admin/login` → formulario
- Login con `iinza@durangokirolak.net` + tu password
- Redirige a `/admin` → dashboard con 4 tarjetas
- `/admin/eventos` → tabla vacía + botón "Ekitaldi berria"
- `/admin/eventos/nuevo` → formulario completo

## Permisos

Tu usuario ya está en `admin_users` con rol `admin` (del `add-admin.sql` de Fase A). El rol sigue siendo válido después de la migración (el CHECK se actualiza para permitir los 3 roles, `admin` sigue estando permitido).

## Añadir usuario Athlon más adelante

1. Authentication → Users → Add user (email + password, Auto Confirm)
2. SQL Editor:
   ```sql
   INSERT INTO public.admin_users (id, email, nombre, rol, activo)
   SELECT id, email, 'Nombre', 'editor_mobidurango', true
   FROM auth.users
   WHERE email = 'email_de_athlon@ejemplo.com'
   ON CONFLICT (id) DO UPDATE SET rol = 'editor_mobidurango', activo = true;
   ```

## Flujo de aprobación

- Editor crea evento → estado `borrador` o `pendiente_aprobacion`
- Admin ve pendientes en dashboard (tarjeta amarilla destacada)
- Admin edita y cambia estado a `publicado` → trigger sincroniza `published = true`
- Solo eventos con `estado = 'publicado'` son visibles en `/api/eventos-destacados`

## Próxima fase (C.2)

Upload de PDF/Excel con Claude para extracción automática de eventos.
