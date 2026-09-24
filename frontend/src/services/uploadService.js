const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const MAX_FILE_SIZE_MB = 20;
const ACCEPTED = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/webm", "audio/mp4", "audio/ogg"],
};

export function validateFile(file, kind) {
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB` };
  }
  const accepted = ACCEPTED[kind] || [];
  if (accepted.length && !accepted.includes(file.type)) {
    return { valid: false, error: "Unsupported file type" };
  }
  return { valid: true, error: null };
}

/**
 * Upload real media file to backend POST /api/upload/
 *
 * @param {File|Blob} file
 * @param {string} kind
 * @param {number|null|Function} conversationId
 * @param {Function} [onProgress]
 * @returns {Promise<{ id: number, conversationId: number, url: string, name: string, size: number, mediaType: string, kind: string }>}
 */
export async function uploadMedia(file, kind, conversationId, onProgress) {
  if (typeof conversationId === "function") {
    onProgress = conversationId;
    conversationId = null;
  }

  const formData = new FormData();
  formData.append("file", file, file.name || `audio-${Date.now()}.webm`);
  if (conversationId) {
    let cleanId = conversationId;
    if (typeof cleanId === "string" && cleanId.startsWith("conv-")) {
      cleanId = cleanId.replace("conv-", "");
    }
    formData.append("conversation_id", cleanId);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload/`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.message) {
            onProgress?.(100);
            resolve({
              id: data.message.id,
              conversationId: data.conversation_id,
              url: data.message.url,
              name: data.message.file_name,
              size: data.message.file_size,
              mediaType: data.message.media_type,
              kind,
            });
          } else {
            reject(new Error(data.error || "Upload failed."));
          }
        } catch {
          reject(new Error("Invalid response from server."));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload. Check backend server connection."));
    xhr.send(formData);
  });
}
