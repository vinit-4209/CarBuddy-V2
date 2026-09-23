import { ChevronRight, Car } from "lucide-react";
import SeverityBadge from "../diagnosis/SeverityBadge";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/format";
import { STATUS } from "../../data/mockData";

const STATUS_META = {
  [STATUS.ACTIVE]: { label: "Active", tone: "ignition" },
  [STATUS.DIAGNOSED]: { label: "Diagnosed", tone: "torque" },
  [STATUS.BOOKED]: { label: "Booked", tone: "caution" },
};

export default function HistoryCard({ conversation, onClick }) {
  const statusMeta = STATUS_META[conversation.status];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-mist-200 rounded-2xl p-4 sm:p-5 hover:border-ignition-200 hover:shadow-panel transition-all flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-mist-100 text-ink-600 flex items-center justify-center shrink-0">
        <Car size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display font-semibold text-ink-900 text-[15px] truncate">{conversation.vehicle}</p>
          <span className="text-xs text-ink-500 shrink-0">{formatDate(conversation.date)}</span>
        </div>
        <p className="text-sm text-ink-700 mt-0.5 truncate">{conversation.issue}</p>
        <p className="text-xs text-ink-500 mt-1.5 truncate">{conversation.lastMessage}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
          <SeverityBadge severity={conversation.severity} />
        </div>
      </div>
      <ChevronRight size={18} className="text-ink-500 shrink-0 mt-2" />
    </button>
  );
}
