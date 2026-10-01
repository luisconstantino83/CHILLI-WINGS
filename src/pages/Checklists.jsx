import { useState } from "react";
import { checklistApertura, checklistCierre } from "../data/mockChecklists";
import { useSyncedState } from "../hooks/useSyncedState";

export default function Checklists() {
  const [tab, setTab] = useState("apertura");
  const [apertura, setApertura] = useSyncedState("checklist_apertura", checklistApertura);
  const [cierre, setCierre] = useSyncedState("checklist_cierre", checklistCierre);

  const lista = tab === "apertura" ? apertura : cierre;
  const setLista = tab === "apertura" ? setApertura : setCierre;
  const completados = lista.filter((i) => i.completado).length;

  function toggle(id) {
    setLista((prev) => prev.map((i) => (i.id === id ? { ...i, completado: !i.completado } : i)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Checklists</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("apertura")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg ${tab === "apertura" ? "bg-white shadow-sm" : "text-gray-500"}`}
        >
          Apertura
        </button>
        <button
          onClick={() => setTab("cierre")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg ${tab === "cierre" ? "bg-white shadow-sm" : "text-gray-500"}`}
        >
          Cierre
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600">
        {completados}/{lista.length} completados
      </div>

      <div className="flex flex-col gap-2">
        {lista.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 text-left"
          >
            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${
                item.completado ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
              }`}
            >
              {item.completado && "✓"}
            </span>
            <span className={`text-sm ${item.completado ? "text-gray-400 line-through" : "text-gray-800"}`}>
              {item.texto}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
