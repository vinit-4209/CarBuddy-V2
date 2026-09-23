import { useState } from "react";
import { ChevronDown, Flame, AlertOctagon } from "lucide-react";
import Header from "../components/layout/Header";
import { helpTopics } from "../data/mockData";

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <Header title="Help" subtitle="Answers and safety guidance" />

      <main className="px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto space-y-6">
        <div className="bg-alert-500/10 border border-alert-500/25 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-alert-500/15 text-alert-600 flex items-center justify-center shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <p className="font-semibold text-alert-700 text-sm flex items-center gap-1.5">
              <AlertOctagon size={14} /> Emergency warning
            </p>
            <p className="text-sm text-ink-700 mt-1.5 leading-relaxed">
              If you notice smoke, fire, fuel leakage, brake failure, severe overheating, or another
              immediate safety risk, stop driving and seek professional assistance.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {helpTopics.map((topic, i) => {
            const open = openIndex === i;
            return (
              <div key={topic.q} className="bg-white border border-mist-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-medium text-sm text-ink-900">{topic.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-ink-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-4 text-sm text-ink-500 leading-relaxed animate-rise">{topic.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
