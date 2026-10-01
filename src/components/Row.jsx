export default function Row({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "text-gray-800",
    danger: "text-red-600 font-medium",
    warning: "text-amber-600 font-medium",
  };
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className={toneClasses[tone]}>{value}</span>
    </div>
  );
}
