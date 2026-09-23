import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Image as ImageIcon,
  History,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Gauge,
  Sparkles,
} from "lucide-react";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const QUICK_ACTIONS = [
  {
    icon: MessageCircle,
    title: "Start New Diagnosis",
    description: "Tell us what your car is doing.",
    to: "/chat",
  },
  {
    icon: ImageIcon,
    title: "Upload Vehicle Photos",
    description: "Show us warning lights, damage or parts.",
    to: "/chat",
  },
  {
    icon: History,
    title: "Previous Diagnoses",
    description: "Review your previous conversations.",
    to: "/history",
  },
  {
    icon: Wrench,
    title: "Book a Mechanic",
    description: "Get professional help when needed.",
    to: "/booking",
  },
];

const STEPS = [
  { title: "Describe the issue", description: "Tell the AI mechanic what your car is doing, in your own words." },
  { title: "Answer a few questions", description: "Quick guided questions narrow down what's actually wrong." },
  { title: "Upload media if needed", description: "Add photos of warning lights, or audio/video of the noise." },
  { title: "Receive diagnosis", description: "Get a possible cause, confidence level and severity." },
  { title: "Book a mechanic if required", description: "Schedule a certified technician for an in-person check." },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back, Vinit"
        right={<Badge tone="torque" icon={Gauge}>System online</Badge>}
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto space-y-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl2 bg-ink-900 px-6 sm:px-10 py-10 sm:py-14">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-ignition-500/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <Badge tone="ignition" icon={Sparkles} className="bg-white/10 border-white/10 text-ignition-200 mb-5">
                AI-powered automotive diagnostics
              </Badge>
              <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-[2.6rem] text-white leading-[1.1] tracking-tight">
                Your Car's Problem.
                <br />
                Diagnosed Smarter.
              </h1>
              <p className="text-white/60 text-[15px] sm:text-base mt-4 max-w-md leading-relaxed">
                Describe what's wrong with your vehicle, upload photos, audio or video, and get guided
                troubleshooting from an AI mechanic.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/chat")}>
                  Start Diagnosis
                </Button>
                <Button size="lg" variant="outlineLight" onClick={() => navigate("/history")}>
                  View History
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-ignition-500/20 text-ignition-300 flex items-center justify-center">
                    <Gauge size={16} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">CarBuddy V2 Assistant</p>
                    <p className="text-white/40 text-xs">Ready for inspection</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {["Understanding symptoms", "Reviewing conversation", "Analyzing vehicle issue"].map(
                    (label, i) => (
                      <div key={label} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${i < 2 ? "bg-torque-400" : "bg-ignition-400"}`}
                        />
                        <span className="text-white/70">{label}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-1.5">Confidence</p>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[78%] rounded-full bg-torque-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">Quick actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Card
                key={action.title}
                as="button"
                hover
                onClick={() => navigate(action.to)}
                className="text-left flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-ignition-50 text-ignition-600 flex items-center justify-center">
                  <action.icon size={18} />
                </div>
                <div>
                  <p className="font-medium text-ink-900 text-sm">{action.title}</p>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="w-8 h-8 rounded-lg bg-ink-900 text-white flex items-center justify-center text-xs font-semibold font-mono mb-3">
                  {i + 1}
                </div>
                <p className="font-medium text-sm text-ink-900">{step.title}</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust / safety */}
        <section className="bg-white border border-mist-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-caution-500/10 text-caution-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm">A note on trust and safety</p>
            <p className="text-sm text-ink-500 mt-1 leading-relaxed max-w-2xl">
              AI-assisted guidance is not a substitute for professional mechanical inspection. For anything
              safety-related — brakes, steering, fuel, smoke or fire — stop driving and consult a certified
              mechanic.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
