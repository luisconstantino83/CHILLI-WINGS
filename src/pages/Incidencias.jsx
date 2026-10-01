import { useState } from "react";
import { incidencias as inicial, categoriasIncidencia } from "../data/mockIncidencias";
import { useSyncedState } from "../hooks/useSyncedState";

const gravedadStyles = {
  baja: "bg-gray-100 text-gray-600",
  media: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
};

export default function Incidencias() {
  const [lista, setLista] = useSyncedState("incidencias", inicial);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoria, setCategoria] = useState(categoriasIncidencia[0]);
  const [descripcion, setDescripcion] = useState("");
  const [gravedad, setGravedad] = useState("baja");

  function registrar() {
    setLista((prev) => [
      { id: `n${prev.length}`, empleado: "—", categoria, gravedad, fecha: "Ahora", accion: "Sin acción aún", descripcion },
      ...prev,
    ]);
    setDescripcion("");
    setMostrarForm(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Sucursal Centro</p>
          <h1 className="text-xl font-semibold">Incidencias</h1>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          ＋ Registrar
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
            {categoriasIncidencia.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            {["baja", "media", "alta"].map((g) => (
              <button
                key={g}
                onClick={() => setGravedad(g)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg capitalize ${
                  gravedad === g ? gravedadStyles[g] : "bg-gray-50 text-gray-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción breve…"
            className="border border-gray-200 rounded-lg p-2 text-sm"
            rows={3}
          />
          <button onClick={registrar} className="bg-orange-600 text-white text-sm font-medium py-2 rounded-lg">
            Guardar incidencia
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
            Sin incidencias registradas
          </p>
        )}
        {lista.map((i) => (
          <div key={i.id} className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">{i.categoria}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${gravedadStyles[i.gravedad]}`}>{i.gravedad}</span>
            </div>
            <p className="text-xs text-gray-400">{i.empleado} · {i.fecha}</p>
            <p className="text-xs text-gray-500 mt-1">{i.accion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
