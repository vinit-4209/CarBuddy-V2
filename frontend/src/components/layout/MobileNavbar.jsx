import { NavLink } from "react-router-dom";
import { Home, MessageCircle, History, Wrench, Menu } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/booking", label: "Book", icon: Wrench },
];

export default function MobileNavbar({ onOpenMenu }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 backdrop-blur border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-between">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive ? "text-ignition-300" : "text-white/50"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-white/50"
          aria-label="Open menu"
        >
          <Menu size={20} />
          More
        </button>
      </div>
    </nav>
  );
}
