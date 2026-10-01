import { useState } from "react";
import {
  useReservaciones, hoyISO, esGrupoGrande, enmascararTelefono, horaAMinutos,
} from "../context/ReservacionesContext";

const AREAS = [
  { id: "A", nombre: "A - Adentro" },
  { id: "B", nombre: "B - Afuera" },
  { id: "T", nombre: "T - Terraza" },
];

const ESTADOS = {
  pendiente: { icon: "🟡", label: "Pendiente", color: "bg-amber-50 text-amber-700" },
  confirmada: { icon: "🔵", label: "Confirmada", color: "bg-blue-50 text-blue-700" },
  llego: { icon: "🟢", label: "Llegó", color: "bg-green-50 text-green-700" },
  sentada: { icon: "🪑", label: "Sentada", color: "bg-purple-50 text-purple-700" },
  finalizada: { icon: "✅", label: "Finalizada", color: "bg-gray-100 text-gray-600" },
  cancelada: { icon: "❌", label: "Cancelada", color: "bg-red-50 text-red-700" },
  no_llego: { icon: "🔴", label: "No llegó", color: "bg-red-50 text-red-700" },
};

function addDaysISO(iso, delta) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function inicioSemana(iso) {
  const d = new Date(iso + "T12:00:00");
  const dia = d.getDay();
  d.setDate(d.getDate() - dia);
  return d.toISOString().slice(0, 10);
}

export default function Reservaciones() {
  const { reservas } = useReservaciones();
  const [vista, setVista] = useState("hoy"); // hoy | manana | semana | mes | calendario
  const [areaFiltro, setAreaFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  const hoy = hoyISO();

  function enRango(r) {
    if (vista === "hoy") return r.fecha === hoy;
    if (vista === "manana") return r.fecha === addDaysISO(hoy, 1);
    if (vista === "semana") {
      const inicio = inicioSemana(hoy);
      const fin = addDaysISO(inicio, 6);
      return r.fecha >= inicio && r.fecha <= fin;
    }
    if (vista === "mes") return r.fecha.slice(0, 7) === hoy.slice(0, 7);
    return true; // calendario / todas
  }

  const filtradas = reservas
    .filter(enRango)
    .filter((r) => areaFiltro === "todas" || r.area === areaFiltro)
    .filter((r) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        r.nombreCliente.toLowerCase().includes(q) ||
        r.telefono?.includes(q) ||
        r.fecha.includes(q) ||
        r.estado.includes(q)
      );
    })
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  if (seleccionada) {
    return <FichaReservacion reserva={seleccionada} onBack={() => setSeleccionada(null)} />;
  }

  if (mostrarForm) {
    return <FormularioReservacion onCancel={() => setMostrarForm(false)} onGuardado={() => setMostrarForm(false)} />;
  }

  const reservasHoy = reservas.filter((r) => r.fecha === hoy && r.estado !== "cancelada");
  const personasHoy = reservasHoy.reduce((s, r) => s + r.personas, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Sucursal Centro</p>
          <h1 className="text-xl font-semibold">Reservaciones</h1>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-xs">
        <span>Hoy: <strong>{reservasHoy.length}</strong> reservaciones</span>
        <span><strong>{personasHoy}</strong> personas</span>
      </div>

      <button
        onClick={() => setMostrarForm(true)}
        className="bg-orange-600 text-white text-sm font-semibold py-3 rounded-xl active:bg-orange-700"
      >
        ＋ NUEVA RESERVACIÓN
      </button>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {[["hoy", "Hoy"], ["manana", "Mañana"], ["semana", "Semana"], ["mes", "Mes"], ["calendario", "Todas"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-lg ${vista === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {[["todas", "Todas"], ...AREAS.map((a) => [a.id, a.nombre])].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAreaFiltro(id)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg ${areaFiltro === id ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, teléfono, fecha, estado…"
        className="border border-gray-200 rounded-xl p-3 text-sm"
      />

      {filtradas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Sin reservaciones {vista === "hoy" ? "para hoy" : "en este rango"}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((r) => (
            <TarjetaReserva key={r.id} reserva={r} onClick={() => setSeleccionada(r)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaReserva({ reserva: r, onClick }) {
  const estado = ESTADOS[r.estado];
  const grupoGrande = esGrupoGrande(r);
  const faltaMesas = r.mesas.length === 0 && r.estado !== "cancelada" && r.estado !== "finalizada";

  return (
    <button onClick={onClick} className="bg-white rounded-xl border border-gray-100 p-3 text-left">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{r.hora} — {r.nombreCliente}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${estado.color}`}>{estado.icon} {estado.label}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {r.fecha} · {r.personas} personas · Área {r.area} · {enmascararTelefono(r.telefono)}
      </p>
      <div className="flex gap-2 mt-1">
        {grupoGrande && <span className="text-xs text-orange-600 font-medium">⚠️ Grupo grande</span>}
        {faltaMesas && <span className="text-xs text-red-600 font-medium">🔴 Falta asignar mesas</span>}
      </div>
      {r.notas && <p className="text-xs text-gray-500 mt-1">📝 {r.notas}</p>}
    </button>
  );
}

function FormularioReservacion({ onCancel, onGuardado, reservaExistente }) {
  const { crearReservacion, editarReservacion, detectarConflicto } = useReservaciones();
  const editando = Boolean(reservaExistente);

  const [fecha, setFecha] = useState(reservaExistente?.fecha || hoyISO());
  const [hora, setHora] = useState(reservaExistente?.hora || "");
  const [nombreCliente, setNombreCliente] = useState(reservaExistente?.nombreCliente || "");
  const [personas, setPersonas] = useState(reservaExistente?.personas || "");
  const [telefono, setTelefono] = useState(reservaExistente?.telefono || "");
  const [area, setArea] = useState(reservaExistente?.area || "A");
  const [mesasTexto, setMesasTexto] = useState(reservaExistente?.mesas?.join(" + ") || "");
  const [notas, setNotas] = useState(reservaExistente?.notas || "");
  const [confirmado, setConfirmado] = useState(null);
  const [conflicto, setConflicto] = useState(null);

  function intentarGuardar() {
    if (!hora || !nombreCliente.trim() || !personas) return;
    const mesas = mesasTexto.split(/[+,]/).map((s) => s.trim()).filter(Boolean);
    const c = detectarConflicto(fecha, hora, mesas, reservaExistente?.id);
    if (c) {
      setConflicto(c);
      return;
    }
    guardar();
  }

  function guardar() {
    const datos = { fecha, hora, nombreCliente, personas: Number(personas), telefono, area, mesasTexto, notas };
    if (editando) {
      editarReservacion(reservaExistente.id, { ...datos, mesas: datos.mesasTexto.split(/[+,]/).map((s) => s.trim()).filter(Boolean) });
    } else {
      crearReservacion(datos);
    }
    setConfirmado({ nombreCliente, personas, area, fecha, hora });
    setConflicto(null);
  }

  if (confirmado) {
    return (
      <div className="flex flex-col gap-4 items-center text-center py-10">
        <p className="text-3xl">✅</p>
        <p className="text-lg font-semibold">RESERVACIÓN REGISTRADA</p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 w-full max-w-xs">
          <p className="font-medium">{confirmado.nombreCliente}</p>
          <p className="text-sm text-gray-500">{confirmado.personas} personas · Área {confirmado.area}</p>
          <p className="text-sm text-gray-500">{confirmado.fecha} · {confirmado.hora}</p>
        </div>
        <button onClick={onGuardado} className="text-orange-700 text-sm font-medium">Volver a Reservaciones</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={onCancel} className="text-sm text-orange-700 self-start">← Cancelar</button>
      <h1 className="text-xl font-semibold">{editando ? "Editar reservación" : "Nueva reservación"}</h1>

      {conflicto && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
          ⚠️ CONFLICTO DE RESERVACIÓN — La mesa {conflicto.mesa} ya está reservada a esa hora
          por {conflicto.reserva.nombreCliente} ({conflicto.reserva.hora}).
          <button onClick={guardar} className="block mt-2 text-xs underline">Guardar de todas formas</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm" />
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm" />
      </div>
      <input value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} placeholder="Nombre del cliente" className="border border-gray-200 rounded-lg p-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" value={personas} onChange={(e) => setPersonas(e.target.value)} placeholder="Personas" className="border border-gray-200 rounded-lg p-2 text-sm" />
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" className="border border-gray-200 rounded-lg p-2 text-sm" />
      </div>
      <select value={area} onChange={(e) => setArea(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
        {AREAS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
      <input value={mesasTexto} onChange={(e) => setMesasTexto(e.target.value)} placeholder="Mesas asignadas (ej. B1 + B2) — opcional" className="border border-gray-200 rounded-lg p-2 text-sm" />
      <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas especiales (cumpleaños, silla para bebé…)" className="border border-gray-200 rounded-lg p-2 text-sm" rows={2} />

      <button onClick={intentarGuardar} className="bg-orange-600 text-white text-sm font-semibold py-3 rounded-xl active:bg-orange-700">
        GUARDAR RESERVACIÓN
      </button>
    </div>
  );
}

function FichaReservacion({ reserva, onBack }) {
  const { confirmar, cambiarEstado, marcarLlego } = useReservaciones();
  const [editando, setEditando] = useState(false);
  const estado = ESTADOS[reserva.estado];
  const grupoGrande = esGrupoGrande(reserva);

  if (editando) {
    return <FormularioReservacion reservaExistente={reserva} onCancel={() => setEditando(false)} onGuardado={() => setEditando(false)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="text-sm text-orange-700 self-start">← Volver a Reservaciones</button>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{reserva.nombreCliente}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${estado.color}`}>{estado.icon} {estado.label}</span>
        </div>
        <p className="text-sm text-gray-500">{reserva.fecha} · {reserva.hora} · Área {reserva.area}</p>
      </div>

      {grupoGrande && (
        <div className="bg-orange-50 text-orange-700 rounded-xl p-3 text-sm font-medium">
          ⚠️ GRUPO GRANDE — {reserva.personas} personas, Área {reserva.area}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Personas</span><span>{reserva.personas}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Teléfono</span><span>{reserva.telefono || "—"}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Mesas</span><span>{reserva.mesas.length ? reserva.mesas.join(" + ") : "Sin asignar"}</span></div>
        {reserva.horaLlegada && <div className="flex justify-between"><span className="text-gray-500">Llegó a las</span><span>{reserva.horaLlegada}</span></div>}
        <div className="flex justify-between"><span className="text-gray-500">Registró</span><span>{reserva.creadoPor} · {reserva.creadoEn}</span></div>
      </div>

      {reserva.notas && (
        <div className="bg-amber-50 text-amber-700 rounded-xl p-3 text-sm">📝 {reserva.notas}</div>
      )}

      {reserva.confirmacion && (
        <p className="text-xs text-gray-400">
          Confirmó {reserva.confirmacion.quien} el {reserva.confirmacion.cuando}
          {reserva.confirmacion.observaciones && ` — ${reserva.confirmacion.observaciones}`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {reserva.estado === "pendiente" && (
          <button onClick={() => confirmar(reserva.id)} className="bg-blue-600 text-white text-sm font-medium py-2 rounded-lg">Confirmar</button>
        )}
        {(reserva.estado === "pendiente" || reserva.estado === "confirmada") && (
          <button onClick={() => marcarLlego(reserva.id)} className="bg-green-600 text-white text-sm font-medium py-2 rounded-lg">Marcar llegó</button>
        )}
        {reserva.estado === "llego" && (
          <button onClick={() => cambiarEstado(reserva.id, "sentada")} className="bg-purple-600 text-white text-sm font-medium py-2 rounded-lg">Sentar</button>
        )}
        {reserva.estado === "sentada" && (
          <button onClick={() => cambiarEstado(reserva.id, "finalizada")} className="bg-gray-600 text-white text-sm font-medium py-2 rounded-lg">Finalizar</button>
        )}
        {reserva.telefono && (
          <a href={`tel:${reserva.telefono}`} className="bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg text-center">📞 Llamar</a>
        )}
        {reserva.telefono && (
          <a href={`https://wa.me/${reserva.telefono.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="bg-green-50 text-green-700 text-sm font-medium py-2 rounded-lg text-center">💬 WhatsApp</a>
        )}
        <button onClick={() => setEditando(true)} className="bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg">✏️ Editar</button>
        {reserva.estado !== "cancelada" && (
          <button onClick={() => cambiarEstado(reserva.id, "cancelada")} className="bg-red-50 text-red-700 text-sm font-medium py-2 rounded-lg">Cancelar</button>
        )}
      </div>

      {reserva.historialCambios.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Historial de cambios</p>
          <div className="flex flex-col gap-1">
            {reserva.historialCambios.map((c, i) => (
              <p key={i} className="text-xs text-gray-500">
                {c.campo}: {String(c.anterior)} → {String(c.nuevo)} · {c.usuario} · {c.fecha}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
