import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function toDateStr(d) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isPast(d) {
    const cellDate = new Date(year, month, d);
    const cmp = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < cmp;
  }

  return (
    <div className="bg-white border border-mist-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-mist-100 text-ink-600"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-display font-semibold text-sm text-ink-900">
          {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-mist-100 text-ink-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={`${w}-${i}`} className="text-[11px] font-medium text-ink-500 py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const dateStr = toDateStr(d);
          const disabled = isPast(d);
          const selected = selectedDate === dateStr;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                selected
                  ? "bg-ignition-500 text-white"
                  : disabled
                  ? "text-mist-300 cursor-not-allowed"
                  : "text-ink-700 hover:bg-mist-100"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
