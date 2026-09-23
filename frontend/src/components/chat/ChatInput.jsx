import { useRef, useState } from "react";
import { Image, Video, Mic, Send, Paperclip, X } from "lucide-react";
import Modal from "../ui/Modal";
import MediaUploader from "./MediaUploader";
import MediaPreview from "./MediaPreview";
import AudioRecorderUI from "./AudioRecorderUI";
import { validateFile, uploadMedia } from "../../services/uploadService";
import { useToast } from "../ui/Toast";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [modalKind, setModalKind] = useState(null); // 'image' | 'video' | 'audio' | null
  const [recording, setRecording] = useState(false);
  const [inputError, setInputError] = useState("");
  const textareaRef = useRef(null);
  const { showToast } = useToast();

  function closeModal() {
    setModalKind(null);
    setRecording(false);
  }

  async function handleFileSelected(file, kind) {
    const { valid, error } = validateFile(file, kind);
    const id = `${Date.now()}-${Math.random()}`;
    const previewUrl = kind === "image" ? URL.createObjectURL(file) : undefined;

    if (!valid) {
      setAttachments((prev) => [
        ...prev,
        { id, kind, name: file.name, size: file.size, status: "error", error, progress: 0, previewUrl },
      ]);
      closeModal();
      return;
    }

    setAttachments((prev) => [
      ...prev,
      { id, kind, file, name: file.name, size: file.size, status: "uploading", progress: 0, previewUrl },
    ]);
    closeModal();
    runUpload(id, file, kind);
  }

  function runUpload(id, file, kind) {
    uploadMedia(file, kind, (progress) => {
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, progress } : a)));
    })
      .then((result) => {
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "done", url: result.url } : a))
        );
      })
      .catch((err) => {
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "error", error: err.message } : a))
        );
        showToast(err.message, "error");
      });
  }

  function handleRecordingFinished(audioFile, seconds) {
    const id = `${Date.now()}-${Math.random()}`;
    const file = audioFile instanceof File ? audioFile : new File([audioFile], `Voice-note-${Date.now()}.webm`, { type: "audio/webm" });
    const name = file.name || `Voice note (${seconds}s).webm`;
    const previewUrl = URL.createObjectURL(file);

    setAttachments((prev) => [
      ...prev,
      { id, kind: "audio", file, name, size: file.size, status: "uploading", progress: 0, previewUrl },
    ]);
    closeModal();
    runUpload(id, file, "audio");
  }

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function retryAttachment(id) {
    const item = attachments.find((a) => a.id === id);
    if (!item?.file) return;
    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "uploading", progress: 0, error: null } : a)));
    runUpload(id, item.file, item.kind);
  }

  function handleSend() {
    const trimmed = text.trim();
    const pendingUpload = attachments.some((a) => a.status === "uploading");
    if (pendingUpload) {
      setInputError("Please wait for uploads to finish.");
      return;
    }
    if (!trimmed && attachments.length === 0) {
      setInputError("Type a message or attach media before sending.");
      return;
    }
    const readyAttachments = attachments.filter((a) => a.status === "done");
    onSend(trimmed, readyAttachments);
    setText("");
    setAttachments([]);
    setInputError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-mist-200 bg-white px-3 sm:px-5 py-3 sm:py-4">
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2 max-h-40 overflow-y-auto no-scrollbar">
          {attachments.map((item) => (
            <MediaPreview
              key={item.id}
              item={item}
              onRemove={() => removeAttachment(item.id)}
              onRetry={item.status === "error" ? () => retryAttachment(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {inputError && (
        <p className="text-xs text-alert-600 mb-2 flex items-center gap-1.5">
          <X size={12} /> {inputError}
        </p>
      )}

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1 pb-1">
          <IconBtn icon={Image} label="Upload photo" onClick={() => setModalKind("image")} />
          <IconBtn icon={Video} label="Upload video" onClick={() => setModalKind("video")} />
          <IconBtn icon={Paperclip} label="Upload audio file" onClick={() => setModalKind("audio-file")} />
          <IconBtn icon={Mic} label="Record audio" onClick={() => setModalKind("record")} accent />
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (inputError) setInputError("");
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Describe what your car is doing..."
          className="flex-1 resize-none bg-mist-50 border border-mist-200 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:bg-white focus:border-ignition-300 outline-none max-h-32 disabled:opacity-60"
          aria-label="Message"
        />

        <button
          onClick={handleSend}
          disabled={disabled}
          aria-label="Send message"
          className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-ignition-500 text-white flex items-center justify-center hover:bg-ignition-600 disabled:opacity-50 transition-colors"
        >
          <Send size={17} />
        </button>
      </div>

      <Modal
        open={modalKind === "image"}
        onClose={closeModal}
        title="Upload vehicle photo"
      >
        <MediaUploader kind="image" onFileSelected={(f) => handleFileSelected(f, "image")} />
      </Modal>

      <Modal open={modalKind === "video"} onClose={closeModal} title="Upload video">
        <MediaUploader kind="video" onFileSelected={(f) => handleFileSelected(f, "video")} />
      </Modal>

      <Modal open={modalKind === "audio-file"} onClose={closeModal} title="Upload audio">
        <MediaUploader kind="audio" onFileSelected={(f) => handleFileSelected(f, "audio")} />
      </Modal>

      <Modal open={modalKind === "record"} onClose={closeModal} title="Record audio">
        <AudioRecorderUI onFinish={handleRecordingFinished} onCancel={closeModal} />
      </Modal>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        accent ? "text-ignition-600 hover:bg-ignition-50" : "text-ink-500 hover:bg-mist-100"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}
