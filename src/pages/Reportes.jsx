import { useState } from "react";
import { kpis } from "../data/mockData";

const TABS = [
  { id: "diario", label: "Diario" },
  { id: "semanal", label: "Semanal" },
  { id: "mensual", label: "Mensual" },
];

export default function Reportes() {
  const [tab, setTab] = useState("diario");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Reportes</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg ${tab === t.id ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "diario" && (
        <div className="flex flex-col gap-2">
          <ReportRow label="Personal" value={`${kpis.personalHoy.presentes}/${kpis.personalHoy.programados}`} />
          <ReportRow label="Retardos" value={kpis.retardos} />
          <ReportRow label="Faltas" value={kpis.faltas} />
          <ReportRow label="Tareas vencidas" value={kpis.tareasVencidas} />
          <ReportRow label="Incidencias" value={kpis.incidenciasHoy} />
          <ReportRow label="Cerveza bajada" value={`${kpis.cervezaBajadaHoy} u`} />
          <ReportRow label="Quejas" value={kpis.quejasAbiertas} />
        </div>
      )}

      {(tab === "semanal" || tab === "mensual") && (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Este reporte se genera solo una vez que haya suficiente historial acumulado
          en la base de datos — todavía no hay datos de {tab === "semanal" ? "esta semana" : "este mes"}.
        </p>
      )}
    </div>
  );
}

function ReportRow({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
