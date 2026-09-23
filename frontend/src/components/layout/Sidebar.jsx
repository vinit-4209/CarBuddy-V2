import { NavLink } from "react-router-dom";
import { MessageCirclePlus, History, Wrench, HelpCircle, Settings, Gauge } from "lucide-react";
import Avatar from "../ui/Avatar";

const NAV_ITEMS = [
  { to: "/chat", label: "New Diagnosis", icon: MessageCirclePlus },
  { to: "/history", label: "Conversation History", icon: History },
  { to: "/booking", label: "Book Mechanic", icon: Wrench },
];

const NAV_FOOTER_ITEMS = [
  { to: "/help", label: "Help", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-ink-900 text-white">
      <div className="px-5 pt-6 pb-5">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ignition-500 flex items-center justify-center">
            <Gauge size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-[15px] leading-tight">CarBuddy V2</p>
            <p className="text-[11px] text-white/40 leading-tight">Diagnostics &amp; care</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
          {NAV_FOOTER_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 hover:bg-white/5 transition-colors"
        >
          <Avatar kind="user" size={34} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Vinit Kumar</p>
            <p className="text-xs text-white/40 truncate">vinit@gmail.com</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-ignition-500/15 text-ignition-300"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
