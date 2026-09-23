export default function TimeSlotPicker({ slots, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`text-sm font-medium rounded-xl px-3 py-2.5 border transition-colors ${
            selected === slot
              ? "bg-ignition-500 border-ignition-500 text-white"
              : "bg-white border-mist-200 text-ink-700 hover:border-ignition-300"
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
