import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { kpis as mockKpis, atencionRequerida as mockAtencion } from "../data/mockData";

// Mientras no haya Supabase configurado (ver .env.example), el dashboard usa
// datos de ejemplo. En cuanto configures VITE_SUPABASE_URL y
// VITE_SUPABASE_ANON_KEY, empieza a leer de la base de datos real.
export function useDashboardData() {
  const [data, setData] = useState({ kpis: mockKpis, atencion: mockAtencion });
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [usingMockData, setUsingMockData] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function load() {
      try {
        const hoy = new Date().toISOString().slice(0, 10);

        const [tareasVencidas, incidencias, reservaciones, quejas] = await Promise.all([
          supabase.from("tareas").select("id", { count: "exact", head: true }).eq("estado", "vencida"),
          supabase.from("incidencias").select("id", { count: "exact", head: true }).gte("fecha", hoy),
          supabase.from("reservaciones").select("id", { count: "exact", head: true }).eq("fecha", hoy),
          supabase.from("quejas_clientes").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
        ]);

        setData((prev) => ({
          ...prev,
          kpis: {
            ...prev.kpis,
            tareasVencidas: tareasVencidas.count ?? prev.kpis.tareasVencidas,
            incidenciasHoy: incidencias.count ?? prev.kpis.incidenciasHoy,
            reservacionesHoy: reservaciones.count ?? prev.kpis.reservacionesHoy,
            quejasAbiertas: quejas.count ?? prev.kpis.quejasAbiertas,
          },
        }));
        setUsingMockData(false);
      } catch (err) {
        console.error("No se pudo leer de Supabase, usando datos de ejemplo:", err);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { ...data, loading, usingMockData };
}
