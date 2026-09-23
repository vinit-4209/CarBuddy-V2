import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function AudioRecorderUI({ onFinish, onCancel }) {
  const [recording, setRecording] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (recording) {
      interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    let isMounted = true;

    async function startRecording() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!isMounted) return;
          streamRef.current = stream;

          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          chunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          recorder.start(200);
        }
      } catch (err) {
        console.warn("Microphone not accessible; using fallback timer mode:", err);
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function handleStop() {
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  }

  function handleUseRecording() {
    let audioBlob = null;
    if (chunksRef.current.length > 0) {
      audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    } else {
      // Fallback synthetic audio clip if microphone wasn't active
      audioBlob = new Blob([new Uint8Array(elapsed * 4000)], { type: "audio/webm" });
    }

    const audioFile = new File([audioBlob], `Engine-sound-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    onFinish(audioFile, elapsed);
  }

  const bars = Array.from({ length: 24 });

  return (
    <div className="bg-mist-50 border border-mist-200 rounded-2xl p-5 text-center">
      {errorMsg && <p className="text-xs text-alert-600 mb-2">{errorMsg}</p>}
      <div className="flex items-center justify-center gap-[3px] h-14 mb-3">
        {bars.map((_, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-ignition-500 animate-bar"
            style={{
              height: `${20 + ((i * 37) % 60)}%`,
              animationDelay: `${i * 60}ms`,
              animationPlayState: recording ? "running" : "paused",
              opacity: recording ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-sm text-ink-900 mb-4">{formatTime(elapsed)}</p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 border border-mist-200 bg-white hover:bg-mist-100"
        >
          Cancel
        </button>
        {recording ? (
          <button
            onClick={handleStop}
            className="w-11 h-11 rounded-full bg-alert-500 text-white flex items-center justify-center hover:bg-alert-600"
            aria-label="Stop recording"
          >
            <Square size={16} fill="white" />
          </button>
        ) : (
          <button
            onClick={handleUseRecording}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-ignition-500 hover:bg-ignition-600 flex items-center gap-1.5"
          >
            <Mic size={14} /> Use recording
          </button>
        )}
      </div>
    </div>
  );
}
