import { Gauge } from "lucide-react";

export default function Header({ title, subtitle, right }) {
  return (
    <header className="sticky top-0 z-30 bg-mist-50/85 backdrop-blur border-b border-mist-200">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center shrink-0">
            <Gauge size={16} className="text-ignition-300" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-lg sm:text-xl text-ink-900 truncate">{title}</h1>
            {subtitle && <p className="text-sm text-ink-500 truncate">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </header>
  );
}
