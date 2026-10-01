import { useCallback } from "react";
import { productos } from "../data/mockCerveza";
import { useSyncedState } from "./useSyncedState";

// Motivos sugeridos para justificar una diferencia (sección 8 del documento).
export const MOTIVOS_DIFERENCIA = [
  "No se marcó en sistema",
  "Consumo de personal",
  "Cortesía",
  "Merma",
  "Botella rota",
  "Error de captura",
  "Error de inventario",
  "Producto regalado",
  "Pendiente investigar",
  "Otro",
];

export function addDaysISO(iso, delta) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function formatFechaLarga(iso) {
  const d = new Date(iso + "T12:00:00");
  const texto = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function emptyDia() {
  return {
    inventario: {},
    entradas: {}, // productoId -> total recibido ese día (suma de todas las entregas)
    entregas: [], // detalle: {id, proveedor, productoId, cantidadSolicitada, cantidadRecibida, usuario, notas}
    ventaSistema: {},
    notas: {}, // productoId -> { motivo, comentario }
    meta: { horaCaptura: null, usuario: null, ultimaModificacion: null },
  };
}

export function useCervezaStore() {
  const [dias, setDias, listo] = useSyncedState("cerveza_dias", {});

  const getDia = useCallback((fecha) => dias[fecha] || null, [dias]);

  const getInventarioProducto = useCallback(
    (fecha, productoId) => {
      const dia = dias[fecha];
      if (!dia || dia.inventario[productoId] === undefined) return null;
      return dia.inventario[productoId];
    },
    [dias]
  );

  function guardarInventario(fecha, inventario, usuario = "Tú") {
    setDias((prev) => {
      const actual = prev[fecha] || emptyDia();
      return {
        ...prev,
        [fecha]: {
          ...actual,
          inventario,
          meta: {
            horaCaptura: actual.meta.horaCaptura || new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            usuario: actual.meta.usuario || usuario,
            ultimaModificacion: new Date().toLocaleString("es-MX"),
          },
        },
      };
    });
  }

  function guardarVenta(fecha, ventaSistema) {
    setDias((prev) => {
      const actual = prev[fecha] || emptyDia();
      return { ...prev, [fecha]: { ...actual, ventaSistema } };
    });
  }

  function agregarEntrega(fecha, entrega) {
    setDias((prev) => {
      const actual = prev[fecha] || emptyDia();
      const entregas = [...actual.entregas, { id: `${fecha}-${actual.entregas.length + 1}`, ...entrega }];
      const entradas = { ...actual.entradas };
      entradas[entrega.productoId] = (entradas[entrega.productoId] || 0) + entrega.cantidadRecibida;
      return { ...prev, [fecha]: { ...actual, entregas, entradas } };
    });
  }

  function guardarNota(fecha, productoId, nota) {
    setDias((prev) => {
      const actual = prev[fecha] || emptyDia();
      return { ...prev, [fecha]: { ...actual, notas: { ...actual.notas, [productoId]: nota } } };
    });
  }

  // Corrige errores de captura: mueve todo lo registrado en "fechaOrigen"
  // hacia "fechaDestino" (por ejemplo, si por error se capturó el inventario
  // del 16 de septiembre bajo la fecha "16 de octubre"). Si fechaDestino ya
  // tenía datos, se sobrescriben — por eso la app pide confirmar antes.
  function moverDia(fechaOrigen, fechaDestino) {
    setDias((prev) => {
      const datosOrigen = prev[fechaOrigen];
      if (!datosOrigen) return prev;
      const copia = { ...prev };
      copia[fechaDestino] = {
        ...datosOrigen,
        meta: { ...datosOrigen.meta, ultimaModificacion: new Date().toLocaleString("es-MX") },
      };
      delete copia[fechaOrigen];
      return copia;
    });
  }

  // El corazón del módulo: para cada producto calcula
  // salida física = inventario anterior + entradas − inventario actual
  // diferencia = venta sistema − salida física
  const computeCuadreDia = useCallback(
    (fecha) => {
      const fechaAnterior = addDaysISO(fecha, -1);
      const diaHoy = dias[fecha];
      return productos.map((p) => {
        const invAnterior = getInventarioProducto(fechaAnterior, p.id);
        const invActual = getInventarioProducto(fecha, p.id);
        const entradas = diaHoy?.entradas[p.id] || 0;
        const ventaSistema = diaHoy?.ventaSistema[p.id] || 0;
        let salidaFisica = null;
        let diferencia = null;
        let estado = "incompleto";

        if (invAnterior !== null && invActual !== null) {
          salidaFisica = invAnterior + entradas - invActual;
          diferencia = ventaSistema - salidaFisica;
          estado = diferencia === 0 ? "cuadra" : diferencia < 0 ? "faltante" : "sobrante";
        }

        return {
          ...p,
          invAnterior,
          invActual,
          entradas,
          ventaSistema,
          salidaFisica,
          diferencia,
          estado,
          nota: diaHoy?.notas?.[p.id] || null,
        };
      });
    },
    [dias, getInventarioProducto]
  );

  const resumenDia = useCallback(
    (fecha) => {
      const filas = computeCuadreDia(fecha);
      const capturado = filas.some((f) => f.invActual !== null);
      const completo = filas.every((f) => f.invActual !== null);
      const cuadran = filas.filter((f) => f.estado === "cuadra").length;
      const faltantes = filas.filter((f) => f.estado === "faltante").length;
      const sobrantes = filas.filter((f) => f.estado === "sobrante").length;
      const totalDiferencia = filas.reduce((s, f) => s + (f.diferencia || 0), 0);

      let estadoDia = "sin_info";
      if (capturado && completo) {
        if (faltantes > 0) estadoDia = "faltante";
        else if (sobrantes > 0) estadoDia = "sobrante";
        else estadoDia = "cuadra";
      } else if (capturado && !completo) {
        estadoDia = "incompleta";
      }

      return { filas, capturado, completo, cuadran, faltantes, sobrantes, totalDiferencia, estadoDia };
    },
    [computeCuadreDia]
  );

  return {
    dias,
    listo,
    getDia,
    guardarInventario,
    guardarVenta,
    agregarEntrega,
    guardarNota,
    moverDia,
    getInventarioProducto,
    computeCuadreDia,
    resumenDia,
  };
}
