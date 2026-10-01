import { Link } from "react-router-dom";
import { empleados as empleadosIniciales } from "../data/mockPersonal";
import { calificacionTotal } from "../data/capacitacionEtapas";
import { useSyncedState } from "../hooks/useSyncedState";
import { desempeno } from "../data/mockCapacitacion";

export default function Capacitacion() {
  const [empleados] = useSyncedState("personal_empleados", empleadosIniciales);
  const enCapacitacion = empleados.filter((e) => e.estatus === "capacitacion");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Capacitación y desempeño</h1>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">En capacitación</p>
        {enCapacitacion.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
            Nadie en capacitación actualmente — inícialo desde la ficha del empleado en Personal
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {enCapacitacion.map((e) => {
              const total = calificacionTotal(e.capacitacion);
              return (
                <Link
                  key={e.id}
                  to="/personal"
                  className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{e.nombre}</p>
                    <p className="text-xs text-gray-400">{e.puesto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-amber-600">Semana {e.capacitacion?.semanaActual || 1}/4</p>
                    {total && <p className="text-xs text-gray-400">{total}/10</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Desempeño</p>
        {desempeno.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
            Sin datos de desempeño todavía
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {desempeno.map((d) => (
              <div key={d.empleado} className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-sm font-medium mb-1">{d.empleado}</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <span>Puntualidad: {d.puntualidad}</span>
                  <span>Asistencia: {d.asistencia}</span>
                  <span>Incidencias: {d.incidencias}</span>
                  <span>Tareas: {d.tareasCompletadas}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        Esta ficha ayuda a decidir — nunca toma decisiones disciplinarias por sí sola.
      </p>
    </div>
  );
}
