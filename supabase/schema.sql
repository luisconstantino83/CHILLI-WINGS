-- Chilli Wings OS — schema inicial para Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase (supabase.com > SQL Editor > New query)

-- ============ SUCURSALES Y USUARIOS ============
create table sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz default now()
);

create table empleados (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid references sucursales(id),
  nombre text not null,
  foto_url text,
  puesto text check (puesto in ('mesero','corredor','barra','caja','hostess','cocina','encargado','gerente','otro')),
  fecha_ingreso date,
  telefono text,
  estatus text check (estatus in ('activo','capacitacion','descanso','baja')) default 'activo',
  area_habitual text,
  created_at timestamptz default now()
);

-- ============ ASISTENCIA ============
create table asistencias (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid references empleados(id),
  fecha date not null,
  entrada_programada time,
  entrada_real time,
  salida time,
  estatus text check (estatus in ('presente','retardo','falta','permiso','descanso')),
  created_at timestamptz default now()
);

-- ============ ÁREAS Y ASIGNACIONES ============
create table areas (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid references sucursales(id),
  nombre text not null,
  capacidad int default 0
);

create table asignaciones (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid references empleados(id),
  area_id uuid references areas(id),
  fecha date not null,
  rol text, -- puerta, corredor, fijo, apoyo
  created_at timestamptz default now()
);

-- ============ CERVEZA ============
create table productos_cerveza (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  presentacion text
);

create table movimientos_cerveza (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos_cerveza(id),
  fecha date not null,
  hora time default now(),
  responsable_id uuid references empleados(id),
  cantidad_solicitada int,
  cantidad_bajada int,
  observaciones text,
  created_at timestamptz default now()
);

create table pedidos_cerveza (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  responsable_id uuid references empleados(id),
  estado text check (estado in ('borrador','preparado','realizado','recibido')) default 'borrador',
  total numeric,
  observaciones text,
  created_at timestamptz default now()
);

create table pedido_cerveza_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos_cerveza(id) on delete cascade,
  producto_id uuid references productos_cerveza(id),
  cantidad_sugerida int,
  cantidad_solicitada int,
  cantidad_recibida int
);

-- ============ INVENTARIOS ============
create table inventarios (
  id uuid primary key default gen_random_uuid(),
  tipo text, -- barra, bodega, cuarto_frio, postres, material, etc.
  fecha date not null,
  responsable_id uuid references empleados(id),
  estado text check (estado in ('pendiente','en_proceso','completado')) default 'pendiente',
  created_at timestamptz default now()
);

-- ============ TAREAS E INCIDENCIAS ============
create table tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  responsable_id uuid references empleados(id),
  fecha_limite timestamptz,
  estado text check (estado in ('pendiente','en_proceso','completada','vencida')) default 'pendiente',
  evidencia_url text,
  created_at timestamptz default now()
);

create table incidencias (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid references empleados(id),
  categoria text,
  descripcion text,
  gravedad text check (gravedad in ('baja','media','alta')),
  evidencia_url text,
  accion_tomada text,
  fecha timestamptz default now()
);

-- ============ MANTENIMIENTO Y TEMPERATURAS ============
create table equipos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  ubicacion text,
  estado text check (estado in ('funcionando','revision','falla','fuera_de_servicio')) default 'funcionando',
  rango_temp_min numeric,
  rango_temp_max numeric
);

create table mantenimientos (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid references equipos(id),
  problema text,
  fecha timestamptz default now(),
  tecnico text,
  costo numeric,
  estado text check (estado in ('abierto','en_proceso','resuelto')) default 'abierto'
);

create table temperaturas (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid references equipos(id),
  valor numeric not null,
  responsable_id uuid references empleados(id),
  fecha timestamptz default now(),
  fuera_de_rango boolean generated always as (false) stored -- calcula esto en la app comparando con equipos.rango_temp_*
);

-- ============ RESERVACIONES (con historial de cambios) ============
create table reservaciones_v2 (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora time not null,
  nombre_cliente text not null,
  telefono text,
  personas int not null,
  area text check (area in ('A','B','T')),
  mesas text[], -- ej. {"B1","B2"}
  notas text,
  estado text check (estado in ('pendiente','confirmada','llego','sentada','finalizada','cancelada','no_llego')) default 'pendiente',
  hora_llegada time,
  confirmado_por text,
  confirmado_en timestamptz,
  observaciones_confirmacion text,
  creado_por text,
  created_at timestamptz default now()
);

create table reservaciones_historial_cambios (
  id uuid primary key default gen_random_uuid(),
  reservacion_id uuid references reservaciones_v2(id) on delete cascade,
  campo text,
  valor_anterior text,
  valor_nuevo text,
  usuario text,
  fecha timestamptz default now()
);

-- ============ QUEJAS ============
create table quejas_clientes (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz default now(),
  mesa text,
  mesero_id uuid references empleados(id),
  descripcion text,
  estado text check (estado in ('pendiente','atendida','resuelta')) default 'pendiente'
);

-- ============ FACTURAS ============
create table facturas (
  id uuid primary key default gen_random_uuid(),
  cliente text,
  fecha date default current_date,
  estado text check (estado in ('solicitada','en_proceso','enviada','problema','resuelta')) default 'solicitada'
);

-- ============ AUDITORÍA ============
create table auditoria (
  id uuid primary key default gen_random_uuid(),
  tabla text not null,
  registro_id uuid not null,
  usuario_id uuid,
  valor_anterior jsonb,
  valor_nuevo jsonb,
  fecha timestamptz default now()
);

-- Nota: activa Row Level Security (RLS) en cada tabla antes de usar en producción,
-- y crea políticas según el rol (gerente / encargado / empleado).

-- ============ GUARDADO GENERAL DE LA APP (multi-dispositivo) ============
-- Aquí se guarda automáticamente la información de módulos como Cerveza,
-- Postres, Reservaciones, Personal, etc. para que se vea igual en celular,
-- computadora o cualquier otro dispositivo donde se abra la app.
-- No necesitas tocar esta tabla a mano: la app la usa sola.
create table if not exists estado_app (
  clave text primary key,
  valor jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz default now()
);

-- Habilita Realtime para esta tabla (para que los cambios se vean al instante
-- en otros dispositivos abiertos). En Supabase: Database > Replication >
-- activa "estado_app", o ejecuta:
alter publication supabase_realtime add table estado_app;

-- ============ CUADRE DE CERVEZA (inventario físico vs venta del sistema) ============
-- Reemplaza el concepto anterior de "movimientos_cerveza" con el flujo de cuadre diario.

create table inventario_cerveza_diario (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  producto_id text not null, -- coincide con el id del catálogo en el frontend
  cantidad int not null,
  usuario text,
  hora_captura time,
  ultima_modificacion timestamptz default now(),
  unique (fecha, producto_id)
);

create table venta_sistema_diaria (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  producto_id text not null,
  cantidad int not null,
  unique (fecha, producto_id)
);

create table entradas_cerveza (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  proveedor text,
  producto_id text not null,
  cantidad_solicitada int,
  cantidad_recibida int,
  usuario text,
  notas text,
  created_at timestamptz default now()
);

create table notas_diferencia_cerveza (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  producto_id text not null,
  motivo text,
  comentario text,
  usuario text,
  created_at timestamptz default now(),
  unique (fecha, producto_id)
);
