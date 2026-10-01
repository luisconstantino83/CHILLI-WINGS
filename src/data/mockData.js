// Sin datos de ejemplo — todo en cero hasta que se conecte a Supabase o captures
// información real. Ver ARCHITECTURE.md para el modelo de datos.

export const kpis = {
  personalHoy: { presentes: 0, programados: 0 },
  meserosPorArea: { A: 0, B: 0, T: 0 },
  faltas: 0,
  retardos: 0,
  tareasPendientes: 0,
  tareasVencidas: 0,
  incidenciasHoy: 0,
  inventariosPendientes: 0,
  alertasInventario: 0,
  cervezaBajadaHoy: 0,
  proximoPedidoCerveza: "—",
  pedidoCervezaPendiente: false,
  equiposConFallas: 0,
  mantenimientosPendientes: 0,
  temperaturasFueraDeRango: 0,
  reservacionesHoy: 0,
  capacitacionPendiente: 0,
  evidenciasPendientes: 0,
  facturasPendientes: 0,
  quejasAbiertas: 0,
  avisosImportantes: 0,
};

export const atencionRequerida = [];

export const nivelStyles = {
  urgente: { bg: "bg-red-50", dot: "bg-red-500", label: "Urgente" },
  importante: { bg: "bg-orange-50", dot: "bg-orange-500", label: "Importante" },
  pendiente: { bg: "bg-amber-50", dot: "bg-amber-400", label: "Pendiente" },
  correcto: { bg: "bg-green-50", dot: "bg-green-500", label: "Correcto" },
};
