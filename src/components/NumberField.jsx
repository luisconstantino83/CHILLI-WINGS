export default function NumberField({ value, onChange, min = 0 }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const texto = e.target.value;
          if (texto === "") {
            onChange(0);
            return;
          }
          const limpio = texto.replace(/^0+(?=\d)/, "");
          onChange(Number(limpio));
        }}
        className="w-14 text-center border border-gray-200 rounded-lg py-1 text-sm"
      />
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center justify-center shrink-0"
      >
        +
      </button>
    </div>
  );
}
