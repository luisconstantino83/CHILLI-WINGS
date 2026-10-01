import { tecnicos } from "../data/mockTecnicos";

export default function Tecnicos() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Técnicos y proveedores</h1>
      </div>
      {tecnicos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Sin técnicos ni proveedores registrados
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {tecnicos.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-sm font-medium">{t.nombre}</p>
              <p className="text-xs text-gray-400">{t.especialidad} · {t.telefono}</p>
              <p className="text-xs text-gray-500 mt-1">{t.trabajos} trabajos realizados</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
