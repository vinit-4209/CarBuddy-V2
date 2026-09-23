import { Lightbulb, ShieldAlert } from "lucide-react";

export function RecommendationCard({ text }) {
  return (
    <div className="flex items-start gap-2.5 bg-ignition-50 border border-ignition-100 rounded-xl px-3.5 py-3">
      <Lightbulb size={16} className="text-ignition-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-ignition-700 mb-0.5">Recommended next step</p>
        <p className="text-sm text-ink-800">{text}</p>
      </div>
    </div>
  );
}

export function SafetyNote({ text }) {
  return (
    <div className="flex items-start gap-2.5 bg-caution-500/10 border border-caution-500/20 rounded-xl px-3.5 py-3">
      <ShieldAlert size={16} className="text-caution-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-caution-600 mb-0.5">Safety note</p>
        <p className="text-sm text-ink-800">{text}</p>
      </div>
    </div>
  );
}
