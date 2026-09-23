export default function QuickReply({ options, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 pt-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-ignition-200 bg-ignition-50 text-ignition-700 hover:bg-ignition-100 transition-colors"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
