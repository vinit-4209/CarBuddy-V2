import { Wrench, ArrowRight } from "lucide-react";
import Button from "../ui/Button";

export default function BookMechanicCTA({ onBook, onContinue }) {
  return (
    <div className="max-w-lg rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 border border-ink-700 px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-rise">
      <div className="w-11 h-11 rounded-xl bg-ignition-500/20 text-ignition-300 flex items-center justify-center shrink-0">
        <Wrench size={20} />
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-white text-[15px]">Need professional help?</p>
        <p className="text-white/50 text-sm mt-0.5">Book a certified mechanic to inspect your vehicle.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outlineLight" size="sm" onClick={onContinue}>
          Continue troubleshooting
        </Button>
        <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" onClick={onBook}>
          Book a Mechanic
        </Button>
      </div>
    </div>
  );
}
