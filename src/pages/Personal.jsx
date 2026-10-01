import { useState } from "react";
import { empleados as empleadosIniciales, estatusStyles, asistenciaHoy } from "../data/mockPersonal";
import { ETAPAS_CAPACITACION, capacitacionVacia, calificacionTotal } from "../data/capacitacionEtapas";
import Section from "../components/Section";
import Row from "../components/Row";
import { useSyncedState } from "../hooks/useSyncedState";

const PUESTOS = ["Mesero", "Corredor", "Barra", "Caja", "Hostess", "Cocina", "Encargado", "Gerente", "Otro"];

export default function Personal() {
  const [empleados, setEmpleados] = useSyncedState("personal_empleados", empleadosIniciales);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState(PUESTOS[0]);
  const [esNuevoEnCapacitacion, setEsNuevoEnCapacitacion] = useState(false);

  function agregarEmpleado() {
    if (!nombre.trim()) return;
    setEmpleados((prev) => [
      ...prev,
      {
        id: `e${Date.now()}`,
        nombre: nombre.trim(),
        puesto,
        area: "",
        estatus: esNuevoEnCapacitacion ? "capacitacion" : "activo",
        telefono: "",
        ingreso: new Date().toISOString().slice(0, 10),
        retardos: 0,
        faltas: 0,
        capacitacion: esNuevoEnCapacitacion ? capacitacionVacia() : null,
      },
    ]);
    setNombre("");
    setEsNuevoEnCapacitacion(false);
    setMostrarForm(false);
  }

  function actualizarEmpleado(id, cambios) {
    setEmpleados((prev) => prev.map((e) => (e.id === id ? { ...e, ...cambios } : e)));
  }

  const empleadoSeleccionado = empleados.find((e) => e.id === seleccionadoId);

  if (empleadoSeleccionado) {
    return (
      <FichaEmpleado
        empleado={empleadoSeleccionado}
        onBack={() => setSeleccionadoId(null)}
        onUpdate={(cambios) => actualizarEmpleado(empleadoSeleccionado.id, cambios)}
      />
    );
  }

  const enCapacitacion = empleados.filter((e) => e.estatus === "capacitacion");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Sucursal Centro</p>
          <h1 className="text-xl font-semibold">Personal</h1>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          ＋ Empleado
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="border border-gray-200 rounded-lg p-2 text-sm"
          />
          <select value={puesto} onChange={(e) => setPuesto(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm">
            {PUESTOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={esNuevoEnCapacitacion} onChange={(e) => setEsNuevoEnCapacitacion(e.target.checked)} />
            Es nuevo ingreso / ayudante — iniciar capacitación de 4 semanas
          </label>
          <button onClick={agregarEmpleado} className="bg-orange-600 text-white text-sm font-medium py-2 rounded-lg">
            Guardar empleado
          </button>
        </div>
      )}

      {enCapacitacion.length > 0 && (
        <Section title="En capacitación" subtitle={`${enCapacitacion.length} persona(s)`} icon="🎓" defaultOpen>
          {enCapacitacion.map((e) => {
            const total = calificacionTotal(e.capacitacion);
            return (
              <button
                key={e.id}
                onClick={() => setSeleccionadoId(e.id)}
                className="w-full flex items-center justify-between py-1.5 text-left"
              >
                <span className="text-sm">{e.nombre}</span>
                <span className="text-xs text-amber-600 font-medium">
                  Semana {e.capacitacion?.semanaActual || 1}/4{total && ` · ${total}★`}
                </span>
              </button>
            );
          })}
        </Section>
      )}

      <Section title="Asistencia de hoy" icon="🕐">
        {asistenciaHoy.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">Sin registros de asistencia hoy</p>
        )}
        {asistenciaHoy.map((a) => (
          <div key={a.empleado} className="flex items-center justify-between text-sm py-1">
            <span>{a.empleado}</span>
            <span
              className={
                a.estado === "presente" ? "text-green-600" : a.estado === "retardo" ? "text-amber-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {a.entradaReal ?? "—"} {a.estado === "retardo" && "(retardo)"}
              {a.estado === "falta" && "(falta)"}
            </span>
          </div>
        ))}
      </Section>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Empleados ({empleados.length})</p>
        {empleados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
            Sin empleados dados de alta — agrega el primero arriba
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {empleados.map((e) => (
              <button
                key={e.id}
                onClick={() => setSeleccionadoId(e.id)}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-medium">{e.nombre}</p>
                  <p className="text-xs text-gray-400">{e.puesto}{e.area && ` · Área ${e.area}`}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${estatusStyles[e.estatus].dot}`} />
                  <span className="text-xs text-gray-500">{estatusStyles[e.estatus].label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FichaEmpleado({ empleado, onBack, onUpdate }) {
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="text-sm text-orange-700">← Volver a Personal</button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{empleado.nombre}</h1>
          <p className="text-sm text-gray-500">{empleado.puesto}{empleado.area && ` · Área ${empleado.area}`}</p>
        </div>
        {empleado.estatus === "capacitacion" ? (
          <button
            onClick={() => onUpdate({ estatus: "activo" })}
            className="text-xs bg-green-600 text-white font-medium px-3 py-1.5 rounded-lg"
          >
            Marcar como activo
          </button>
        ) : !empleado.capacitacion ? (
          <button
            onClick={() => onUpdate({ estatus: "capacitacion", capacitacion: capacitacionVacia() })}
            className="text-xs bg-amber-100 text-amber-700 font-medium px-3 py-1.5 rounded-lg"
          >
            Iniciar capacitación
          </button>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
        <Row label="Estatus" value={estatusStyles[empleado.estatus].label} />
        <Row label="Teléfono" value={empleado.telefono || "—"} />
        <Row label="Fecha de ingreso" value={empleado.ingreso} />
        <Row label="Retardos (mes)" value={empleado.retardos} tone={empleado.retardos > 0 ? "warning" : "default"} />
        <Row label="Faltas (mes)" value={empleado.faltas} tone={empleado.faltas > 0 ? "danger" : "default"} />
      </div>

      {empleado.capacitacion && (
        <PanelCapacitacion
          capacitacion={empleado.capacitacion}
          onUpdate={(capacitacion) => onUpdate({ capacitacion })}
        />
      )}

      <p className="text-xs text-gray-400 text-center">
        Historial de incidencias — próximamente en esta ficha.
      </p>
    </div>
  );
}

// ============ PANEL DE CAPACITACIÓN (4 semanas) ============
function PanelCapacitacion({ capacitacion, onUpdate }) {
  const total = calificacionTotal(capacitacion);

  function guardarEvaluacion(semana, cambios) {
    const evaluacionActual = capacitacion.evaluaciones[semana] || {};
    const nuevaEvaluacion = { ...evaluacionActual, ...cambios, fecha: new Date().toLocaleDateString("es-MX") };
    const evaluaciones = { ...capacitacion.evaluaciones, [semana]: nuevaEvaluacion };

    let semanaActual = capacitacion.semanaActual;
    if (nuevaEvaluacion.avanza && semana === semanaActual && semana < 4) {
      semanaActual = semana + 1;
    }

    onUpdate({ ...capacitacion, evaluaciones, semanaActual });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Capacitación — 4 semanas</p>
        {total && (
          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
            Calificación total: {total} / 10
          </span>
        )}
      </div>

      {ETAPAS_CAPACITACION.map((etapa) => {
        const evaluacion = capacitacion.evaluaciones[etapa.semana] || {};
        const esActual = etapa.semana === capacitacion.semanaActual;
        const bloqueada = etapa.semana > capacitacion.semanaActual;

        return (
          <div
            key={etapa.semana}
            className={`rounded-xl border p-3 flex flex-col gap-2 ${
              bloqueada ? "bg-gray-50 border-gray-100 opacity-60" : esActual ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Semana {etapa.semana}: {etapa.titulo}
              </p>
              {evaluacion.avanza && <span className="text-xs text-green-600 font-medium">✅ Aprobada</span>}
              {bloqueada && <span className="text-xs text-gray-400">🔒</span>}
            </div>
            <p className="text-xs text-gray-500">{etapa.descripcion}</p>

            {!bloqueada && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 shrink-0">Calificación (1-10):</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={evaluacion.calificacion ?? ""}
                    onChange={(e) => guardarEvaluacion(etapa.semana, { calificacion: Number(e.target.value) })}
                    className="w-16 border border-gray-200 rounded-lg p-1.5 text-sm text-center"
                  />
                </div>
                <textarea
                  value={evaluacion.notas || ""}
                  onChange={(e) => guardarEvaluacion(etapa.semana, { notas: e.target.value })}
                  placeholder="Notas de la evaluación..."
                  className="border border-gray-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={!!evaluacion.avanza}
                    onChange={(e) => guardarEvaluacion(etapa.semana, { avanza: e.target.checked })}
                  />
                  Ya se aprendió / puede avanzar a la siguiente semana
                </label>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
