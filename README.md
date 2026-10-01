# Chilli Wings OS

Sistema integral de operaciones de sucursal. Este repo contiene el punto de partida real
del proyecto: Dashboard funcionando + arquitectura lista para crecer hacia los ~35 módulos
descritos en el prompt maestro (Mi Turno, Personal, Cerveza, Inventarios, Mantenimiento, etc).

## Qué incluye esta primera versión

- ✅ Dashboard ejecutivo (tarjetas KPI + "Atención requerida" con niveles de color)
- ✅ Navegación: sidebar en escritorio, barra inferior en móvil
- ✅ Estructura de carpetas lista para agregar cada módulo sin desordenar el proyecto
- ⏳ El resto de los módulos están como pantallas "placeholder" — mismo patrón, listos
  para llenarse uno por uno

## Cómo correrlo en tu computadora

Necesitas [Node.js](https://nodejs.org) 18 o superior instalado.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador (o en el teléfono usando la IP de tu
computadora en la misma red).

## Cómo subirlo a GitHub

Si es un repositorio nuevo:

```bash
git init
git add .
git commit -m "Primera versión: Dashboard de Chilli Wings OS"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/chilli-wings-os.git
git push -u origin main
```

Si ya tienes el repo creado en GitHub, solo reemplaza la URL de `origin` por la tuya.

## Estructura del proyecto

```
src/
  components/    Piezas reutilizables (tarjetas, navegación)
  pages/         Una pantalla por módulo (Dashboard, Mi Turno, Personal...)
  data/          Datos de ejemplo — se reemplazará por llamadas a la base de datos real
```

## Conectar Supabase (base de datos real)

Por defecto la app corre con datos de ejemplo, sin necesidad de configurar nada.
Para conectarla a una base de datos real:

1. Crea una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. Ve a **SQL Editor > New query**, pega el contenido de `supabase/schema.sql` y ejecútalo.
   Esto crea todas las tablas (empleados, asistencias, cerveza, tareas, incidencias,
   mantenimiento, reservaciones, quejas, facturas, auditoría, etc).
3. Ve a **Project Settings > API** y copia la `Project URL` y la `anon public key`.
4. Duplica `.env.example`, renómbralo a `.env.local` y pega ahí esos dos valores:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
   ```
5. Reinicia `npm run dev`. El Dashboard detecta automáticamente que Supabase está
   configurado y empieza a leer tareas vencidas, incidencias, reservaciones y quejas
   reales en lugar de los datos de ejemplo.

`.env.local` nunca se sube a GitHub (ya está en `.gitignore`) — así tus claves quedan
seguras.

## Importante: actualizar tu base de datos (guardado en todos tus dispositivos)

Se agregó una tabla nueva llamada `estado_app` que permite que Cerveza, Postres,
Reservaciones, Personal, Incidencias, Quejas, Checklists e Inventarios Generales
se guarden automáticamente y se vean igual en tu celular, tu computadora o
cualquier otro dispositivo donde abras la app (antes solo se guardaban en la
memoria del navegador y se perdían al recargar).

Como ya tienes un proyecto de Supabase conectado, solo falta ejecutar el SQL
nuevo una vez:

1. Entra a [supabase.com](https://supabase.com) y abre tu proyecto de Chilli Wings OS.
2. Ve a **SQL Editor > New query**.
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia SOLO la sección
   final que dice `GUARDADO GENERAL DE LA APP` (las últimas líneas del archivo)
   y pégala en el SQL Editor.
4. Dale a **Run**. Esto crea la tabla `estado_app` y activa la sincronización en
   tiempo real.
5. Si tu app en Vercel ya tenía configuradas `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY`, no necesitas hacer nada más — en cuanto subas estos
   archivos nuevos y Vercel vuelva a publicar, el guardado multi-dispositivo
   queda funcionando solo.

## Siguiente paso recomendado

Ver `ARCHITECTURE.md` para el modelo completo de entidades (empleados, áreas, inventarios,
pedidos de cerveza, mantenimiento, etc.) y cómo conectar una base de datos real
(por ejemplo Supabase o Firebase) en lugar de los datos de ejemplo.

Regla del proyecto: nunca eliminar ni simplificar un módulo existente al agregar uno nuevo.
Cada función nueva debe integrarse con el Dashboard, Mi Turno, notificaciones e historial.
