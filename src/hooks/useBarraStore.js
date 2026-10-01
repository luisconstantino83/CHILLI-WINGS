import { useCallback } from "react";
import { useSyncedState } from "./useSyncedState";

// Igual formato de fecha que Cerveza, para mantener el mismo patrón en toda la app.
export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatFechaLarga(iso) {
  const d = new Date(iso + "T12:00:00");
  const texto = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function emptyDia() {
  return {
    bajada: {}, // productoId -> cantidad bajada ese día
    meta: { horaCaptura: null, usuario: null, ultimaModificacion: null },
  };
}

export function useBarraStore() {
  const [dias, setDias, listo] = useSyncedState("barra_dias", {});

  const getDia = useCallback((fecha) => dias[fecha] || null, [dias]);

  function guardarBajada(fecha, bajada, usuario = "Tú") {
    setDias((prev) => {
      const actual = prev[fecha] || emptyDia();
      return {
        ...prev,
        [fecha]: {
          ...actual,
          bajada,
          meta: {
            horaCaptura: actual.meta.horaCaptura || new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            usuario: actual.meta.usuario || usuario,
            ultimaModificacion: new Date().toLocaleString("es-MX"),
          },
        },
      };
    });
  }

  const historial = useCallback(
    (limite = 30) =>
      Object.entries(dias)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .slice(0, limite)
        .map(([fecha, dia]) => ({ fecha, ...dia })),
    [dias]
  );

  return { dias, listo, getDia, guardarBajada, historial };
}
