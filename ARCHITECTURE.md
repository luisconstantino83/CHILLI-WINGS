# Arquitectura — Chilli Wings OS

## Filosofía
El encargado no debe depender de su memoria. La app debe decirle qué necesita
atención, cuándo, y qué quedó pendiente. Todo módulo nuevo debe alimentar:
Dashboard, Mi Turno, Notificaciones e Historial — nunca vivir aislado.

## Entidades principales (para la base de datos real)

Cuando se conecte una base de datos (recomendado: Supabase por autenticación +
Postgres + storage de fotos incluidos), estas son las tablas sugeridas:

- usuarios (auth, roles: gerente / encargado / empleado)
- sucursales
- empleados (perfil, puesto, estatus, área habitual)
- horarios
- asistencias (entrada programada/real, retardo, falta, permiso)
- areas (A, B, Terraza — configurable)
- asignaciones (empleado ↔ área ↔ fecha)
- productos (catálogo de cerveza y otros)
- movimientos_cerveza (bajadas a barra, día, cantidad, responsable)
- inventarios (barra, bodega, cuarto frío, general — por ubicación)
- pedidos_cerveza (borrador → preparado → realizado → recibido)
- recepciones (pedido vs recibido, diferencias)
- tareas (recurrentes y puntuales, responsable, estado, evidencia)
- incidencias (categoría, gravedad, evidencia, seguimiento)
- equipos (mantenimiento, categoría, estado, ficha)
- temperaturas (equipo, valor, rango permitido, alerta)
- tecnicos_proveedores
- reservaciones
- quejas_clientes
- facturas
- capacitaciones (semana 1-4, evaluaciones)
- evidencias (fotos, relacionadas a cualquier entidad)
- avisos_juntas
- auditoria (quién cambió qué, cuándo, valor anterior → nuevo)

## Regla de auditoría
Ningún registro operativo importante se borra en silencio. Se marca como
Cancelado o Corregido y se guarda el valor anterior en `auditoria`.

## Cómo agregar un módulo nuevo (checklist)

1. Crear la tabla(s) correspondiente(s) en la base de datos.
2. Crear `src/pages/NombreDelModulo.jsx` siguiendo el patrón de `Dashboard.jsx`.
3. Agregar la ruta en `App.jsx` y el ítem de navegación en `Layout.jsx`.
4. Si genera alertas o pendientes, agregarlos a:
   - `Atención requerida` del Dashboard
   - `Mi Turno` (en la sección del día que corresponda)
   - Centro de notificaciones
5. Agregar el módulo al buscador de Historial y a los reportes (diario/semanal/mensual)
   si aplica.
6. No eliminar ni simplificar módulos existentes.

## Próximos módulos sugeridos, en orden

Ya construidos (17 pantallas): Dashboard, Mi Turno, Personal + Asistencia, Asignación
de áreas, Centro de Cerveza (bajada, inventario, pedidos, historial), Checklists
apertura/cierre, Incidencias, Mantenimiento + Temperaturas, Reservaciones, Quejas,
Facturas, Capacitación + Desempeño, Técnicos y Proveedores, Avisos y Juntas,
Notificaciones, Fotos y Evidencias, Importar Excel, Historial Global, Reportes.

Pendiente real (no solo pantalla, sino lógica de negocio):

1. Conectar cada pantalla a sus tablas de Supabase (hoy todas usan datos de ejemplo,
   igual que hacía el Dashboard antes de conectarse — mismo patrón del hook `useDashboardData`).
2. Permisos por rol + autenticación real (Supabase Auth: gerente / encargado / empleado).
3. Importar Excel real (librería `xlsx` + validación de duplicados).
4. Subida real de fotos (Supabase Storage) para evidencias.
5. Multi-sucursal (ya está la tabla `sucursales`, falta el selector en la UI).
