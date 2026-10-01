import { empleados } from "../data/mockPersonal";
import { useSyncedState } from "../hooks/useSyncedState";

const AREAS_INICIALES = [
  { id: "A", nombre: "Área A — Interior", capacidad: 5 },
  { id: "B", nombre: "Área B — Exterior", capacidad: 3 },
  { id: "T", nombre: "Terraza", capacidad: 3 },
];

export default function Asignacion() {
  const meseros = empleados.filter((e) => e.puesto === "Mesero" || e.puesto === "Hostess" || e.puesto === "Barra");
  const [asignaciones, setAsignaciones] = useSyncedState(
    "asignacion_areas",
    Object.fromEntries(meseros.map((m) => [m.id, m.area === "A" || m.area === "B" || m.area === "Terraza" ? m.area : ""]))
  );

  function asignar(empleadoId, areaId) {
    setAsignaciones((prev) => ({ ...prev, [empleadoId]: areaId }));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Asignación de áreas</h1>
      </div>

      {meseros.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Da de alta empleados en "Personal" primero para poder asignarlos a un área
        </p>
      )}

      {meseros.length > 0 && AREAS_INICIALES.map((area) => {
        const asignados = meseros.filter((m) => asignaciones[m.id] === area.id);
        const incompleta = asignados.length < area.capacidad;
        return (
          <div key={area.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{area.nombre}</p>
              <span className={`text-xs ${incompleta ? "text-amber-600" : "text-green-600"}`}>
                {asignados.length}/{area.capacidad}
                {incompleta && " ⚠️"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {asignados.length === 0 && <p className="text-xs text-gray-400">Sin asignar</p>}
              {asignados.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span>{m.nombre}</span>
                  <button
                    onClick={() => asignar(m.id, "")}
                    className="text-xs text-gray-400"
                  >
                    quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {meseros.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sin asignar</p>
          <div className="flex flex-col gap-2">
            {meseros
              .filter((m) => !asignaciones[m.id])
              .map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                  <span className="text-sm">{m.nombre}</span>
                  <select
                    onChange={(e) => asignar(m.id, e.target.value)}
                    defaultValue=""
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                  >
                    <option value="" disabled>Asignar a…</option>
                    {AREAS_INICIALES.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        El acomodo se guarda automáticamente y queda disponible en el historial por fecha.
      </p>
    </div>
  );
}
