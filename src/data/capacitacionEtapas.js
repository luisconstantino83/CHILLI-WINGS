// Las 4 semanas del programa de capacitación para personal nuevo / ayudantes.
export const ETAPAS_CAPACITACION = [
  {
    semana: 1,
    titulo: "Aprenderse el menú",
    descripcion: "Conocer todos los platillos, ingredientes, alérgenos y precios.",
  },
  {
    semana: 2,
    titulo: "Hacer sombra",
    descripcion: "Acompaña a un mesero con experiencia y observa su trabajo.",
  },
  {
    semana: 3,
    titulo: "Que le hagan sombra",
    descripcion: "Un mesero con experiencia lo acompaña a él mientras atiende.",
  },
  {
    semana: 4,
    titulo: "Toma órdenes",
    descripcion: "Atiende mesas por su cuenta, con supervisión a distancia.",
  },
];

export function capacitacionVacia() {
  return {
    semanaActual: 1,
    evaluaciones: {}, // semana -> { avanza: bool, calificacion: number, notas: string, fecha }
  };
}

export function calificacionTotal(capacitacion) {
  if (!capacitacion) return null;
  const vals = Object.values(capacitacion.evaluaciones || {}).map((e) => e.calificacion).filter((c) => c !== undefined && c !== null);
  if (vals.length === 0) return null;
  return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
}
