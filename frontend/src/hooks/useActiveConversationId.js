import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../utils/storage";

const KEY = "activeConversationId";

export function useActiveConversationId() {
  const [id, setId] = useState(() => loadFromStorage(KEY, null));

  useEffect(() => {
    saveToStorage(KEY, id);
  }, [id]);

  return [id, setId];
}
