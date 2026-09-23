export default function ConfidenceIndicator({ value }) {
  const color = value >= 75 ? "bg-torque-500" : value >= 50 ? "bg-caution-500" : "bg-alert-500";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 rounded-full bg-mist-200 overflow-hidden min-w-[80px]">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold text-ink-900 font-mono tabular-nums">{value}%</span>
    </div>
  );
}
