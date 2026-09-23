import { useRef, useState } from "react";
import { UploadCloud, Image, Video, Music } from "lucide-react";

const KIND_META = {
  image: { icon: Image, label: "photo", accept: "image/*" },
  video: { icon: Video, label: "video", accept: "video/*" },
  audio: { icon: Music, label: "audio", accept: "audio/*" },
};

export default function MediaUploader({ kind, onFileSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging ? "border-ignition-400 bg-ignition-50" : "border-mist-300 bg-mist-50"
      }`}
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-mist-200 flex items-center justify-center mb-3 text-ignition-500">
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-ink-900">Drop your vehicle {meta.label} here</p>
      <p className="text-xs text-ink-500 mt-1">or</p>
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ignition-600 hover:text-ignition-700"
      >
        <UploadCloud size={15} />
        Browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={meta.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
      <p className="text-[11px] text-ink-500 mt-3">Max file size 10MB</p>
    </div>
  );
}
