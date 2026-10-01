import Section from "../components/Section";
import Row from "../components/Row";
import { miTurno } from "../data/mockTurno";
import { useReservaciones, hoyISO, esGrupoGrande } from "../context/ReservacionesContext";

export default function MiTurno() {
  const { antesDeAbrir, apertura, operacion, pendientes, cierre } = miTurno;
  const { reservas } = useReservaciones();
  const hoy = hoyISO();
  const reservacionesHoy = reservas
    .filter((r) => r.fecha === hoy && r.estado !== "cancelada")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Mi turno</h1>
      </div>

      <div className="flex flex-col gap-3">
        <Section title="Antes de abrir" icon="🌅" defaultOpen>
          <Row label="Personal programado" value={antesDeAbrir.personalProgramado} />
          <Row
            label="Checklist de apertura"
            value={`${antesDeAbrir.checklistApertura.completados}/${antesDeAbrir.checklistApertura.total}`}
          />
          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Faltan por llegar</p>
            {antesDeAbrir.faltanPorLlegar.length === 0 && (
              <p className="text-sm text-gray-400">Sin registros</p>
            )}
            {antesDeAbrir.faltanPorLlegar.map((p) => (
              <p key={p} className="text-sm text-amber-700">• {p}</p>
            ))}
          </div>
          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Temperaturas</p>
            {antesDeAbrir.temperaturas.length === 0 && (
              <p className="text-sm text-gray-400">Sin registros</p>
            )}
            {antesDeAbrir.temperaturas.map((t) => (
              <Row
                key={t.equipo}
                label={t.equipo}
                value={`${t.valor}°C (rango ${t.rango})`}
                tone={t.fueraDeRango ? "danger" : "default"}
              />
            ))}
          </div>
          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Pendientes del turno anterior</p>
            {antesDeAbrir.pendientesTurnoAnterior.length === 0 && (
              <p className="text-sm text-gray-400">Sin pendientes</p>
            )}
            {antesDeAbrir.pendientesTurnoAnterior.map((p) => (
              <p key={p} className="text-sm text-gray-600">• {p}</p>
            ))}
          </div>
          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Reservaciones del día</p>
            {reservacionesHoy.length === 0 && (
              <p className="text-sm text-gray-400">Sin reservaciones hoy</p>
            )}
            {reservacionesHoy.map((r) => (
              <div key={r.id} className="text-sm py-1">
                <div className="flex items-center justify-between">
                  <span>{r.hora} {r.nombreCliente}</span>
                  <span className="text-xs text-gray-400">{r.personas}p · Área {r.area}</span>
                </div>
                <div className="flex gap-2">
                  {esGrupoGrande(r) && <span className="text-xs text-orange-600">⚠️ Grupo grande</span>}
                  {r.mesas.length === 0 && <span className="text-xs text-amber-600">🟡 Pendiente de preparar</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Apertura" icon="🔓">
          <Row label="Personal presente" value={apertura.personalPresente} />
          <Row label="Retardos" value={apertura.retardos} tone="warning" />
          <Row label="Área A" value={apertura.distribucion.A} />
          <Row label="Área B" value={apertura.distribucion.B} />
          <Row label="Terraza" value={apertura.distribucion.T} />
          <Row label="Puerta" value={apertura.puerta} />
          <Row
            label="Checklist"
            value={`${apertura.checklistCompletado}/${apertura.checklistTotal}`}
          />
        </Section>

        <Section title="Operación" icon="⚙️">
          <Row label="Incidencias abiertas" value={operacion.incidenciasAbiertas} tone="warning" />
          <Row label="Tareas en proceso" value={operacion.tareasEnProceso} />
          <Row label="Cerveza bajada hoy" value={`${operacion.cervezaBajadaHoy} u`} />
          <Row label="Quejas abiertas" value={operacion.quejasAbiertas} tone="warning" />
          <Row label="Equipos con problema" value={operacion.equiposConProblema} tone="danger" />
          <Row label="Personal disponible" value={operacion.personalDisponible} />
        </Section>

        <Section title="Pendientes" icon="📋" defaultOpen>
          {pendientes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Sin pendientes 🎉</p>
          )}
          {pendientes.map((p) => (
            <div key={p.texto} className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-800">{p.texto}</span>
              <span className="text-xs text-gray-400">{p.area}</span>
            </div>
          ))}
        </Section>

        <Section title="Cierre" icon="🌙">
          <Row
            label="Checklist de cierre"
            value={`${cierre.checklistCompletado}/${cierre.checklistTotal}`}
            tone="warning"
          />
          <Row label="Inventarios pendientes" value={cierre.inventariosPendientes} />
          <Row label="Conteo de cerveza" value={cierre.conteoCerveza} tone="warning" />
          <Row label="Evidencias faltantes" value={cierre.evidenciasFaltantes} tone="warning" />
          <Row label="Incidencias sin cerrar" value={cierre.incidenciasSinCerrar} tone="danger" />
          <Row label="Equipos pendientes" value={cierre.equiposPendientes} />
          <Row label="Tareas pendientes" value={cierre.tareasPendientes} tone="danger" />
        </Section>
      </div>
    </div>
  );
}
