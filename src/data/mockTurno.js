// Sin datos de ejemplo — se llena con información real conforme avanza el turno.

export const miTurno = {
  antesDeAbrir: {
    personalProgramado: 0,
    faltanPorLlegar: [],
    checklistApertura: { completados: 0, total: 0 },
    equiposPorRevisar: [],
    temperaturas: [],
    reservaciones: [],
    pendientesTurnoAnterior: [],
  },
  apertura: {
    personalPresente: 0,
    retardos: 0,
    distribucion: { A: 0, B: 0, T: 0 },
    puerta: "—",
    checklistCompletado: 0,
    checklistTotal: 0,
  },
  operacion: {
    incidenciasAbiertas: 0,
    tareasEnProceso: 0,
    cervezaBajadaHoy: 0,
    reservacionesProximas: [],
    quejasAbiertas: 0,
    equiposConProblema: 0,
    personalDisponible: 0,
  },
  pendientes: [],
  cierre: {
    checklistCompletado: 0,
    checklistTotal: 0,
    inventariosPendientes: 0,
    conteoCerveza: "Sin registrar",
    evidenciasFaltantes: 0,
    incidenciasSinCerrar: 0,
    equiposPendientes: 0,
    tareasPendientes: 0,
  },
};
