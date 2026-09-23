import { Check, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(service.id)}
      className={`text-left rounded-2xl border p-4 transition-colors w-full ${
        selected
          ? "border-ignition-400 bg-ignition-50/60 ring-1 ring-ignition-300"
          : "border-mist-200 bg-white hover:border-ignition-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display font-semibold text-ink-900 text-[15px]">{service.name}</p>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
            selected ? "bg-ignition-500 border-ignition-500 text-white" : "border-mist-300"
          }`}
        >
          {selected && <Check size={12} />}
        </div>
      </div>
      <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{service.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-ink-500 flex items-center gap-1">
          <Clock size={12} /> {service.duration}
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-torque-500/10 text-torque-700 border border-torque-500/20">
          Pay after service
        </span>
      </div>
    </button>
  );
}
