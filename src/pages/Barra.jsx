import { useState, useMemo } from "react";
import { productosBarra } from "../data/mockBarra";
import { useBarraStore, hoyISO, formatFechaLarga } from "../hooks/useBarraStore";
import NumberField from "../components/NumberField";

const TABS = [
  { id: "bajada", label: "Bajada de hoy", icon: "🧾" },
  { id: "historial", label: "Historial", icon: "🕘" },
];

export default function Barra() {
  const store = useBarraStore();
  const [fecha, setFecha] = useState(hoyISO());
  const [tab, setTab] = useState("bajada");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Sucursal Centro</p>
          <h1 className="text-xl font-semibold">Barra</h1>
        </div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1"
        />
      </div>

      <p className="text-xs text-gray-400 -mt-2">{formatFechaLarga(fecha)}</p>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg ${
              tab === t.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            }`}
          >
            <span className="block text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bajada" && <BajadaDeHoy fecha={fecha} store={store} />}
      {tab === "historial" && <HistorialBarra store={store} onSelectFecha={(f) => { setFecha(f); setTab("bajada"); }} />}
    </div>
  );
}

// ============ BAJADA DE HOY (o de la fecha seleccionada) ============
function BajadaDeHoy({ fecha, store }) {
  const diaExistente = store.getDia(fecha);
  const [valores, setValores] = useState(() =>
    Object.fromEntries(productosBarra.map((p) => [p.id, diaExistente?.bajada?.[p.id] ?? 0]))
  );
  const [guardado, setGuardado] = useState(false);

  useMemo(() => {
    const dia = store.getDia(fecha);
    setValores(Object.fromEntries(productosBarra.map((p) => [p.id, dia?.bajada?.[p.id] ?? 0])));
    setGuardado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const yaExiste = diaExistente && Object.keys(diaExistente.bajada).length > 0;
  const esPasado = fecha !== hoyISO();
  const totalBajado = Object.values(valores).reduce((s, v) => s + v, 0);

  function guardar() {
    store.guardarBajada(fecha, valores);
    setGuardado(true);
  }

  return (
    <div className="flex flex-col gap-3">
      {esPasado && (
        <div className="bg-amber-50 text-amber-700 rounded-xl p-3 text-xs">
          ⚠️ Estás editando un día pasado.
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between text-sm">
        <span className="text-gray-500">Total de artículos bajados</span>
        <span className="font-medium">{totalBajado}</span>
      </div>

      <div className="flex flex-col gap-2">
        {productosBarra.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{p.nombre}</span>
            <NumberField
              value={valores[p.id]}
              onChange={(v) => {
                setValores((prev) => ({ ...prev, [p.id]: v }));
                setGuardado(false);
              }}
            />
          </div>
        ))}
      </div>

      {guardado ? (
        <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm text-center">
          ✅ Bajada de barra del {formatFechaLarga(fecha)} guardada correctamente
        </div>
      ) : (
        <button onClick={guardar} className="bg-orange-600 text-white text-sm font-medium py-3 rounded-xl active:bg-orange-700">
          {yaExiste ? "EDITAR BAJADA" : "GUARDAR BAJADA"}
        </button>
      )}

      {diaExistente?.meta?.horaCaptura && (
        <p className="text-xs text-gray-400 text-center">
          Capturado por {diaExistente.meta.usuario} a las {diaExistente.meta.horaCaptura}
          {diaExistente.meta.ultimaModificacion && ` · Última edición: ${diaExistente.meta.ultimaModificacion}`}
        </p>
      )}
    </div>
  );
}

// ============ HISTORIAL ============
function HistorialBarra({ store, onSelectFecha }) {
  const dias = store.historial(60);

  if (dias.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Todavía no hay bajadas de barra registradas.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {dias.map((d) => {
        const total = Object.values(d.bajada).reduce((s, v) => s + v, 0);
        return (
          <button
            key={d.fecha}
            onClick={() => onSelectFecha(d.fecha)}
            className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-medium">{formatFechaLarga(d.fecha)}</p>
              <p className="text-xs text-gray-400">Capturado por {d.meta?.usuario || "—"}</p>
            </div>
            <span className="text-sm font-medium text-gray-600">{total} artículos</span>
          </button>
        );
      })}
    </div>
  );
}
