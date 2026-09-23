import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Stethoscope, Wrench, FileSearch } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SeverityBadge from "../components/diagnosis/SeverityBadge";
import ConfidenceIndicator from "../components/diagnosis/ConfidenceIndicator";
import SymptomList from "../components/diagnosis/SymptomList";
import { RecommendationCard, SafetyNote } from "../components/diagnosis/RecommendationCard";
import EmptyState from "../components/common/EmptyState";
import { useConversations } from "../hooks/useConversations";
import { useActiveConversationId } from "../hooks/useActiveConversationId";
import { services } from "../data/mockData";

export default function Diagnosis() {
  const navigate = useNavigate();
  const { conversations, getConversation } = useConversations();
  const [activeId] = useActiveConversationId();

  const active = activeId ? getConversation(activeId) : null;
  const fallback = conversations.find((c) => c.diagnosis);
  const conversation = active?.diagnosis ? active : fallback;

  if (!conversation) {
    return (
      <>
        <Header title="Vehicle Diagnosis" />
        <main className="px-4 sm:px-6 py-10 max-w-2xl w-full mx-auto">
          <EmptyState
            icon={FileSearch}
            title="No diagnosis yet"
            description="Start a conversation with the AI mechanic to get your first diagnosis."
            action={<Button onClick={() => navigate("/chat")}>Start Diagnosis</Button>}
          />
        </main>
      </>
    );
  }

  const { diagnosis, vehicle, issue } = conversation;
  const recommendedService = services.find((s) => s.id === diagnosis.recommendedService);

  return (
    <>
      <Header
        title="Vehicle Diagnosis"
        right={
          <button
            onClick={() => navigate(`/chat${conversation.id ? `?id=${conversation.id}` : ""}`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft size={15} /> Back to conversation
          </button>
        }
      />

      <main className="px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto space-y-5">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-mist-100 text-ink-600 flex items-center justify-center shrink-0">
            <Car size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500">Vehicle</p>
            <p className="font-display font-semibold text-ink-900">{vehicle}</p>
            <p className="text-sm text-ink-500 mt-0.5">{issue}</p>
          </div>
        </Card>

        <Card padded={false} className="overflow-hidden">
          <div className="bg-ink-900 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ignition-500/20 text-ignition-300 flex items-center justify-center">
              <Stethoscope size={16} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/40 font-medium">Possible issue</p>
              <p className="text-white font-display font-semibold text-sm">{diagnosis.title}</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <SeverityBadge severity={diagnosis.severity} />
              <div className="flex-1 min-w-[140px]">
                <p className="text-xs text-ink-500 mb-1">Confidence</p>
                <ConfidenceIndicator value={diagnosis.confidence} />
              </div>
            </div>

            <SymptomList title="Symptoms" items={diagnosis.symptoms} />
            <SymptomList title="Possible causes" items={diagnosis.causes} numbered />

            <div>
              <p className="text-sm font-semibold text-ink-900 mb-2">Recommended checks</p>
              <RecommendationCard text={diagnosis.recommendedStep} />
            </div>

            {diagnosis.safetyNotes && (
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-2">Safety notes</p>
                <SafetyNote text={diagnosis.safetyNotes} />
              </div>
            )}

            {recommendedService && (
              <div className="flex items-center justify-between bg-mist-50 border border-mist-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-ink-500">Recommended service</p>
                  <p className="text-sm font-medium text-ink-900">{recommendedService.name}</p>
                </div>
                <span className="text-sm font-semibold text-ink-900">₹{recommendedService.price}</span>
              </div>
            )}
          </div>
        </Card>

        <Button full size="lg" icon={Wrench} onClick={() => navigate("/booking")}>
          Book a Mechanic
        </Button>
      </main>
    </>
  );
}
