// Catálogo real de cerveza de tu sucursal.

export const productos = [
  { id: "tecate_roja", nombre: "Tecate Roja" },
  { id: "tecate_light", nombre: "Tecate Light" },
  { id: "indio", nombre: "Indio" },
  { id: "xx_lager", nombre: "XX Lager" },
  { id: "xx_ambar", nombre: "XX Ámbar" },
  { id: "xx_ultra", nombre: "XX Ultra" },
  { id: "bohemia_clara", nombre: "Bohemia Clara" },
  { id: "bohemia_obscura", nombre: "Bohemia Obscura" },
  { id: "bohemia_cristal", nombre: "Bohemia Cristal" },
  { id: "miller_hl", nombre: "Miller High Life" },
  { id: "miller_lite", nombre: "Miller Lite" },
  { id: "amstel", nombre: "Amstel" },
  { id: "heineken", nombre: "Heineken" },
  { id: "heineken_0", nombre: "Heineken 0.0" },
  { id: "heineken_silver", nombre: "Heineken Silver" },
  { id: "carta_blanca", nombre: "Carta Blanca" },
  { id: "tecate_light_litro", nombre: "Tecate Light Litro" },
  { id: "indio_litro", nombre: "Indio Litro" },
  { id: "xx_lager_litro", nombre: "XX Lager Litro" },
];

// Pedido: se revisa miércoles y viernes, con recordatorio el día anterior.
export function estadoPedidoDelDia(fecha = new Date()) {
  const dia = fecha.getDay();
  if (dia === 2) return { nivel: "aviso", texto: "Mañana toca revisar pedido de cerveza", icon: "⚠️" };
  if (dia === 3) return { nivel: "urgente", texto: "Hoy toca revisar/pedir cerveza", icon: "🍺" };
  if (dia === 4) return { nivel: "aviso", texto: "Mañana toca revisar pedido de cerveza", icon: "⚠️" };
  if (dia === 5) return { nivel: "urgente", texto: "Hoy toca revisar/pedir cerveza", icon: "🍺" };
  return null;
}
