import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * useSyncedState — como useState, pero el valor se guarda:
 *   1. En localStorage de este dispositivo (respaldo instantáneo, funciona sin internet)
 *   2. En Supabase, en la tabla "estado_app" (para que se vea igual en TODOS los
 *      dispositivos: celular, computadora, tablet, etc.)
 *
 * Si Supabase todavía no está configurado (no hay VITE_SUPABASE_URL / KEY),
 * la app sigue funcionando normal, solo que guarda únicamente en este dispositivo.
 *
 * clave: identificador único de este dato, ej. "cerveza_dias", "postres_categorias"
 * valorInicial: lo que se usa si no hay nada guardado todavía (siempre debe ser
 *   datos vacíos/cero, nunca datos de ejemplo — así lo pidió el negocio)
 */
export function useSyncedState(clave, valorInicial) {
  const [valor, setValor] = useState(() => leerLocal(clave, valorInicial));
  const [listo, setListo] = useState(!isSupabaseConfigured);
  const primeraCargaRemota = useRef(true);
  const guardarTimeout = useRef(null);
  const ultimoValorEnviado = useRef(null);

  // 1) Al montar: si hay Supabase, trae la versión más reciente de la nube
  //    (por si se editó desde otro dispositivo) y la usa en vez de la local.
  useEffect(() => {
    let activo = true;
    if (!isSupabaseConfigured) {
      setListo(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("estado_app")
        .select("valor")
        .eq("clave", clave)
        .maybeSingle();
      if (!activo) return;
      if (!error && data && data.valor !== null && data.valor !== undefined) {
        primeraCargaRemota.current = false;
        setValor(data.valor);
        guardarLocal(clave, data.valor);
      }
      setListo(true);
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  // 2) Si otro dispositivo cambia este mismo dato, actualizarlo aquí también
  //    en tiempo real (mientras la app está abierta).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const canal = supabase
      .channel(`estado_app_${clave}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "estado_app", filter: `clave=eq.${clave}` },
        (payload) => {
          const nuevo = payload.new?.valor;
          if (nuevo === undefined) return;
          // Evita procesar nuestro propio guardado como si viniera de otro dispositivo
          if (JSON.stringify(nuevo) === ultimoValorEnviado.current) return;
          setValor(nuevo);
          guardarLocal(clave, nuevo);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [clave]);

  // 3) Cada vez que cambia el valor: lo guarda local de inmediato,
  //    y manda a Supabase con un pequeño retraso (para no saturar si el
  //    usuario está tecleando rápido, por ejemplo con los +/- de cantidad).
  useEffect(() => {
    guardarLocal(clave, valor);
    if (!isSupabaseConfigured) return;

    clearTimeout(guardarTimeout.current);
    guardarTimeout.current = setTimeout(async () => {
      ultimoValorEnviado.current = JSON.stringify(valor);
      await supabase
        .from("estado_app")
        .upsert({ clave, valor, actualizado_en: new Date().toISOString() }, { onConflict: "clave" });
    }, 400);

    return () => clearTimeout(guardarTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, valor]);

  return [valor, setValor, listo];
}

function leerLocal(clave, valorInicial) {
  try {
    const guardado = localStorage.getItem(`chilliwings_${clave}`);
    return guardado ? JSON.parse(guardado) : valorInicial;
  } catch {
    return valorInicial;
  }
}

function guardarLocal(clave, valor) {
  try {
    localStorage.setItem(`chilliwings_${clave}`, JSON.stringify(valor));
  } catch {
    // si el navegador bloquea localStorage, seguimos solo con Supabase (si hay)
  }
}
