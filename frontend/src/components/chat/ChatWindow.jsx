import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import AIProcessing from "./AIProcessing";

export default function ChatWindow({ messages, onQuickReply, typing, processing, diagnosisSlot, errorSlot }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing, processing, diagnosisSlot]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-5">
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} onQuickReply={onQuickReply} disabled={m.id !== messages[messages.length - 1]?.id} />
      ))}
      {typing && <TypingIndicator />}
      {processing && <AIProcessing />}
      {diagnosisSlot}
      {errorSlot}
      <div ref={bottomRef} />
    </div>
  );
}
