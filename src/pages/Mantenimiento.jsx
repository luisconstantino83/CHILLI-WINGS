import { equipos, estadoEquipoStyles } from "../data/mockMantenimiento";

export default function Mantenimiento() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Mantenimiento y temperaturas</h1>
      </div>

      <div className="flex flex-col gap-2">
        {equipos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
            Sin equipos dados de alta todavía
          </p>
        )}
        {equipos.map((eq) => {
          const fueraDeRango =
            eq.valorActual !== null && (eq.valorActual < eq.rangoMin || eq.valorActual > eq.rangoMax);
          return (
            <div key={eq.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{eq.nombre}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${estadoEquipoStyles[eq.estado].color}`}>
                  {estadoEquipoStyles[eq.estado].label}
                </span>
              </div>
              <p className="text-xs text-gray-400">{eq.categoria}</p>
              {eq.valorActual !== null && (
                <p className={`text-xs mt-1 ${fueraDeRango ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {fueraDeRango && "🚨 "}
                  {eq.valorActual}°C (rango {eq.rangoMin} a {eq.rangoMax})
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Toca un equipo para ver ficha completa, historial de reparaciones y registrar temperatura — próximamente.
      </p>
    </div>
  );
}
