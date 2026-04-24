# Mobidurango App

> Aplicación web de gestión del calendario Mobidurango. Zona pública con eventos y calendario + zona admin con asistente conversacional.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## 📋 Qué hace esta app

Esta app es la **Capa 2** del proyecto Mobidurango (la **Capa 1** es la web estática que vive en `durangokirolak.net`).

- 🌐 **Zona pública:** calendario completo navegable con todos los eventos (Fase B)
- 🔌 **Endpoint API:** devuelve los eventos destacados que consume la web estática de DK
- 🔐 **Zona admin:** CRUD de eventos (Fase C) + asistente conversacional IA (Fase D)

---

## 🚀 Guía de despliegue paso a paso

Tiempo estimado: **30-40 minutos** la primera vez.

### Requisitos previos

- ✅ Cuenta de GitHub (gratis)
- ✅ Cuenta de Vercel (gratis) — conectada con tu GitHub
- ✅ Cuenta de Supabase (gratis) — proyecto creado
- ✅ [Node.js](https://nodejs.org/) instalado en tu ordenador (versión 20 o superior)
- ✅ Git instalado en tu ordenador
- ✅ Un editor de código (VS Code recomendado)

---

### 🟣 PASO 1 — Ejecutar el SQL en Supabase

Antes de nada, creamos las tablas de la base de datos.

1. Entra al [dashboard de Supabase](https://supabase.com/dashboard)
2. Abre tu proyecto `mobidurango`
3. Menú izquierdo → **SQL Editor** (icono `>_`)
4. Clic en **"New query"**
5. Abre el archivo `supabase/schema.sql` de este proyecto, **copia todo el contenido**
6. **Pégalo** en el SQL Editor de Supabase
7. Clic en **"Run"** (o `Ctrl+Enter`)
8. Deberías ver un mensaje de éxito con un resumen: `admin_users: 0, eventos: 0, chat_historial: 0`

✅ **Verificación:** ve a **Table Editor** en el menú izquierdo. Deberían aparecer las 3 tablas creadas.

---

### 🟣 PASO 2 — Crear tu usuario admin

1. En Supabase, menú izquierdo → **Authentication** → pestaña **Users**
2. Botón **"Add user"** → **"Create new user"**
3. Rellena:
   - **Email:** `iinza@durangokirolak.net`
   - **Password:** la que quieras (apúntala bien)
   - ☑️ **Auto Confirm User** ← importante, marca esto
4. **"Create user"** ✅
5. Ahora vuelve al **SQL Editor** (Paso 1) con otra query nueva
6. Abre el archivo `supabase/add-admin.sql` de este proyecto, **copia todo el contenido**
7. **Pégalo** y ejecuta (**"Run"**)
8. Deberías ver tu usuario listado como admin

---

### 🟣 PASO 3 — Descargar el código

Si has recibido este proyecto como ZIP:

```bash
# Descomprime el ZIP y entra en la carpeta
cd mobidurango-app
```

Si lo tienes ya en tu ordenador, salta al Paso 4.

---

### 🟣 PASO 4 — Configurar variables de entorno (solo en local)

Este paso es para **probar la app en tu ordenador antes de subirla**.

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abre `.env.local` en tu editor

3. Rellena las variables con tus valores reales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ierfdlysfjmjsgcwbwzq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_mxXPEi_ETGwzhG-V4TKSUw_X71mKG8L
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

⚠️ **NUNCA subas `.env.local` a GitHub.** Ya está en `.gitignore` por seguridad.

---

### 🟣 PASO 5 — Probar en local

```bash
# Instala las dependencias (solo la primera vez)
npm install

# Arranca el servidor de desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

Deberías ver la página inicial con el logo y el mensaje "Garapenean".

**Para parar:** `Ctrl+C` en la terminal.

---

### 🟣 PASO 6 — Subir a GitHub

1. Entra en [github.com](https://github.com) y crea un **nuevo repositorio**:
   - **Nombre:** `mobidurango-app`
   - **Público** (si decidimos)
   - **NO marques** "Add README" ni "Add .gitignore" (ya los tenemos)
   - Clic en **"Create repository"**

2. GitHub te muestra instrucciones. Usa las de **"push existing repository"**:

   ```bash
   # Dentro de la carpeta mobidurango-app
   git init
   git add .
   git commit -m "Fase A: proyecto inicial Mobidurango"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/mobidurango-app.git
   git push -u origin main
   ```

   (Cambia `TU_USUARIO` por tu usuario de GitHub)

3. Recarga la página de GitHub → verás todos los archivos subidos ✅

---

### 🟣 PASO 7 — Desplegar en Vercel

Este es el paso mágico: **Vercel detectará automáticamente** que es un proyecto Next.js.

1. Entra en [vercel.com](https://vercel.com) (si no tienes cuenta, regístrate con GitHub)
2. Clic en **"Add New..."** → **"Project"**
3. Vercel te mostrará tus repositorios de GitHub. Selecciona `mobidurango-app`
4. **Configuración del proyecto:**
   - **Project Name:** `mobidurango` → esto define la URL final `mobidurango.vercel.app`
   - **Framework Preset:** `Next.js` (se detecta solo)
   - **Root Directory:** `./` (por defecto)

5. **⚠️ CRÍTICO: Variables de entorno**

   Clic en **"Environment Variables"** y añade estas 3:

   | Nombre | Valor | Dónde va |
   |--------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ierfdlysfjmjsgcwbwzq.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu publishable key (`sb_publishable_...`) | Production, Preview, Development |
   | `NEXT_PUBLIC_SITE_URL` | `https://mobidurango.vercel.app` | Production |

   **OPCIONAL pero recomendado para cuando hagamos la zona admin:**

   | Nombre | Valor | Dónde va |
   |--------|-------|----------|
   | `SUPABASE_SERVICE_ROLE_KEY` | Tu secret key (`sb_secret_...`) | Production, Preview, Development |

   ⚠️ La **secret key** va solo aquí, NUNCA en el código ni en GitHub.

6. Clic en **"Deploy"**

7. Espera 1-2 minutos mientras Vercel construye el proyecto

8. 🎉 **¡Listo!** Verás un mensaje `Congratulations!` y un enlace a tu app en `https://mobidurango.vercel.app`

---

### 🟣 PASO 8 — Verificar que todo funciona

**Prueba 1:** Abre `https://mobidurango.vercel.app` en el navegador. Debes ver la página con el logo.

**Prueba 2:** Abre `https://mobidurango.vercel.app/api/eventos-destacados` — debería devolver `[]` (array vacío) porque aún no hay eventos publicados. ✅ Eso significa que el endpoint funciona.

**Prueba 3:** Abre la web estática `mobidurango-eu.html` en tu navegador local. La zona "Hurrengo ekitaldi bereziak" del calendario estará **oculta** porque la API devuelve array vacío. ✅ Comportamiento esperado.

---

## 🎨 Paleta oficial de Mobidurango

Configurada en `tailwind.config.js`:

```
Morado principal:  #6B2EBF
Morado oscuro:     #4A1F8A
Morado claro:      #EEE4FA
Azul cielo:        #49D7FF  (acento del logo)
Amarillo:          #FFD500
```

Uso en Tailwind:
- `bg-morado`, `text-morado`, `bg-morado-oscuro`, etc.
- `bg-gradient-mobidurango` (gradiente oficial del logo)

---

## 📁 Estructura del proyecto

```
mobidurango-app/
├── app/                          # Páginas (App Router)
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página "/"
│   ├── globals.css               # Estilos globales
│   └── api/
│       └── eventos-destacados/
│           └── route.ts          # Endpoint público
│
├── lib/
│   └── supabase.ts               # Cliente Supabase centralizado
│
├── public/
│   └── mobidurango-logo.jpg      # Logo oficial
│
├── supabase/
│   ├── schema.sql                # Script de creación de tablas + RLS
│   └── add-admin.sql             # Añadir admin inicial
│
├── .env.local.example            # Plantilla de variables (subir a GitHub)
├── .gitignore                    # Qué NO subir a GitHub
├── next.config.js                # Config de Next.js (CORS)
├── package.json                  # Dependencias
├── tailwind.config.js            # Paleta Mobidurango
├── tsconfig.json                 # TypeScript
└── README.md                     # Este archivo
```

---

## 🗺️ Hoja de ruta

### ✅ Fase A (actual) — Base
- Proyecto estructurado
- Supabase + RLS configurado
- Endpoint `/api/eventos-destacados` funcional
- Deploy en Vercel

### 🟡 Fase B — Calendario público
- Página `/egutegia` navegable
- Vistas semanal, mensual, filtros
- API completa de lectura

### 🟡 Fase C — Admin CRUD básico
- Login admin con Supabase Auth
- Formulario crear/editar/borrar eventos
- Lista con búsqueda

### 🟡 Fase D — Asistente conversacional IA
- Chat admin tipo WhatsApp
- Integración Claude + DeepL (para traducción eu↔es)
- Flujo: chat → borrador → aprobación → publicación

### 🟡 Fase E — Integraciones externas
- Asociaciones suben sus propios eventos
- Generador posts redes sociales
- Inscripciones

---

## 🆘 Problemas habituales

### "Missing Supabase credentials"
→ Variables de entorno mal configuradas. Revisa `.env.local` (local) o las Environment Variables de Vercel.

### "Invalid API key"
→ La publishable key está mal copiada. Vuelve a Supabase → Settings → API Keys y cópiala de nuevo.

### La web estática de DK no muestra eventos destacados
→ Normal mientras no tengas eventos con `published=true` y `destacado=true`. Añade alguno desde el admin (Fase C) o manualmente desde Supabase.

### El deploy en Vercel falla
→ Normalmente es por variables de entorno faltantes. Revisa que las 3 (o 4) estén configuradas en Production.

---

## 🔒 Seguridad

- ✅ Row Level Security (RLS) activado en todas las tablas
- ✅ `service_role` solo en Vercel, nunca en código
- ✅ `.env.local` no se sube a GitHub
- ✅ Función `is_admin()` para validar permisos
- ✅ CORS abierto solo en `/api/*`

---

## 📞 Contacto

- **Email:** mobidurango@durango.eus
- **Teléfono:** 637 419 418

---

© 2026 Mobidurango · Durangoko Udalaren zerbitzua
