import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  success: "border-torque-500/30 bg-white text-ink-900",
  error: "border-alert-500/30 bg-white text-ink-900",
  warning: "border-caution-500/30 bg-white text-ink-900",
  info: "border-ignition-500/30 bg-white text-ink-900",
};

const ICON_COLOR = {
  success: "text-torque-500",
  error: "text-alert-500",
  warning: "text-caution-500",
  info: "text-ignition-500",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 sm:bottom-5 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full sm:w-auto sm:min-w-[280px] max-w-sm border rounded-xl shadow-lift px-4 py-3 flex items-start gap-2.5 animate-rise ${TONES[toast.type]}`}
              role="status"
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_COLOR[toast.type]}`} />
              <p className="text-sm flex-1">{toast.message}</p>
              <button onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="text-ink-500 hover:text-ink-900">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
