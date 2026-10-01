import KpiCard from "../components/KpiCard";
import AttentionItem from "../components/AttentionItem";
import { useDashboardData } from "../hooks/useDashboardData";
import { useReservaciones, hoyISO, esGrupoGrande, horaAMinutos } from "../context/ReservacionesContext";

export default function Dashboard() {
  const { kpis, atencion: atencionRequerida, loading, usingMockData } = useDashboardData();
  const { reservas } = useReservaciones();

  if (loading) {
    return <p className="text-sm text-gray-500 py-10 text-center">Cargando…</p>;
  }

  const hoy = hoyISO();
  const reservasHoy = reservas.filter((r) => r.fecha === hoy && r.estado !== "cancelada");
  const personasHoy = reservasHoy.reduce((s, r) => s + r.personas, 0);

  const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
  const proxima = reservasHoy
    .filter((r) => horaAMinutos(r.hora) >= ahoraMin && !["llego", "sentada", "finalizada"].includes(r.estado))
    .sort((a, b) => a.hora.localeCompare(b.hora))[0];

  const alertasReserva = [];
  if (proxima) {
    const faltan = horaAMinutos(proxima.hora) - ahoraMin;
    if (proxima.mesas.length === 0) {
      alertasReserva.push({
        id: `res-mesas-${proxima.id}`, icono: "🔴", nivel: "importante",
        texto: `Falta asignar mesas — ${proxima.nombreCliente} (${proxima.hora})`, detalle: "Reservación próxima",
      });
    }
    if (faltan <= 60 && faltan > 0) {
      alertasReserva.push({
        id: `res-pronto-${proxima.id}`, icono: "⏰", nivel: faltan <= 30 ? "urgente" : "importante",
        texto: `Reservación en ${faltan} min — ${proxima.nombreCliente}, ${proxima.personas} personas, Área ${proxima.area}`,
        detalle: esGrupoGrande(proxima) ? "Grupo grande — preparar con anticipación" : "Preparar mesas",
      });
    }
  }

  const todasLasAlertas = [...atencionRequerida, ...alertasReserva];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Buenas tardes, Encargado</h1>
        {usingMockData && (
          <p className="text-xs text-amber-600 mt-1">
            Mostrando datos de ejemplo — conecta Supabase en .env.local para ver datos reales.
          </p>
        )}
      </div>

      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2">Resumen</h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="Personal hoy"
            value={`${kpis.personalHoy.presentes}/${kpis.personalHoy.programados}`}
          />
          <KpiCard label="Tareas vencidas" value={kpis.tareasVencidas} tone="danger" />
          <KpiCard label="Cerveza bajada hoy" value={`${kpis.cervezaBajadaHoy} u`} />
          <KpiCard label="Reservaciones hoy" value={reservasHoy.length} />
          <KpiCard label="Retardos" value={kpis.retardos} tone="warning" />
          <KpiCard label="Faltas" value={kpis.faltas} tone="warning" />
          <KpiCard label="Equipos con falla" value={kpis.equiposConFallas} tone="danger" />
          <KpiCard label="Quejas abiertas" value={kpis.quejasAbiertas} tone="warning" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2">Reservaciones</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reservaciones hoy</span>
            <span className="font-medium">{reservasHoy.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Personas reservadas</span>
            <span className="font-medium">{personasHoy}</span>
          </div>
          {proxima ? (
            <div className="flex justify-between text-sm pt-1 border-t border-gray-50 mt-1">
              <span className="text-gray-500">Próxima</span>
              <span className="font-medium">{proxima.hora} — {proxima.nombreCliente} — {proxima.personas}p — {proxima.area}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 pt-1">Sin próximas reservaciones hoy</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-700 mb-2">Atención requerida</h2>
        <div className="flex flex-col gap-2">
          {todasLasAlertas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
              Sin pendientes por ahora 🎉
            </p>
          )}
          {todasLasAlertas.map((item) => (
            <AttentionItem key={item.id} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}
