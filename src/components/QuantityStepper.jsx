export default function QuantityStepper({ value, onChange, step = 1, min = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center active:bg-gray-200"
      >
        −
      </button>
      <span className="w-8 text-center font-medium">{value}</span>
      <button
        onClick={() => onChange(value + step)}
        className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center justify-center active:bg-orange-200"
      >
        +
      </button>
    </div>
  );
}
