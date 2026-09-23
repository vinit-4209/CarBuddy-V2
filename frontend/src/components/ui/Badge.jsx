const TONES = {
  ignition: "bg-ignition-50 text-ignition-700 border-ignition-100",
  torque: "bg-torque-500/10 text-torque-600 border-torque-500/20",
  caution: "bg-caution-500/10 text-caution-600 border-caution-500/20",
  alert: "bg-alert-500/10 text-alert-600 border-alert-500/20",
  neutral: "bg-mist-100 text-ink-600 border-mist-200",
};

export default function Badge({ children, tone = "neutral", icon: Icon, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
