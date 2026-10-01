import { useCallback, useMemo } from "react";
import { useSyncedState } from "./useSyncedState";

export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Ventas de postres registradas "del sistema": quién (mesero) vendió qué
// postre y cuántos — para poder sacar estadísticas reales.
export function usePostresVentas() {
  const [ventas, setVentas, listo] = useSyncedState("postres_ventas", []);

  function registrarVenta({ meseroId, meseroNombre, postreId, postreNombre, cantidad, fecha }) {
    setVentas((prev) => [
      {
        id: `v${Date.now()}`,
        fecha: fecha || hoyISO(),
        hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        meseroId,
        meseroNombre,
        postreId,
        postreNombre,
        cantidad,
      },
      ...prev,
    ]);
  }

  function eliminarVenta(id) {
    setVentas((prev) => prev.filter((v) => v.id !== id));
  }

  // Estadísticas: postres más vendidos, meseros que más venden, promedio diario.
  const estadisticas = useMemo(() => {
    const porPostre = {};
    const porMesero = {};
    const diasConVentas = new Set();
    let totalVendido = 0;

    ventas.forEach((v) => {
      porPostre[v.postreId] = porPostre[v.postreId] || { nombre: v.postreNombre, cantidad: 0 };
      porPostre[v.postreId].cantidad += v.cantidad;

      porMesero[v.meseroId] = porMesero[v.meseroId] || { nombre: v.meseroNombre, cantidad: 0 };
      porMesero[v.meseroId].cantidad += v.cantidad;

      diasConVentas.add(v.fecha);
      totalVendido += v.cantidad;
    });

    const rankingPostres = Object.values(porPostre).sort((a, b) => b.cantidad - a.cantidad);
    const rankingMeseros = Object.values(porMesero).sort((a, b) => b.cantidad - a.cantidad);
    const promedioDiario = diasConVentas.size > 0 ? (totalVendido / diasConVentas.size).toFixed(1) : 0;

    return { rankingPostres, rankingMeseros, promedioDiario, totalVendido, diasConVentas: diasConVentas.size };
  }, [ventas]);

  const ventasDeHoy = useCallback(
    (fecha = hoyISO()) => ventas.filter((v) => v.fecha === fecha),
    [ventas]
  );

  return { ventas, listo, registrarVenta, eliminarVenta, estadisticas, ventasDeHoy };
}
