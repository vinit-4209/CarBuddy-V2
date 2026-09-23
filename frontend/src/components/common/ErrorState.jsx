import { AlertTriangle } from "lucide-react";
import Button from "../ui/Button";

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 bg-alert-500/5 border border-alert-500/20 text-alert-600 rounded-xl px-3.5 py-2.5 text-sm animate-rise">
        <AlertTriangle size={16} className="shrink-0" />
        <span className="flex-1">{description}</span>
        {onRetry && (
          <button onClick={onRetry} className="font-medium underline underline-offset-2 shrink-0">
            Retry
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-rise">
      <div className="w-14 h-14 rounded-2xl bg-alert-500/10 text-alert-500 flex items-center justify-center mb-4">
        <AlertTriangle size={24} />
      </div>
      <h3 className="font-display font-semibold text-ink-900 text-lg">{title}</h3>
      <p className="text-ink-500 text-sm mt-1.5 max-w-xs">{description}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
