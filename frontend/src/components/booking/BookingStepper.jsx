import { Check } from "lucide-react";

const STEPS = ["Service", "Location", "Date & Time"];

export default function BookingStepper({ current }) {
  return (
    <div className="flex items-center w-full mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  done
                    ? "bg-torque-500 text-white"
                    : active
                    ? "bg-ignition-500 text-white"
                    : "bg-mist-200 text-ink-500"
                }`}
              >
                {done ? <Check size={14} /> : stepNum}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${active || done ? "text-ink-900" : "text-ink-500"}`}>
                {label}
              </span>
            </div>
            {stepNum !== STEPS.length && (
              <div className={`flex-1 h-0.5 mx-2 ${done ? "bg-torque-500" : "bg-mist-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
