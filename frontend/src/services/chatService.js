const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/**
 * Send a chat message to the AI mechanic.
 *
 * @param {{
 *   text: string,
 *   attachments?: Array,
 *   conversationId?: number|string
 * }} payload
 */
export async function sendMessage(payload) {
  const { text = "", attachments = [], conversationId = null } = payload;

  const trimmed = (text || "").trim();
  const mediaIds = (attachments || [])
    .map((a) => a.backendId || a.id)
    .filter((id) => id != null && !isNaN(Number(id)))
    .map((id) => Number(id));

  let messageToSend = trimmed;
  if (!messageToSend && attachments?.length > 0) {
    const kinds = attachments.map((a) => a.kind || a.mediaType || "file").join(", ");
    messageToSend = `I've attached ${kinds} for technician inspection. Please examine it.`;
  }

  if (!messageToSend) {
    throw new Error("Message or attachment is required.");
  }

  // Parse numeric conversationId if formatted as 'conv-123'
  let numericConvId = conversationId;
  if (typeof numericConvId === "string" && numericConvId.startsWith("conv-")) {
    numericConvId = Number(numericConvId.replace("conv-", ""));
  }

  // Fallback to conversationId from an uploaded attachment if not yet set in state
  if (!numericConvId && attachments?.length > 0) {
    const attachConvId = attachments.find((a) => a.conversationId)?.conversationId;
    if (attachConvId && !isNaN(Number(attachConvId))) {
      numericConvId = Number(attachConvId);
    }
  }

  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: messageToSend,
      ...(numericConvId ? { conversation_id: Number(numericConvId) } : {}),
      ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
    }),
  });

  // Read response safely
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  let data;
  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Backend returned invalid JSON (HTTP ${response.status})`);
    }
  } else {
    console.error("Backend returned non-JSON:", rawText);
    throw new Error(`Backend returned unexpected response (HTTP ${response.status})`);
  }

  if (!response.ok || !data.success) {
    const error = new Error(data.error || "Unable to communicate with CarBuddy V2.");
    error.code = response.status === 503 ? "AI_UNAVAILABLE" : "CHAT_ERROR";
    error.status = response.status;
    throw error;
  }

  return {
    id: String(data.assistant_message?.id || Date.now()),
    role: "ai",
    text: data.assistant_message?.content || "Thank you for the information.",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    engine: data.engine || (data.is_automotive === false ? "domain_filter" : "gemini"),
    engineLabel: data.engine_label || (data.is_automotive === false ? "Domain Filter (0 AI Calls)" : "AI Mechanic Engine"),
    conversationId: data.conversation_id,
    isAutomotive: data.is_automotive,
    needsFollowup: data.needs_followup,
    followupQuestion: data.followup_question,
    diagnosisReady: data.diagnosis_ready,
    diagnosisId: data.diagnosis_id,
    diagnosis: data.diagnosis,
    confidence: data.confidence,
    severity: data.severity,
    symptoms: data.symptoms || [],
    possibleCauses: data.possible_causes || [],
    recommendedService: data.recommended_service,
    safetyWarning: data.safety_warning,
  };
}

export async function getConversation(id, seedConversations) {
  return (
    seedConversations?.find(
      (conversation) => conversation.id === id
    ) || null
  );
}