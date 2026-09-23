import { Settings, Check, Circle } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  "Understanding symptoms",
  "Reviewing conversation",
  "Analyzing vehicle issue",
  "Preparing recommendation",
];

export default function AIProcessing() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 650);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-mist-200 rounded-2xl p-5 max-w-sm animate-rise shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center">
          <Settings size={18} className="text-ignition-300 animate-gear" />
        </div>
        <div>
          <p className="font-display font-semibold text-sm text-ink-900">Analyzing your vehicle...</p>
          <p className="text-xs text-ink-500">This usually takes a few seconds</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {STAGES.map((stage, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={stage} className="flex items-center gap-2.5 text-sm">
              {done ? (
                <Check size={15} className="text-torque-500 shrink-0" />
              ) : active ? (
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ignition-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-ignition-500" />
                </span>
              ) : (
                <Circle size={14} className="text-mist-300 shrink-0" />
              )}
              <span className={done || active ? "text-ink-900" : "text-ink-500"}>{stage}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
