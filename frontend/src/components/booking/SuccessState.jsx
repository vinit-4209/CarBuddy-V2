import { CheckCircle2 } from "lucide-react";

export default function SuccessState({ title, description, children }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 animate-rise">
      <div className="w-16 h-16 rounded-full bg-torque-500/10 text-torque-500 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="font-display font-semibold text-xl text-ink-900">{title}</h2>
      {description && <p className="text-ink-500 text-sm mt-1.5 max-w-sm">{description}</p>}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
