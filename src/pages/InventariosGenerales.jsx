import { useState } from "react";
import { inventariosGenerales } from "../data/mockInventariosGenerales";
import QuantityStepper from "../components/QuantityStepper";
import { useSyncedState } from "../hooks/useSyncedState";

export default function InventariosGenerales() {
  const [categorias, setCategorias] = useSyncedState("inventarios_generales", inventariosGenerales);
  const [catActiva, setCatActiva] = useState(inventariosGenerales[0].id);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const cat = categorias.find((c) => c.id === catActiva);

  function actualizar(itemId, valor) {
    setCategorias((prev) =>
      prev.map((c) =>
        c.id !== catActiva
          ? c
          : { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, hoy: valor } : it)) }
      )
    );
  }

  function agregarArticulo() {
    if (!nuevoNombre.trim()) return;
    setCategorias((prev) =>
      prev.map((c) =>
        c.id !== catActiva
          ? c
          : {
              ...c,
              items: [...c.items, { id: `${c.id}-${c.items.length + 1}`, nombre: nuevoNombre.trim(), ayer: 0, hoy: 0 }],
            }
      )
    );
    setNuevoNombre("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Inventarios generales</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatActiva(c.id)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-lg ${
              catActiva === c.id ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">Frecuencia sugerida: {cat.frecuencia}</p>

      <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-2">
        <input
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder={`Agregar artículo a ${cat.nombre.toLowerCase()}…`}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          onKeyDown={(e) => e.key === "Enter" && agregarArticulo()}
        />
        <button onClick={agregarArticulo} className="bg-orange-600 text-white text-sm px-3 rounded-lg">
          ＋
        </button>
      </div>

      {cat.items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Sin artículos todavía en {cat.nombre.toLowerCase()} — agrega el primero arriba
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {cat.items.map((item) => {
            const diferencia = item.hoy - item.ayer;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.nombre}</p>
                  <p className="text-xs text-gray-400">
                    Anterior: {item.ayer}
                    {diferencia !== 0 && (
                      <span className={diferencia < 0 ? "text-red-500" : "text-green-600"}>
                        {" "}({diferencia > 0 ? "+" : ""}{diferencia})
                      </span>
                    )}
                  </p>
                </div>
                <QuantityStepper value={item.hoy} onChange={(v) => actualizar(item.id, v)} step={1} min={0} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
