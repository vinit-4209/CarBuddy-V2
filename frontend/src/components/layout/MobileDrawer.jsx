import { NavLink } from "react-router-dom";
import { X, HelpCircle, Settings, Gauge } from "lucide-react";
import Avatar from "../ui/Avatar";

export default function MobileDrawer({ open, onClose }) {
  return (
    <div
      className={`lg:hidden fixed inset-0 z-50 transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
      <div
        className={`absolute top-0 right-0 h-full w-72 bg-ink-900 text-white p-5 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ignition-500 flex items-center justify-center">
              <Gauge size={16} />
            </div>
            <span className="font-display font-semibold">CarBuddy V2</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLink onClick={onClose} to="/help" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
            <HelpCircle size={18} /> Help
          </NavLink>
          <NavLink onClick={onClose} to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <NavLink onClick={onClose} to="/settings" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 hover:bg-white/5">
          <Avatar kind="user" size={34} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Vinit Kumar</p>
            <p className="text-xs text-white/40 truncate">vinit@gmail.com</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}
