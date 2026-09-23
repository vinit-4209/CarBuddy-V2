import { useCallback, useEffect, useState } from "react";
import { seedConversations } from "../data/mockData";
import { loadFromStorage, saveToStorage } from "../utils/storage";

const KEY = "conversations";

function readAll() {
  const loaded = loadFromStorage(KEY, []);
  return Array.isArray(loaded)
    ? loaded.filter((c) => !["conv-1001", "conv-1002", "conv-1003"].includes(c.id))
    : [];
}

export function useConversations() {
  const [conversations, setConversations] = useState(readAll);

  useEffect(() => {
    saveToStorage(KEY, conversations);
  }, [conversations]);

  const getConversation = useCallback(
    (id) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const upsertConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conversation.id);
      if (exists) {
        return prev.map((c) => (c.id === conversation.id ? { ...c, ...conversation } : c));
      }
      return [conversation, ...prev];
    });
  }, []);

  const clearHistory = useCallback(() => {
    setConversations([]);
  }, []);

  return { conversations, getConversation, upsertConversation, clearHistory };
}
