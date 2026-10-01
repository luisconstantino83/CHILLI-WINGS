import { useState } from "react";

export default function ImportarExcel() {
  const [archivo, setArchivo] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Importar desde Excel</h1>
      </div>

      <label className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center gap-2 text-center cursor-pointer">
        <span className="text-3xl">📄</span>
        <span className="text-sm text-gray-600">
          {archivo ? archivo.name : "Toca para elegir un archivo .xlsx o .csv"}
        </span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        />
      </label>

      {archivo && (
        <div className="bg-amber-50 text-amber-700 rounded-xl p-3 text-sm">
          Vista previa pendiente de conectar — antes de guardar siempre se valida,
          se muestran duplicados y errores, y nunca se sobrescribe información sin confirmación.
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Ejemplos de uso: importar lista de empleados, catálogo de productos o inventario inicial.
      </p>
    </div>
  );
}
