import { Wrench, User } from "lucide-react";

export default function Avatar({ kind = "ai", size = 36, online = false }) {
  const isAi = kind === "ai";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`w-full h-full rounded-full flex items-center justify-center ${
          isAi ? "bg-ink-900 text-ignition-300" : "bg-ignition-500 text-white"
        }`}
      >
        {isAi ? <Wrench size={size * 0.5} /> : <User size={size * 0.5} />}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-torque-500 border-2 border-white" />
      )}
    </div>
  );
}
