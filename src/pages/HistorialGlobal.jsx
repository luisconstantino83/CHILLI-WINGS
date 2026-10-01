import { useState } from "react";

const registros = [];

export default function HistorialGlobal() {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = registros.filter((r) =>
    `${r.tipo} ${r.texto} ${r.responsable}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Historial global</h1>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por empleado, área, producto, tipo…"
        className="border border-gray-200 rounded-xl p-3 text-sm"
      />

      <div className="flex flex-col gap-2">
        {filtrados.map((r, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-orange-700">{r.tipo}</span>
              <span className="text-xs text-gray-400">{r.fecha}</span>
            </div>
            <p className="text-sm text-gray-800 mt-1">{r.texto}</p>
            <p className="text-xs text-gray-400">{r.responsable}</p>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
            Aún no hay registros — se irán acumulando conforme uses la app
          </p>
        )}
      </div>
    </div>
  );
}
