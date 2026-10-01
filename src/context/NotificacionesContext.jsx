import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useReservaciones, hoyISO, horaAMinutos } from "./ReservacionesContext";
import { estadoPedidoDelDia } from "../data/mockCerveza";
import { useSyncedState } from "../hooks/useSyncedState";

const NotificacionesContext = createContext(null);

const CLAVE_YA_NOTIFICADOS = "chilliwings_ya_notificados";

function leerYaNotificados() {
  try {
    const hoy = hoyISO();
    const guardado = JSON.parse(localStorage.getItem(CLAVE_YA_NOTIFICADOS) || "{}");
    if (guardado.dia !== hoy) return { dia: hoy, claves: [] };
    return guardado;
  } catch {
    return { dia: hoyISO(), claves: [] };
  }
}

function marcarNotificado(clave) {
  const actual = leerYaNotificados();
  actual.claves.push(clave);
  localStorage.setItem(CLAVE_YA_NOTIFICADOS, JSON.stringify(actual));
}

function yaFueNotificado(clave) {
  return leerYaNotificados().claves.includes(clave);
}

async function mostrarNotificacion(titulo, opciones) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(titulo, { icon: "/icon-192.png", badge: "/icon-192.png", ...opciones });
    } else {
      new Notification(titulo, opciones);
    }
  } catch {
    // si el navegador no soporta notificaciones, la app sigue funcionando normal
  }
}

/**
 * Motor de notificaciones reales (aparecen en la pantalla de bloqueo / centro
 * de notificaciones del celular, no solo dentro de la app).
 *
 * IMPORTANTE — límite honesto: esto funciona mientras la app esté abierta en
 * una pestaña (puede estar en segundo plano) o instalada como app ("Agregar
 * a pantalla de inicio"). Si cierras completamente el navegador, deja de
 * revisar — eso requeriría un servidor de notificaciones push aparte.
 */
export function NotificacionesProvider({ children }) {
  const { reservas } = useReservaciones();
  const [permiso, setPermiso] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [historial, setHistorial] = useSyncedState("notificaciones_historial", []);
  const reservasRef = useRef(reservas);
  reservasRef.current = reservas;

  async function pedirPermiso() {
    if (typeof Notification === "undefined") return;
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);
  }

  function registrar(tipo, texto) {
    setHistorial((prev) =>
      [{ id: `n${Date.now()}`, tipo, texto, fecha: new Date().toLocaleString("es-MX") }, ...prev].slice(0, 200)
    );
  }

  useEffect(() => {
    if (permiso !== "granted") return;

    function revisar() {
      const ahoraMin = horaAMinutos(
        new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false })
      );
      const hoy = hoyISO();

      // 1) Reservaciones próximas (1 hora y 30 min antes)
      reservasRef.current
        .filter((r) => r.fecha === hoy && !["cancelada", "finalizada", "no_llego"].includes(r.estado))
        .forEach((r) => {
          const minutosFaltantes = horaAMinutos(r.hora) - ahoraMin;

          if (minutosFaltantes <= 60 && minutosFaltantes > 45) {
            const clave = `reserva-1h-${r.id}`;
            if (!yaFueNotificado(clave)) {
              mostrarNotificacion("⏰ Reservación en 1 hora", {
                body: `${r.nombreCliente} — ${r.personas} personas — Área ${r.area}`,
              });
              registrar("recordatorio", `Reservación en 1 hora: ${r.nombreCliente}, ${r.personas} personas, Área ${r.area}`);
              marcarNotificado(clave);
            }
          }

          if (minutosFaltantes <= 30 && minutosFaltantes > 15) {
            const clave = `reserva-30m-${r.id}`;
            if (!yaFueNotificado(clave)) {
              const sinMesas = !r.mesas || r.mesas.length === 0;
              mostrarNotificacion("⏰ Reservación en 30 min", {
                body: sinMesas
                  ? `🔴 Falta asignar mesas — ${r.nombreCliente}, ${r.personas} personas`
                  : `Preparar mesas para ${r.personas} personas (${r.nombreCliente})`,
              });
              registrar("urgente", `Reservación en 30 min: ${r.nombreCliente} — ${sinMesas ? "falta asignar mesas" : "preparar mesas"}`);
              marcarNotificado(clave);
            }
          }
        });

      // 2) Recordatorio de pedido de cerveza (una vez al día)
      const alertaPedido = estadoPedidoDelDia(new Date());
      if (alertaPedido) {
        const clave = `pedido-cerveza-${hoy}`;
        if (!yaFueNotificado(clave)) {
          mostrarNotificacion(alertaPedido.icon + " Pedido de cerveza", { body: alertaPedido.texto });
          registrar(alertaPedido.nivel === "urgente" ? "urgente" : "recordatorio", alertaPedido.texto);
          marcarNotificado(clave);
        }
      }
    }

    revisar();
    const intervalo = setInterval(revisar, 60 * 1000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permiso]);

  return (
    <NotificacionesContext.Provider value={{ permiso, pedirPermiso, historial }}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error("useNotificaciones debe usarse dentro de NotificacionesProvider");
  return ctx;
}
