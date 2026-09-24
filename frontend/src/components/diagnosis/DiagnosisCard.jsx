import { Stethoscope, Printer } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import ConfidenceIndicator from "./ConfidenceIndicator";
import SymptomList from "./SymptomList";
import { RecommendationCard, SafetyNote } from "./RecommendationCard";

export default function DiagnosisCard({ diagnosis, compact = false }) {
  return (
    <div className="bg-white border border-mist-200 rounded-2xl shadow-sm overflow-hidden max-w-lg animate-rise">
      <div className="bg-ink-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ignition-500/20 text-ignition-300 flex items-center justify-center shrink-0">
            <Stethoscope size={16} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/40 font-medium">Diagnosis</p>
            <p className="text-white font-display font-semibold text-sm leading-tight">Likely cause identified</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
          title="Print or Save as PDF"
        >
          <Printer size={13} />
          <span>Print / PDF</span>
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="font-display font-semibold text-ink-900 text-base leading-snug">{diagnosis.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <SeverityBadge severity={diagnosis.severity} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-500 mb-1.5">Confidence</p>
          <ConfidenceIndicator value={diagnosis.confidence} />
        </div>

        {!compact && (
          <>
            <SymptomList title="Symptoms detected" items={diagnosis.symptoms} />
            <SymptomList title="Possible causes" items={diagnosis.causes} numbered />
            <RecommendationCard text={diagnosis.recommendedStep} />
            {diagnosis.safetyNotes && <SafetyNote text={diagnosis.safetyNotes} />}
          </>
        )}

        <p className="text-[11px] text-ink-500 leading-relaxed pt-1 border-t border-mist-100">
          This is AI-assisted guidance, not a confirmed diagnosis. A recommended inspection by a certified
          mechanic can confirm the exact cause.
        </p>
      </div>
    </div>
  );
}
