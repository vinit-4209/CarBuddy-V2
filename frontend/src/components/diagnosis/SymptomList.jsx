import { CheckCircle2 } from "lucide-react";

export default function SymptomList({ title, items, numbered = false, icon: Icon = CheckCircle2 }) {
  return (
    <div>
      {title && <p className="text-sm font-semibold text-ink-900 mb-2">{title}</p>}
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-700">
            {numbered ? (
              <span className="w-5 h-5 rounded-full bg-mist-100 text-ink-600 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              <Icon size={15} className="text-ignition-500 shrink-0 mt-0.5" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
