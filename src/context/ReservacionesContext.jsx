import { createContext, useContext, useCallback } from "react";
import { useSyncedState } from "../hooks/useSyncedState";

const ReservacionesContext = createContext(null);

export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function esGrupoGrande(r) {
  return r.personas >= 10;
}

export function horaAMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function parseMesas(texto) {
  return texto.split(/[+,]/).map((s) => s.trim()).filter(Boolean);
}

export function enmascararTelefono(telefono) {
  if (!telefono || telefono.length < 6) return telefono || "—";
  const limpio = telefono.replace(/\s/g, "");
  return `${limpio.slice(0, 3)} ••• ••${limpio.slice(-2)}`;
}

export function ReservacionesProvider({ children }) {
  const [reservas, setReservas] = useSyncedState("reservaciones", []);

  const detectarConflicto = useCallback(
    (fecha, hora, mesas, excluirId = null) => {
      if (!mesas || mesas.length === 0) return null;
      const minutos = horaAMinutos(hora);
      for (const r of reservas) {
        if (r.id === excluirId) continue;
        if (r.fecha !== fecha) continue;
        if (r.estado === "cancelada") continue;
        const compartidas = r.mesas.filter((m) => mesas.includes(m));
        if (compartidas.length === 0) continue;
        if (Math.abs(horaAMinutos(r.hora) - minutos) < 120) {
          return { mesa: compartidas[0], reserva: r };
        }
      }
      return null;
    },
    [reservas]
  );

  function crearReservacion(datos, usuario = "Tú") {
    const mesas = parseMesas(datos.mesasTexto || "");
    const nueva = {
      id: `r${Date.now()}`,
      fecha: datos.fecha,
      hora: datos.hora,
      nombreCliente: datos.nombreCliente,
      telefono: datos.telefono,
      personas: Number(datos.personas),
      area: datos.area,
      mesas,
      notas: datos.notas || "",
      estado: "pendiente",
      horaLlegada: null,
      confirmacion: null,
      historialCambios: [],
      creadoPor: usuario,
      creadoEn: new Date().toLocaleString("es-MX"),
    };
    setReservas((prev) => [...prev, nueva]);
    return nueva;
  }

  function editarReservacion(id, cambios, usuario = "Tú") {
    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const historialCambios = [...r.historialCambios];
        [["fecha", "Fecha"], ["hora", "Hora"], ["personas", "Personas"], ["area", "Área"]].forEach(([campo, label]) => {
          if (cambios[campo] !== undefined && cambios[campo] !== r[campo]) {
            historialCambios.push({ campo: label, anterior: r[campo], nuevo: cambios[campo], usuario, fecha: new Date().toLocaleString("es-MX") });
          }
        });
        return { ...r, ...cambios, historialCambios };
      })
    );
  }

  function cambiarEstado(id, estado, extra = {}) {
    setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado, ...extra } : r)));
  }

  function confirmar(id, usuario = "Tú", observaciones = "") {
    cambiarEstado(id, "confirmada", { confirmacion: { cuando: new Date().toLocaleString("es-MX"), quien: usuario, observaciones } });
  }

  function marcarLlego(id) {
    cambiarEstado(id, "llego", { horaLlegada: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) });
  }

  return (
    <ReservacionesContext.Provider
      value={{ reservas, crearReservacion, editarReservacion, cambiarEstado, confirmar, marcarLlego, detectarConflicto }}
    >
      {children}
    </ReservacionesContext.Provider>
  );
}

export function useReservaciones() {
  const ctx = useContext(ReservacionesContext);
  if (!ctx) throw new Error("useReservaciones debe usarse dentro de ReservacionesProvider");
  return ctx;
}
