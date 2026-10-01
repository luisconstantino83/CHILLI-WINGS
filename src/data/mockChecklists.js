// Los puntos vienen de tu documento maestro — el estado empieza sin marcar,
// tú los vas completando cada turno.

export const checklistApertura = [
  "Revisar Área A", "Revisar Área B", "Revisar terraza", "Revisar limpieza",
  "Revisar baños", "Revisar televisiones", "Revisar internet",
  "Revisar aires acondicionados", "Revisar refrigeradores", "Revisar cámaras",
  "Revisar barra", "Revisar estaciones",
].map((texto, i) => ({ id: `a${i}`, texto, completado: false }));

export const checklistCierre = [
  "Limpieza", "Conteos", "Inventarios", "Cerveza", "Estaciones",
  "Terraza", "Baños", "Equipos", "Radios", "Evidencias",
].map((texto, i) => ({ id: `c${i}`, texto, completado: false }));
