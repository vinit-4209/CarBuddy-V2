import { X, FileImage, FileVideo, Mic, AlertTriangle, RotateCcw } from "lucide-react";
import { formatBytes } from "../../utils/format";

export default function MediaPreview({ item, onRemove, onRetry }) {
  const { kind, file, name, size, progress, status, error, previewUrl } = item;

  return (
    <div className="flex items-center gap-3 bg-mist-50 border border-mist-200 rounded-xl px-3 py-2.5 animate-rise">
      <Thumb kind={kind} previewUrl={previewUrl} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-900 truncate">{name}</p>
        {status === "uploading" && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-mist-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-ignition-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-ink-500 w-8 text-right">{progress}%</span>
          </div>
        )}
        {status === "error" && (
          <p className="text-[12px] text-alert-600 flex items-center gap-1 mt-0.5">
            <AlertTriangle size={11} /> {error}
          </p>
        )}
        {status === "done" && <p className="text-[12px] text-ink-500 mt-0.5">{formatBytes(size)} &middot; Ready</p>}
      </div>

      {status === "error" && onRetry && (
        <button onClick={onRetry} aria-label="Retry upload" className="p-1.5 rounded-lg text-ink-500 hover:bg-mist-200">
          <RotateCcw size={15} />
        </button>
      )}
      <button onClick={onRemove} aria-label={`Remove ${name}`} className="p-1.5 rounded-lg text-ink-500 hover:bg-mist-200">
        <X size={15} />
      </button>
    </div>
  );
}

function Thumb({ kind, previewUrl }) {
  const cls = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden";
  if (kind === "image" && previewUrl) {
    return (
      <div className={cls}>
        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (kind === "video") {
    return (
      <div className={`${cls} bg-ink-900 text-white`}>
        <FileVideo size={16} />
      </div>
    );
  }
  if (kind === "audio") {
    return (
      <div className={`${cls} bg-ignition-50 text-ignition-600`}>
        <Mic size={16} />
      </div>
    );
  }
  return (
    <div className={`${cls} bg-mist-200 text-ink-500`}>
      <FileImage size={16} />
    </div>
  );
}
