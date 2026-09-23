import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-ignition-500 text-white hover:bg-ignition-600 active:bg-ignition-700 shadow-sm",
  dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700",
  secondary: "bg-white text-ink-900 border border-mist-200 hover:bg-mist-50 active:bg-mist-100",
  ghost: "bg-transparent text-ink-700 hover:bg-mist-100 active:bg-mist-200",
  danger: "bg-alert-500 text-white hover:bg-alert-600",
  outlineLight: "bg-transparent text-white border border-white/25 hover:bg-white/10",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-5 py-3 gap-2 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  full = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        Icon && iconPosition === "left" && <Icon size={16} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={16} />}
    </button>
  );
}
