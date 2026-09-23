import Avatar from "../ui/Avatar";
import QuickReply from "./QuickReply";
import { FileImage, FileVideo, Mic } from "lucide-react";

export default function ChatMessage({ message, onQuickReply, disabled }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 sm:gap-3 animate-rise ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar kind={isUser ? "user" : "ai"} size={32} />
      <div className={`flex flex-col gap-1.5 max-w-[82%] sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        {message.attachments?.map((att) => (
          <AttachmentBubble key={att.name} attachment={att} isUser={isUser} />
        ))}

        {message.text && (
          <div
            className={`px-4 py-2.5 text-[14px] leading-relaxed rounded-2xl whitespace-pre-wrap ${
              isUser
                ? "bg-ignition-500 text-white rounded-tr-sm"
                : "bg-white border border-mist-200 text-ink-900 rounded-tl-sm shadow-sm"
            }`}
          >
            {message.text}
          </div>
        )}

        {message.quickReplies && !disabled && (
          <QuickReply options={message.quickReplies} onSelect={onQuickReply} />
        )}

        <span className="text-[11px] text-ink-500 px-1">{message.time}</span>
      </div>
    </div>
  );
}

function AttachmentBubble({ attachment, isUser }) {
  const base = `rounded-2xl overflow-hidden border ${isUser ? "border-ignition-600" : "border-mist-200"} bg-white`;
  if (attachment.kind === "image") {
    return (
      <div className={`${base} w-48`}>
        <img src={attachment.url} alt={attachment.name} className="w-full h-32 object-cover" />
        <p className="text-xs text-ink-500 px-2.5 py-1.5 truncate flex items-center gap-1.5">
          <FileImage size={12} /> {attachment.name}
        </p>
      </div>
    );
  }
  if (attachment.kind === "video") {
    return (
      <div className={`${base} w-48 px-2.5 py-2.5 flex items-center gap-2`}>
        <div className="w-9 h-9 rounded-lg bg-ink-900 text-white flex items-center justify-center shrink-0">
          <FileVideo size={16} />
        </div>
        <p className="text-xs text-ink-700 truncate">{attachment.name}</p>
      </div>
    );
  }
  return (
    <div className={`${base} w-48 px-3 py-2.5 flex items-center gap-2`}>
      <div className="w-9 h-9 rounded-lg bg-ignition-50 text-ignition-600 flex items-center justify-center shrink-0">
        <Mic size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-700 truncate">{attachment.name}</p>
        <p className="text-[11px] text-ink-500">Audio clip</p>
      </div>
    </div>
  );
}
