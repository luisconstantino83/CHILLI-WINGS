export default function KpiCard({ label, value, hint, tone = "default" }) {
  const toneClasses = {
    default: "text-gray-900",
    danger: "text-red-600",
    warning: "text-amber-600",
    success: "text-green-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${toneClasses[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
