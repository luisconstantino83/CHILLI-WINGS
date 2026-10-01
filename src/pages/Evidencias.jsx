const evidencias = [];

export default function Evidencias() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Fotos y evidencias</h1>
      </div>
      {evidencias.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Aún no hay evidencias registradas
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {evidencias.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-3xl">📷</div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{e.relacionado}</p>
                <p className="text-xs text-gray-400">{e.responsable} · {e.fecha}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 text-center">
        Cada evidencia queda relacionada con su tarea, incidencia o inventario de origen.
      </p>
    </div>
  );
}
