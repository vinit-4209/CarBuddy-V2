import Avatar from "../ui/Avatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-rise">
      <Avatar kind="ai" size={32} />
      <div className="bg-white border border-mist-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-500 animate-pulseDot" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-500 animate-pulseDot" style={{ animationDelay: "200ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-500 animate-pulseDot" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
}
