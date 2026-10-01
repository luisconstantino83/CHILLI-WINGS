import { facturas, estadoFacturaStyles } from "../data/mockFacturas";

export default function Facturas() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Facturas</h1>
      </div>
      {facturas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Sin solicitudes de factura pendientes
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {facturas.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{f.cliente}</p>
                <p className="text-xs text-gray-400">Folio {f.folio}</p>
              </div>
              <span className={`text-xs font-medium ${estadoFacturaStyles[f.estado].color}`}>
                {estadoFacturaStyles[f.estado].label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
