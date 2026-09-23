import { FileVideo } from "lucide-react";
import { formatBytes } from "../../utils/format";

export default function VideoPreview({ file }) {
  return (
    <div className="flex items-center gap-3 bg-mist-50 border border-mist-200 rounded-xl px-3.5 py-3">
      <div className="w-11 h-11 rounded-lg bg-ink-900 text-white flex items-center justify-center shrink-0">
        <FileVideo size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{file.name}</p>
        <p className="text-xs text-ink-500">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}
