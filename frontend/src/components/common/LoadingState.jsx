import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading...", compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-ink-500 text-sm py-3">
        <Loader2 size={16} className="animate-spin" />
        {label}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-500">
      <Loader2 size={28} className="animate-spin mb-3 text-ignition-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
