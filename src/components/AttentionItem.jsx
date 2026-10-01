import { nivelStyles } from "../data/mockData";

export default function AttentionItem({ icono, texto, detalle, nivel }) {
  const style = nivelStyles[nivel] || nivelStyles.pendiente;

  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 ${style.bg}`}>
      <span className="text-lg leading-none">{icono}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{texto}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <span className="text-xs text-gray-500">
            {style.label} · {detalle}
          </span>
        </div>
      </div>
    </div>
  );
}
