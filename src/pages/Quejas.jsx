import { quejas as inicial, estadoQuejaStyles } from "../data/mockQuejas";
import { useSyncedState } from "../hooks/useSyncedState";

export default function Quejas() {
  const [lista, setLista] = useSyncedState("quejas", inicial);

  function avanzarEstado(id) {
    const orden = ["pendiente", "atendida", "resuelta"];
    setLista((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const siguiente = orden[Math.min(orden.indexOf(q.estado) + 1, orden.length - 1)];
        return { ...q, estado: siguiente };
      })
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Quejas de clientes</h1>
      </div>

      <div className="flex flex-col gap-2">
        {lista.map((q) => (
          <button
            key={q.id}
            onClick={() => avanzarEstado(q.id)}
            className="bg-white rounded-xl border border-gray-100 p-3 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Mesa {q.mesa}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${estadoQuejaStyles[q.estado]}`}>
                {q.estado}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{q.mesero}</p>
            <p className="text-sm text-gray-700 mt-1">{q.descripcion}</p>
          </button>
        ))}
        {lista.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Sin quejas abiertas 🎉</p>}
      </div>
      <p className="text-xs text-gray-400 text-center">Toca una queja para avanzar su estado.</p>
    </div>
  );
}
