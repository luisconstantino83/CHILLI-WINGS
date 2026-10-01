import { avisos, juntas } from "../data/mockAvisos";

export default function Avisos() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Avisos y juntas</h1>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Avisos</p>
        {avisos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
            Sin avisos por ahora
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {avisos.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-3 text-sm">
                {a.texto}
                <p className="text-xs text-gray-400 mt-1">{a.fecha}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Juntas</p>
        {juntas.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
            Sin juntas registradas
          </p>
        ) : (
          juntas.map((j) => (
            <div key={j.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-2">{j.fecha}</p>
              {j.asuntos.map((a) => (
                <div key={a.texto} className="flex items-center gap-2 text-sm py-0.5">
                  <span>{a.tratado ? "✅" : "⬜️"}</span>
                  <span className={a.tratado ? "text-gray-400 line-through" : ""}>{a.texto}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        Al cerrar una junta, la minuta se genera automáticamente con los asuntos tratados.
      </p>
    </div>
  );
}
