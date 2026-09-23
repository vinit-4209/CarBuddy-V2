const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/**
 * Request or retrieve a diagnosis based on the conversation so far.
 *
 * @param {number|string|object} conversationData - Conversation ID or conversation object
 * @returns {Promise<object>} diagnosis object
 */
export async function getDiagnosis(conversationData) {
  let conversationId = conversationData;
  if (typeof conversationData === "object" && conversationData !== null) {
    conversationId =
      conversationData.backendConversationId ||
      conversationData.conversationId ||
      conversationData.id;
    if (typeof conversationId === "string" && conversationId.startsWith("conv-")) {
      conversationId = conversationId.replace("conv-", "");
    }
  }

  if (!conversationId) {
    throw new Error("A valid conversation ID is required to fetch a diagnosis.");
  }

  const response = await fetch(`${API_BASE_URL}/diagnosis/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: Number(conversationId),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const message = data?.error || `Failed to fetch diagnosis (HTTP ${response.status})`;
    const err = new Error(message);
    err.code = "DIAGNOSIS_UNAVAILABLE";
    throw err;
  }

  const d = data.diagnosis;
  return {
    id: d.id,
    conversationId: d.conversation,
    title: d.title,
    confidence: Math.round(d.confidence || 85),
    severity: d.severity || "medium",
    symptoms: d.symptoms || [],
    causes: d.possible_causes || [],
    possibleCauses: d.possible_causes || [],
    recommendedStep: d.recommended_service || "Vehicle inspection recommended",
    safetyNotes: d.safety_notes || "",
    recommendedService: d.recommended_service || "General Inspection",
  };
}
