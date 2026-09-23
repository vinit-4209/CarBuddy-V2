const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "diagnosed", label: "Diagnosed" },
  { id: "booked", label: "Booked" },
];

export default function FilterDropdown({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-mist-200 rounded-xl p-1 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            value === f.id ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-mist-100"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
