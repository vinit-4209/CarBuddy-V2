import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-white border border-mist-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-ignition-300 outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
