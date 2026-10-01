import { useState, useMemo, Fragment } from "react";
import * as XLSX from "xlsx";
import { productos, estadoPedidoDelDia } from "../data/mockCerveza";
import { useCervezaStore, addDaysISO, formatFechaLarga, MOTIVOS_DIFERENCIA } from "../hooks/useCervezaStore";
import NumberField from "../components/NumberField";

const TABS = [
  { id: "inventario", label: "Inventario", icon: "📦" },
  { id: "venta", label: "Venta sistema", icon: "🧾" },
  { id: "cuadre", label: "Cuadre", icon: "⚖️" },
  { id: "entradas", label: "Entradas", icon: "🚚" },
  { id: "historial", label: "Historial", icon: "🕘" },
  { id: "pedido", label: "Pedido", icon: "🍺" },
  { id: "excel", label: "Excel", icon: "📊" },
];

const ESTADO_ESTILOS = {
  cuadra: { icon: "🟢", label: "Cuadra", color: "text-green-600" },
  faltante: { icon: "🔴", label: "Faltante", color: "text-red-600" },
  sobrante: { icon: "🟠", label: "Sobrante", color: "text-orange-600" },
  incompleto: { icon: "⚪", label: "Sin datos", color: "text-gray-400" },
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Cerveza() {
  const store = useCervezaStore();
  const [fecha, setFecha] = useState(hoyISO());
  const [tab, setTab] = useState("inventario");

  const resumen = store.resumenDia(fecha);
  const alertaPedido = estadoPedidoDelDia(new Date(fecha + "T12:00:00"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Sucursal Centro</p>
          <h1 className="text-xl font-semibold">Cerveza</h1>
        </div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1"
        />
      </div>

      <p className="text-xs text-gray-400 -mt-2">{formatFechaLarga(fecha)}</p>

      {/* Dashboard resumen del día */}
      <div className="bg-gray-50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {!resumen.capturado ? (
          <span className="text-gray-400">Sin inventario capturado este día</span>
        ) : (
          <>
            <span className="text-green-600 font-medium">🟢 {resumen.cuadran} cuadran</span>
            {resumen.faltantes > 0 && <span className="text-red-600 font-medium">🔴 {resumen.faltantes} faltante(s)</span>}
            {resumen.sobrantes > 0 && <span className="text-orange-600 font-medium">🟠 {resumen.sobrantes} sobrante(s)</span>}
            <span className="text-gray-500">Diferencia total: {resumen.totalDiferencia > 0 ? "+" : ""}{resumen.totalDiferencia}</span>
          </>
        )}
      </div>

      {alertaPedido && (
        <div className={`rounded-xl p-3 text-sm font-medium ${alertaPedido.nivel === "urgente" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
          {alertaPedido.icon} {alertaPedido.texto}
        </div>
      )}

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

      {tab === "inventario" && <InventarioDiario fecha={fecha} store={store} />}
      {tab === "venta" && <VentaSistemaTab fecha={fecha} store={store} />}
      {tab === "cuadre" && <CuadreTab fecha={fecha} store={store} />}
      {tab === "entradas" && <EntradasTab fecha={fecha} store={store} />}
      {tab === "historial" && <HistorialTab store={store} onSelectFecha={(f) => { setFecha(f); setTab("cuadre"); }} />}
      {tab === "pedido" && <PedidoTab fecha={fecha} store={store} alerta={alertaPedido} />}
      {tab === "excel" && <ExportarExcel store={store} />}
    </div>
  );
}

// ============ INVENTARIO DIARIO ============
function InventarioDiario({ fecha, store }) {
  const diaExistente = store.getDia(fecha);
  const [valores, setValores] = useState(() =>
    Object.fromEntries(productos.map((p) => [p.id, store.getInventarioProducto(fecha, p.id) ?? 0]))
  );
  const [guardado, setGuardado] = useState(false);

  // Si cambia la fecha seleccionada, recargar valores de esa fecha
  useMemo(() => {
    setValores(Object.fromEntries(productos.map((p) => [p.id, store.getInventarioProducto(fecha, p.id) ?? 0])));
    setGuardado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const yaExiste = diaExistente && Object.keys(diaExistente.inventario).length > 0;
  const esPasado = fecha !== hoyISO();

  function guardar() {
    store.guardarInventario(fecha, valores);
    setGuardado(true);
  }

  return (
    <div className="flex flex-col gap-3">
      {esPasado && (
        <div className="bg-amber-50 text-amber-700 rounded-xl p-3 text-xs">
          ⚠️ Estás editando un día pasado. Modificar este inventario puede cambiar los
          cuadres de los días posteriores — se recalculan solos al abrirlos.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {productos.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{p.nombre}</span>
            <NumberField value={valores[p.id]} onChange={(v) => { setValores((prev) => ({ ...prev, [p.id]: v })); setGuardado(false); }} />
          </div>
        ))}
      </div>

      {guardado ? (
        <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm text-center">
          ✅ Inventario del {formatFechaLarga(fecha)} guardado correctamente
        </div>
      ) : (
        <button onClick={guardar} className="bg-orange-600 text-white text-sm font-medium py-3 rounded-xl active:bg-orange-700">
          {yaExiste ? "EDITAR INVENTARIO" : "GUARDAR INVENTARIO"}
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

// ============ VENTA DEL SISTEMA ============
function VentaSistemaTab({ fecha, store }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(productos.map((p) => [p.id, store.getDia(fecha)?.ventaSistema[p.id] ?? 0]))
  );
  const [guardado, setGuardado] = useState(false);

  useMemo(() => {
    setValores(Object.fromEntries(productos.map((p) => [p.id, store.getDia(fecha)?.ventaSistema[p.id] ?? 0])));
    setGuardado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  function guardar() {
    store.guardarVenta(fecha, valores);
    setGuardado(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50 text-amber-700 rounded-xl p-3 text-xs">
        Captura aquí lo que muestra tu sistema como vendido cada día. Más adelante se
        agregan conversiones especiales para Tritones, Jarras y Cubetazos.
      </div>

      <div className="flex flex-col gap-2">
        {productos.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{p.nombre}</span>
            <NumberField value={valores[p.id]} onChange={(v) => { setValores((prev) => ({ ...prev, [p.id]: v })); setGuardado(false); }} />
          </div>
        ))}
      </div>

      {guardado ? (
        <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm text-center">
          ✅ Venta del {formatFechaLarga(fecha)} guardada
        </div>
      ) : (
        <button onClick={guardar} className="bg-orange-600 text-white text-sm font-medium py-3 rounded-xl active:bg-orange-700">
          GUARDAR VENTA DEL SISTEMA
        </button>
      )}
    </div>
  );
}

// ============ CUADRE ============
function CuadreTab({ fecha, store }) {
  const filas = store.computeCuadreDia(fecha);
  const [notaAbierta, setNotaAbierta] = useState(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="p-2 sticky left-0 bg-white">Producto</th>
              <th className="p-2 text-center">Anterior</th>
              <th className="p-2 text-center">Entradas</th>
              <th className="p-2 text-center">Actual</th>
              <th className="p-2 text-center">Salida</th>
              <th className="p-2 text-center">Venta sist.</th>
              <th className="p-2 text-center">Dif.</th>
              <th className="p-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const estilo = ESTADO_ESTILOS[f.estado];
              return (
                <Fragment key={f.id}>
                  <tr className="border-b border-gray-50">
                    <td className="p-2 font-medium whitespace-nowrap sticky left-0 bg-white">{f.nombre}</td>
                    <td className="p-2 text-center">{f.invAnterior ?? "—"}</td>
                    <td className="p-2 text-center">{f.entradas}</td>
                    <td className="p-2 text-center">{f.invActual ?? "—"}</td>
                    <td className="p-2 text-center">{f.salidaFisica ?? "—"}</td>
                    <td className="p-2 text-center">{f.ventaSistema}</td>
                    <td className={`p-2 text-center font-medium ${f.diferencia < 0 ? "text-red-600" : f.diferencia > 0 ? "text-orange-600" : ""}`}>
                      {f.diferencia === null ? "—" : `${f.diferencia > 0 ? "+" : ""}${f.diferencia}`}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => f.estado !== "incompleto" && setNotaAbierta(notaAbierta === f.id ? null : f.id)}
                        className={estilo.color}
                        title={estilo.label}
                      >
                        {estilo.icon}
                      </button>
                    </td>
                  </tr>
                  {notaAbierta === f.id && f.diferencia !== 0 && (
                    <tr>
                      <td colSpan={8} className="p-2 bg-gray-50">
                        <NotaDiferencia fecha={fecha} producto={f} store={store} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Salida física = Anterior + Entradas − Actual. Diferencia = Venta sistema − Salida física.
        Toca el ícono de estado en un renglón con diferencia para agregar una nota.
      </p>
    </div>
  );
}

function NotaDiferencia({ fecha, producto, store }) {
  const [motivo, setMotivo] = useState(producto.nota?.motivo || MOTIVOS_DIFERENCIA[0]);
  const [comentario, setComentario] = useState(producto.nota?.comentario || "");

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-700">
        {producto.diferencia < 0 ? "🔴 Faltante" : "🟠 Sobrante"} de {Math.abs(producto.diferencia)} {producto.nombre}
      </p>
      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-xs">
        {MOTIVOS_DIFERENCIA.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentario libre, ej. se revisará cámara de mesa 24…"
        className="border border-gray-200 rounded-lg p-2 text-xs"
        rows={2}
      />
      <button
        onClick={() => store.guardarNota(fecha, producto.id, { motivo, comentario })}
        className="bg-orange-600 text-white text-xs font-medium py-2 rounded-lg self-start px-4"
      >
        Guardar nota
      </button>
    </div>
  );
}

// ============ ENTRADAS / PROVEEDOR ============
function EntradasTab({ fecha, store }) {
  const [proveedor, setProveedor] = useState("");
  const [productoId, setProductoId] = useState(productos[0].id);
  const [solicitada, setSolicitada] = useState(0);
  const [recibida, setRecibida] = useState(0);
  const [notas, setNotas] = useState("");

  const entregasHoy = store.getDia(fecha)?.entregas || [];

  function registrar() {
    if (!proveedor.trim()) return;
    store.agregarEntrega(fecha, {
      proveedor: proveedor.trim(),
      productoId,
      cantidadSolicitada: solicitada,
      cantidadRecibida: recibida,
      usuario: "Tú",
      notas,
    });
    setProveedor(""); setSolicitada(0); setRecibida(0); setNotas("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-700">Registrar entrada</p>
        <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Proveedor" className="border border-gray-200 rounded-lg p-2 text-sm" />
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
          {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Solicitada</p>
            <NumberField value={solicitada} onChange={setSolicitada} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Recibida</p>
            <NumberField value={recibida} onChange={setRecibida} />
          </div>
        </div>
        <input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas (opcional)" className="border border-gray-200 rounded-lg p-2 text-sm" />
        <button onClick={registrar} className="bg-orange-600 text-white text-sm font-medium py-2 rounded-lg">
          Registrar entrada
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Entradas del {formatFechaLarga(fecha)}</p>
        {entregasHoy.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">Sin entradas registradas este día</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entregasHoy.map((e) => {
              const producto = productos.find((p) => p.id === e.productoId);
              const diferencia = e.cantidadRecibida - e.cantidadSolicitada;
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{producto?.nombre}</p>
                    <span className="text-xs text-gray-400">{e.proveedor}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitó {e.cantidadSolicitada} · Recibió {e.cantidadRecibida}
                    {diferencia !== 0 && <span className={diferencia < 0 ? "text-red-500" : "text-green-600"}> ({diferencia > 0 ? "+" : ""}{diferencia})</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">Lo registrado aquí se suma automáticamente al Cuadre de este día.</p>
    </div>
  );
}

// ============ HISTORIAL (lista + calendario) ============
function HistorialTab({ store, onSelectFecha }) {
  const [vista, setVista] = useState("lista");
  const [soloDiferencias, setSoloDiferencias] = useState(false);
  const [productoFiltro, setProductoFiltro] = useState("todos");
  const [mostrarCorregir, setMostrarCorregir] = useState(false);

  const fechas = Object.keys(store.dias).sort((a, b) => (a < b ? 1 : -1));

  const filas = fechas
    .map((f) => ({ fecha: f, resumen: store.resumenDia(f) }))
    .filter(({ resumen }) => {
      if (soloDiferencias && resumen.faltantes === 0 && resumen.sobrantes === 0) return false;
      if (productoFiltro !== "todos") {
        const fila = resumen.filas.find((x) => x.id === productoFiltro);
        if (!fila || fila.diferencia === 0 || fila.diferencia === null) return false;
      }
      return true;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setVista("lista")} className={`flex-1 text-xs font-medium py-2 rounded-lg ${vista === "lista" ? "bg-white shadow-sm" : "text-gray-500"}`}>Lista</button>
        <button onClick={() => setVista("calendario")} className={`flex-1 text-xs font-medium py-2 rounded-lg ${vista === "calendario" ? "bg-white shadow-sm" : "text-gray-500"}`}>Calendario</button>
      </div>

      <button
        onClick={() => setMostrarCorregir((v) => !v)}
        className="text-xs text-orange-700 font-medium text-left"
      >
        {mostrarCorregir ? "▲ Ocultar" : "✏️ ¿Capturaste algo en la fecha equivocada? Corregir aquí"}
      </button>
      {mostrarCorregir && <CorregirFecha store={store} fechasDisponibles={fechas} />}

      {vista === "calendario" ? (
        <CalendarioMensual store={store} onSelectFecha={onSelectFecha} />
      ) : (
        <>
          <div className="flex gap-2">
            <select value={productoFiltro} onChange={(e) => setProductoFiltro(e.target.value)} className="flex-1 border border-gray-200 rounded-lg p-2 text-xs">
              <option value="todos">Todos los productos</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input type="checkbox" checked={soloDiferencias} onChange={(e) => setSoloDiferencias(e.target.checked)} />
              Solo diferencias
            </label>
          </div>

          {filas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">Sin días capturados todavía</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filas.map(({ fecha, resumen }) => (
                <button key={fecha} onClick={() => onSelectFecha(fecha)} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-left">
                  <div>
                    <p className="text-sm font-medium">{formatFechaLarga(fecha)}</p>
                    <p className="text-xs text-gray-400">
                      {resumen.cuadran} cuadran{resumen.faltantes > 0 && ` · ${resumen.faltantes} faltante(s)`}{resumen.sobrantes > 0 && ` · ${resumen.sobrantes} sobrante(s)`}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${resumen.totalDiferencia < 0 ? "text-red-600" : resumen.totalDiferencia > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {resumen.totalDiferencia > 0 ? "+" : ""}{resumen.totalDiferencia}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ CORREGIR FECHA EQUIVOCADA ============
function CorregirFecha({ store, fechasDisponibles }) {
  const [origen, setOrigen] = useState(fechasDisponibles[0] || "");
  const [destino, setDestino] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [hecho, setHecho] = useState(false);

  const destinoYaTieneDatos = destino && store.getDia(destino);

  function mover() {
    store.moverDia(origen, destino);
    setConfirmando(false);
    setHecho(true);
    setDestino("");
  }

  if (fechasDisponibles.length === 0) return null;

  return (
    <div className="bg-amber-50 rounded-xl p-3 flex flex-col gap-2 text-sm">
      <p className="text-xs text-amber-800">
        Mueve todo lo capturado en un día (inventario, venta, entradas, notas) hacia la fecha correcta.
      </p>

      <label className="text-xs text-gray-600">Tiene datos capturados en:</label>
      <select
        value={origen}
        onChange={(e) => { setOrigen(e.target.value); setHecho(false); }}
        className="border border-gray-200 rounded-lg p-2 text-sm bg-white"
      >
        {fechasDisponibles.map((f) => (
          <option key={f} value={f}>{formatFechaLarga(f)}</option>
        ))}
      </select>

      <label className="text-xs text-gray-600">En realidad es del día:</label>
      <input
        type="date"
        value={destino}
        onChange={(e) => { setDestino(e.target.value); setHecho(false); }}
        className="border border-gray-200 rounded-lg p-2 text-sm bg-white"
      />

      {destinoYaTieneDatos && (
        <p className="text-xs text-red-600">
          ⚠️ Esa fecha destino ya tiene datos capturados — se van a reemplazar por los de la fecha de origen.
        </p>
      )}

      {hecho ? (
        <p className="text-xs text-green-700 font-medium">✅ Movido correctamente.</p>
      ) : confirmando ? (
        <div className="flex gap-2">
          <button onClick={() => setConfirmando(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg">
            CANCELAR
          </button>
          <button onClick={mover} className="flex-1 bg-red-600 text-white text-xs font-medium py-2 rounded-lg">
            SÍ, MOVER
          </button>
        </div>
      ) : (
        <button
          disabled={!origen || !destino}
          onClick={() => setConfirmando(true)}
          className="bg-orange-600 disabled:bg-gray-300 text-white text-xs font-medium py-2 rounded-lg"
        >
          MOVER DATOS
        </button>
      )}
    </div>
  );
}

const ESTADO_CALENDARIO = {
  sin_info: { icon: "⚪", bg: "bg-gray-50" },
  incompleta: { icon: "🟡", bg: "bg-amber-50" },
  cuadra: { icon: "🟢", bg: "bg-green-50" },
  faltante: { icon: "🔴", bg: "bg-red-50" },
  sobrante: { icon: "🟠", bg: "bg-orange-50" },
};

function CalendarioMensual({ store, onSelectFecha }) {
  const [mesActual, setMesActual] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const year = mesActual.getFullYear();
  const month = mesActual.getMonth();
  const primerDiaSemana = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const nombreMes = mesActual.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  function cambiarMes(delta) {
    setMesActual((prev) => { const d = new Date(prev); d.setMonth(d.getMonth() + delta); return d; });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button onClick={() => cambiarMes(-1)} className="text-sm text-gray-500 px-2">‹</button>
        <p className="text-sm font-medium capitalize">{nombreMes}</p>
        <button onClick={() => cambiarMes(1)} className="text-sm text-gray-500 px-2">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={i} />;
          const fechaISO = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const estado = store.resumenDia(fechaISO).estadoDia;
          const estilo = ESTADO_CALENDARIO[estado];
          return (
            <button
              key={i}
              onClick={() => onSelectFecha(fechaISO)}
              className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 ${estilo.bg}`}
            >
              <span>{dia}</span>
              <span className="text-[10px]">{estilo.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ PEDIDO DE CERVEZA ============
function PedidoTab({ fecha, store, alerta }) {
  const dias = Object.keys(store.dias).sort((a, b) => (a < b ? 1 : -1)).slice(0, 7);

  const promedios = productos.map((p) => {
    const valores = dias.map((f) => store.getDia(f)?.ventaSistema[p.id] || 0);
    const promedio = valores.length ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : null;
    return { ...p, promedio };
  }).filter((p) => p.promedio !== null && Number(p.promedio) > 0);

  return (
    <div className="flex flex-col gap-3">
      {alerta ? (
        <div className={`rounded-xl p-3 text-sm font-medium ${alerta.nivel === "urgente" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
          {alerta.icon} {alerta.texto}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">Hoy no toca revisar pedido — los días son miércoles y viernes.</p>
      )}

      <p className="text-sm font-medium text-gray-700">Consumo promedio (últimos {dias.length} días capturados)</p>
      {promedios.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-100">
          Aún no hay suficiente historial de venta para sugerir cantidades
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {promedios.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-sm">
              <span>{p.nombre}</span>
              <span className="text-gray-500">{p.promedio} / día</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 text-center">
        Más adelante esto se convertirá en una sugerencia automática de cuánto pedir,
        usando inventario actual, stock mínimo y consumo histórico.
      </p>
    </div>
  );
}

// ============ EXPORTAR EXCEL ============
function ExportarExcel({ store }) {
  const [rango, setRango] = useState("mes");

  function fechasEnRango() {
    const todas = Object.keys(store.dias).sort();
    const hoy = new Date();
    if (rango === "todo") return todas;
    if (rango === "hoy") return todas.filter((f) => f === hoyISO());
    if (rango === "semana") {
      const hace7 = addDaysISO(hoyISO(), -7);
      return todas.filter((f) => f >= hace7);
    }
    if (rango === "mes") {
      const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
      return todas.filter((f) => f >= inicioMes);
    }
    return todas;
  }

  function descargar() {
    const fechas = fechasEnRango();
    if (fechas.length === 0) {
      alert("No hay días capturados en ese rango todavía.");
      return;
    }

    const resumenRows = fechas.map((f) => {
      const r = store.resumenDia(f);
      return { Fecha: f, Cuadran: r.cuadran, Faltantes: r.faltantes, Sobrantes: r.sobrantes, "Diferencia total": r.totalDiferencia };
    });

    const detalleRows = [];
    const diferenciasRows = [];
    const entradasRows = [];
    fechas.forEach((f) => {
      const filas = store.computeCuadreDia(f);
      filas.forEach((fila) => {
        detalleRows.push({
          Fecha: f, Producto: fila.nombre, Anterior: fila.invAnterior, Entradas: fila.entradas,
          Actual: fila.invActual, "Salida física": fila.salidaFisica, "Venta sistema": fila.ventaSistema,
          Diferencia: fila.diferencia, Estado: fila.estado,
        });
        if (fila.diferencia) {
          diferenciasRows.push({
            Fecha: f, Producto: fila.nombre, Diferencia: fila.diferencia,
            Motivo: fila.nota?.motivo || "", Comentario: fila.nota?.comentario || "",
          });
        }
      });
      (store.getDia(f)?.entregas || []).forEach((e) => {
        const producto = productos.find((p) => p.id === e.productoId);
        entradasRows.push({
          Fecha: f, Proveedor: e.proveedor, Producto: producto?.nombre, Solicitada: e.cantidadSolicitada,
          Recibida: e.cantidadRecibida, Diferencia: e.cantidadRecibida - e.cantidadSolicitada, Usuario: e.usuario, Notas: e.notas,
        });
      });
    });

    const porProductoRows = productos.map((p) => {
      const ventas = fechas.map((f) => store.getDia(f)?.ventaSistema[p.id] || 0);
      const totalVendido = ventas.reduce((a, b) => a + b, 0);
      const diferenciasProducto = fechas.reduce((s, f) => {
        const fila = store.computeCuadreDia(f).find((x) => x.id === p.id);
        return s + (fila?.diferencia || 0);
      }, 0);
      return { Producto: p.nombre, "Total vendido": totalVendido, "Promedio diario": (totalVendido / fechas.length).toFixed(1), "Total diferencias": diferenciasProducto };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenRows), "Resumen");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalleRows), "Detalle diario");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(porProductoRows), "Por producto");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diferenciasRows), "Diferencias");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entradasRows), "Entradas");

    XLSX.writeFile(wb, `cerveza_${rango}_${hoyISO()}.xlsx`);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">Rango a exportar</p>
      <select value={rango} onChange={(e) => setRango(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
        <option value="hoy">Hoy</option>
        <option value="semana">Últimos 7 días</option>
        <option value="mes">Este mes</option>
        <option value="todo">Todo el historial</option>
      </select>

      <button onClick={descargar} className="bg-orange-600 text-white text-sm font-medium py-3 rounded-xl active:bg-orange-700">
        DESCARGAR EXCEL
      </button>

      <p className="text-xs text-gray-400 text-center">
        El archivo incluye 5 hojas: Resumen, Detalle diario, Por producto, Diferencias y Entradas.
      </p>
    </div>
  );
}
