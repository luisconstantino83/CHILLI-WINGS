import { useState } from "react";
import { categoriasPostres } from "../data/mockPostres";
import { empleados as empleadosIniciales } from "../data/mockPersonal";
import NumberField from "../components/NumberField";
import { useSyncedState } from "../hooks/useSyncedState";
import { usePostresVentas, hoyISO } from "../hooks/usePostresStore";

const TABS = [
  { id: "manual", label: "Inventario manual", icon: "📝" },
  { id: "sistema", label: "Venta sistema", icon: "🧾" },
  { id: "estadisticas", label: "Estadísticas", icon: "📊" },
];

export default function Postres() {
  const [tab, setTab] = useState("manual");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Postres</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-lg ${tab === t.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            <span className="block text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && <InventarioManual />}
      {tab === "sistema" && <VentaSistema />}
      {tab === "estadisticas" && <Estadisticas />}
    </div>
  );
}

// ============ INVENTARIO MANUAL (conteo físico hoy vs ayer) ============
function InventarioManual() {
  const [categorias, setCategorias] = useSyncedState("postres_categorias", categoriasPostres);
  const [guardado, setGuardado] = useState(false);

  function actualizar(catId, itemId, valor) {
    setGuardado(false);
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : { ...cat, items: cat.items.map((it) => (it.id === itemId ? { ...it, hoy: valor } : it)) }
      )
    );
  }

  const totalHoy = categorias.reduce((s, c) => s + c.items.reduce((s2, i) => s2 + i.hoy, 0), 0);
  const totalAyer = categorias.reduce((s, c) => s + c.items.reduce((s2, i) => s2 + i.ayer, 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-400">Lo que cuentas tú mismo, físicamente, cada día.</p>

      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between text-sm">
        <span className="text-gray-500">Total hoy vs ayer</span>
        <span className="font-medium">
          {totalHoy} <span className="text-gray-400 font-normal">/ {totalAyer} ayer</span>
        </span>
      </div>

      {categorias.map((cat) => (
        <div key={cat.id}>
          <p className="text-sm font-medium text-gray-700 mb-2">{cat.nombre}</p>
          <div className="flex flex-col gap-2">
            {cat.items.map((item) => {
              const diferencia = item.hoy - item.ayer;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.nombre}</p>
                    <p className="text-xs text-gray-400">
                      Ayer: {item.ayer}
                      {diferencia !== 0 && (
                        <span className={diferencia < 0 ? "text-red-500" : "text-green-600"}>
                          {" "}
                          ({diferencia > 0 ? "+" : ""}
                          {diferencia})
                        </span>
                      )}
                    </p>
                  </div>
                  <NumberField value={item.hoy} onChange={(v) => actualizar(cat.id, item.id, v)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {guardado ? (
        <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm text-center">
          ✅ Inventario de postres guardado
        </div>
      ) : (
        <button
          onClick={() => setGuardado(true)}
          className="bg-orange-600 text-white text-sm font-medium py-3 rounded-xl active:bg-orange-700"
        >
          Guardar inventario de hoy
        </button>
      )}
    </div>
  );
}

// ============ VENTA SISTEMA (mesero + postre vendido) ============
function VentaSistema() {
  const [empleados] = useSyncedState("personal_empleados", empleadosIniciales);
  const { ventasDeHoy, registrarVenta, eliminarVenta } = usePostresVentas();
  const meseros = empleados.filter((e) => e.estatus === "activo" || e.estatus === "capacitacion");
  const postresPlanos = categoriasPostres.flatMap((c) => c.items.map((i) => ({ ...i, categoria: c.nombre })));

  const [meseroId, setMeseroId] = useState("");
  const [postreId, setPostreId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const hoy = ventasDeHoy(hoyISO());

  function registrar() {
    if (!meseroId || !postreId) return;
    const mesero = meseros.find((m) => m.id === meseroId);
    const postre = postresPlanos.find((p) => p.id === postreId);
    registrarVenta({
      meseroId,
      meseroNombre: mesero.nombre,
      postreId,
      postreNombre: postre.nombre,
      cantidad,
    });
    setCantidad(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        Lo que marca el sistema de ventas: qué mesero vendió qué postre.
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500">Mesero</label>
          <select
            value={meseroId}
            onChange={(e) => setMeseroId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1"
          >
            <option value="">Selecciona...</option>
            {meseros.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre} ({m.puesto})</option>
            ))}
          </select>
          {meseros.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No hay empleados dados de alta todavía — agrégalos en Personal.
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Postre vendido</label>
          <select
            value={postreId}
            onChange={(e) => setPostreId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1"
          >
            <option value="">Selecciona...</option>
            {categoriasPostres.map((cat) => (
              <optgroup key={cat.id} label={cat.nombre}>
                {cat.items.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">Cantidad</label>
          <NumberField value={cantidad} min={1} onChange={setCantidad} />
        </div>

        <button
          disabled={!meseroId || !postreId}
          onClick={registrar}
          className="bg-orange-600 disabled:bg-gray-300 text-white text-sm font-medium py-2.5 rounded-lg"
        >
          Registrar venta
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Ventas de hoy ({hoy.length})</p>
        {hoy.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
            Sin ventas registradas hoy
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {hoy.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{v.postreNombre} × {v.cantidad}</p>
                  <p className="text-xs text-gray-400">{v.meseroNombre} · {v.hora}</p>
                </div>
                <button onClick={() => eliminarVenta(v.id)} className="text-xs text-red-500">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ESTADÍSTICAS ============
function Estadisticas() {
  const { estadisticas } = usePostresVentas();
  const { rankingPostres, rankingMeseros, promedioDiario, totalVendido, diasConVentas } = estadisticas;

  if (totalVendido === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
        Todavía no hay ventas registradas en "Venta sistema" para calcular estadísticas.
      </p>
    );
  }

  const maxPostre = rankingPostres[0]?.cantidad || 1;
  const maxMesero = rankingMeseros[0]?.cantidad || 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold">{totalVendido}</p>
          <p className="text-xs text-gray-500">Vendidos</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold">{promedioDiario}</p>
          <p className="text-xs text-gray-500">Promedio/día</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold">{diasConVentas}</p>
          <p className="text-xs text-gray-500">Días con datos</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">🍰 Postres que más se venden</p>
        <div className="flex flex-col gap-2">
          {rankingPostres.map((p, i) => (
            <div key={p.nombre} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">#{i + 1} {p.nombre}</span>
                <span className="text-gray-500">{p.cantidad}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${(p.cantidad / maxPostre) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">🏆 Meseros que más venden</p>
        <div className="flex flex-col gap-2">
          {rankingMeseros.map((m, i) => (
            <div key={m.nombre} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">#{i + 1} {m.nombre}</span>
                <span className="text-gray-500">{m.cantidad}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(m.cantidad / maxMesero) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
