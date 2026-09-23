import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RotateCcw, ArrowLeft } from "lucide-react";

import Header from "../components/layout/Header";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import DiagnosisCard from "../components/diagnosis/DiagnosisCard";
import BookMechanicCTA from "../components/diagnosis/BookMechanicCTA";
import ErrorState from "../components/common/ErrorState";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";

import { useConversations } from "../hooks/useConversations";
import { useActiveConversationId } from "../hooks/useActiveConversationId";

import { sendMessage as sendMessageApi } from "../services/chatService";
import { introMessage } from "../data/mockData";
import { timeNow } from "../utils/format";

let idCounter = 0;

function uid() {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

export default function Chat() {
  const [params] = useSearchParams();

  const urlConversationId = params.get("id");

  const navigate = useNavigate();

  const {
    getConversation,
    upsertConversation,
  } = useConversations();

  const [, setActiveId] = useActiveConversationId();

  const existing = urlConversationId
    ? getConversation(urlConversationId)
    : null;

  const [messages, setMessages] = useState(
    existing?.messages || [introMessage]
  );

  const [typing, setTyping] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [diagnosis, setDiagnosis] = useState(
    existing?.diagnosis || null
  );

  const [choseTroubleshooting, setChoseTroubleshooting] = useState(
    Boolean(existing?.choseTroubleshooting)
  );

  const [showBookCTA, setShowBookCTA] = useState(
    Boolean(existing?.diagnosis && !existing?.choseTroubleshooting)
  );

  const [error, setError] = useState(null);

  const [pendingRetryText, setPendingRetryText] = useState(null);

  const draftIssueRef = useRef(
    existing?.issue || ""
  );

  const currentConvIdRef = useRef(
    existing?.backendConversationId ||
    existing?.conversationId ||
    null
  );

  const readOnly = Boolean(existing);

  // --------------------------------
  // Reset when opening a new chat
  // --------------------------------

  useEffect(() => {
    if (!existing) {
      setMessages([introMessage]);
      setDiagnosis(null);
      setShowBookCTA(false);
      setChoseTroubleshooting(false);
      setError(null);

      currentConvIdRef.current = null;
      draftIssueRef.current = "";
    } else {
      setChoseTroubleshooting(Boolean(existing.choseTroubleshooting));
      setShowBookCTA(Boolean(existing.diagnosis && !existing.choseTroubleshooting));
    }
  }, [urlConversationId]);

  // --------------------------------
  // Add message to UI
  // --------------------------------

  function pushMessage(message) {
    setMessages((previous) => [
      ...previous,
      {
        id: uid(),
        time: timeNow(),
        ...message,
      },
    ]);
  }

  // --------------------------------
  // Save conversation locally
  // --------------------------------

  function persistConversation(overrides = {}) {
    const backendConversationId =
      currentConvIdRef.current;

    if (!backendConversationId) {
      return;
    }

    const localId = existing?.id ||
      `conv-${backendConversationId}`;

    setActiveId(localId);

    upsertConversation({
      id: localId,

      backendConversationId,

      vehicle: "Your vehicle",

      issue:
        draftIssueRef.current ||
        "Vehicle issue",

      date:
        new Date()
          .toISOString()
          .slice(0, 10),

      status:
        overrides.status ||
        "active",

      severity:
        diagnosis?.severity ||
        "moderate",

      lastMessage:
        overrides.lastMessage ||
        draftIssueRef.current,

      messages,

      diagnosis:
        overrides.diagnosis ||
        diagnosis ||
        undefined,

      choseTroubleshooting:
        overrides.choseTroubleshooting !== undefined
          ? overrides.choseTroubleshooting
          : choseTroubleshooting,

      booking:
        overrides.booking,

      ...overrides,
    });
  }

  // --------------------------------
  // Send message to Django backend
  // --------------------------------

  async function handleSend(
    text,
    attachments = []
  ) {
    if (readOnly) {
      return;
    }

    if (!text?.trim()) {
      return;
    }

    setError(null);

    // Show user's message immediately
    pushMessage({
      role: "user",
      text,
      attachments:
        attachments?.length
          ? attachments
          : undefined,
    });

    if (!draftIssueRef.current) {
      draftIssueRef.current = text;
    }

    setTyping(true);
    setProcessing(true);

    try {
      const reply = await sendMessageApi({
        text,
        attachments,

        conversationId:
          currentConvIdRef.current,
      });

      // Save backend conversation ID
      currentConvIdRef.current =
        reply.conversationId;

      setTyping(false);
      setProcessing(false);

      // Add AI response
      pushMessage({
        role: "ai",
        text: reply.text,

        quickReplies:
          reply.quickReplies,
      });

      // --------------------------------
      // Diagnosis received
      // --------------------------------

      if (reply.diagnosisReady) {
        const newDiagnosis = {
          id: reply.diagnosisId,
          title: reply.diagnosis || "Vehicle diagnosis",
          diagnosis: reply.diagnosis,
          confidence: Math.round(reply.confidence || 85),
          recommended_service: reply.recommendedService || "General Inspection",
          recommendedService: reply.recommendedService || "General Inspection",
          recommendedStep: reply.recommendedService || "Comprehensive vehicle inspection by certified technician.",
          causes: reply.possibleCauses?.length ? reply.possibleCauses : ["Component wear or electrical fault"],
          possibleCauses: reply.possibleCauses || [],
          symptoms: reply.symptoms || [],
          safetyNotes: reply.safetyWarning || "",
          safety_notes: reply.safetyWarning || "",
          safety_warning: reply.safetyWarning || "",
          severity: reply.severity || "medium",
        };

        setDiagnosis(newDiagnosis);

        if (!choseTroubleshooting && !existing?.choseTroubleshooting) {
          setShowBookCTA(true);
        } else {
          setShowBookCTA(false);
        }

        persistConversation({
          status: "diagnosed",
          diagnosis: newDiagnosis,
          lastMessage: reply.text,
        });

        return;
      }

      // --------------------------------
      // Normal conversation
      // --------------------------------

      persistConversation({
        status: "active",
        lastMessage: reply.text,
      });

    } catch (err) {
      console.error("Chat error:", err);

      setTyping(false);
      setProcessing(false);

      setPendingRetryText(text);

      setError({
        message:
          err?.message ||
          "Message failed to send. Please try again.",

        retry: "message",
      });
    }
  }

  // --------------------------------
  // Quick reply
  // --------------------------------

  function handleQuickReply(option) {
    handleSend(option, []);
  }

  // --------------------------------
  // Retry
  // --------------------------------

  function handleRetry() {
    if (
      error?.retry === "message" &&
      pendingRetryText
    ) {
      const text = pendingRetryText;

      setPendingRetryText(null);
      setError(null);

      handleSend(text, []);
    }
  }

  // --------------------------------
  // Book mechanic
  // --------------------------------

  function handleBook() {
    persistConversation({
      status: "diagnosed",
      diagnosis,
    });

    navigate("/booking");
  }

  function generateTroubleshootingSteps(diag) {
    const title = (diag?.title || diag?.diagnosis || "").toLowerCase();

    if (title.includes("fan") || title.includes("overheat") || title.includes("cooling")) {
      return (
        "Here is the recommended step-by-step troubleshooting process for your cooling system:\n\n" +
        "### Step 1: Safe Cool-Down\n" +
        "• Turn off the engine and let it cool completely for at least 30–45 minutes.\n" +
        "• CAUTION: Never open the radiator pressure cap while the engine is hot.\n\n" +
        "### Step 2: Coolant Level & Expansion Tank Check\n" +
        "• Locate the translucent plastic coolant reservoir tank next to the radiator.\n" +
        "• Ensure the fluid level is between the 'MIN' and 'MAX' marks. If low, top up with 50/50 premixed coolant.\n\n" +
        "### Step 3: Radiator Fan Operation Test\n" +
        "• Turn the vehicle ignition to ON and switch your Air Conditioning (AC) to MAX cool.\n" +
        "• Pop the hood and inspect behind the radiator: the electric cooling fan should immediately start spinning.\n" +
        "• If the fan stays completely still, the fan motor, fuse, or relay has failed.\n\n" +
        "### Step 4: Cooling Fan Fuse & Relay Inspection\n" +
        "• Open the under-hood fuse/relay box (refer to your vehicle's fuse diagram).\n" +
        "• Inspect the 'RAD FAN' / 'COOLING FAN' fuse (typically 15A–30A). If the filament is broken, replace it.\n" +
        "• Swap the cooling fan relay with an identical non-critical relay (such as the horn relay) to see if the fan engages.\n\n" +
        "### Step 5: Temperature Switch & Motor Check\n" +
        "• Inspect the wiring plug directly connected to the fan motor for corrosion, melting, or loose wires.\n" +
        "• If the fuse and relay are good but the fan motor does not spin, the fan motor itself needs replacement.\n\n" +
        "Feel free to reply here if you complete any of these steps and need guidance on what to check next!"
      );
    }

    if (title.includes("battery") || title.includes("start") || title.includes("crank")) {
      return (
        "Here is the recommended step-by-step troubleshooting process for your starting/battery issue:\n\n" +
        "### Step 1: Terminal Connection & Corrosion Check\n" +
        "• Pop the hood and locate the 12V car battery.\n" +
        "• Check for white or blue-green powdery corrosion around the positive (+) and negative (-) terminals.\n" +
        "• Ensure both terminal clamps are tightly secured and do not wiggle by hand.\n\n" +
        "### Step 2: Clean Battery Terminals\n" +
        "• If corroded, mix baking soda with warm water and use an old toothbrush to clean off the corrosion.\n" +
        "• Dry thoroughly and apply a thin layer of petroleum jelly to prevent future oxidation.\n\n" +
        "### Step 3: Voltage & Multimeter Check\n" +
        "• If you have a digital multimeter, set it to DC Volts and measure across the battery terminals.\n" +
        "• A healthy battery should read 12.6V or above with the engine off.\n" +
        "• If voltage is under 12.0V, the battery is discharged and needs a recharge or jump-start.\n\n" +
        "### Step 4: Jump-Start Test\n" +
        "• Connect booster jumper cables properly (Red to positive +, Black to negative - / chassis ground).\n" +
        "• If the vehicle starts immediately when connected to another running car, your battery or alternator is at fault.\n\n" +
        "### Step 5: Alternator Charging Verification\n" +
        "• With the engine running, measure battery voltage again. It should read between 13.8V and 14.4V.\n" +
        "• If voltage remains below 13.0V while running, the alternator is failing to recharge the battery.\n\n" +
        "Let me know what you find during these steps!"
      );
    }

    if (title.includes("brake")) {
      return (
        "Here is the recommended step-by-step troubleshooting process for your brake system:\n\n" +
        "### Step 1: Brake Fluid Reservoir Level Check\n" +
        "• Open the hood and locate the translucent brake fluid reservoir near the firewall.\n" +
        "• Check that the fluid level sits between the MIN and MAX lines. The fluid should be amber, not dark black.\n\n" +
        "### Step 2: Visual Brake Pad Wear Inspection\n" +
        "• Look through the wheel spokes with a flashlight at the brake caliper.\n" +
        "• Observe the friction material on the brake pad pressed against the rotor disc.\n" +
        "• If the pad thickness is less than 3mm (about the thickness of two coins), the pads must be replaced immediately.\n\n" +
        "### Step 3: Rotor Surface Inspection\n" +
        "• Check the shiny disc surface for deep circular grooves, blue discoloration (heat spots), or scoring.\n" +
        "• If deep grooves are present, the rotors will need resurfacing or replacement.\n\n" +
        "### Step 4: Brake Pedal Feel Test (Parked)\n" +
        "• With the engine off, pump the brake pedal 3–4 times. It should become firm.\n" +
        "• If the pedal sinks slowly to the floor under pressure, the master cylinder or a brake line may be leaking.\n\n" +
        "Let me know if you observe thin pads, fluid loss, or disc scoring!"
      );
    }

    return (
      "Here is the recommended step-by-step troubleshooting process for this issue:\n\n" +
      "### Step 1: Safety & Visual Inspection\n" +
      "• Park on a level surface, engage the handbrake, and let the vehicle cool down.\n" +
      "• Perform a visual check under the hood and underneath the car for visible leaks, loose hoses, or damaged wires.\n\n" +
      "### Step 2: Warning Lights & OBD-II Scan\n" +
      "• Check if the Check Engine light or other warning indicators are illuminated on the instrument cluster.\n" +
      "• If you have an OBD-II scanner, plug it into the port under the dashboard to read any diagnostic trouble codes (DTCs).\n\n" +
      "### Step 3: Component Isolation\n" +
      "• Note exactly when the symptom occurs: at idle, under acceleration, over bumps, or during braking.\n" +
      "• Check fuses and fluid levels corresponding to the affected subsystem.\n\n" +
      "### Step 4: Test & Verify\n" +
      "• After inspecting, verify if the condition persists or changes under test conditions.\n\n" +
      "Let me know which step you'd like more details on!"
    );
  }

  // --------------------------------
  // Continue conversation / troubleshooting
  // --------------------------------

  function handleContinue() {
    setChoseTroubleshooting(true);
    setShowBookCTA(false);

    const stepsText = generateTroubleshootingSteps(diagnosis);

    pushMessage({
      role: "ai",
      text: stepsText,
    });

    persistConversation({
      choseTroubleshooting: true,
      lastMessage: stepsText,
    });
  }

  // --------------------------------
  // New conversation
  // --------------------------------

  function handleRestart() {
    navigate("/chat");
  }

  return (
    <div className="flex flex-col h-screen">

      <Header
        title={
          <span className="flex items-center gap-2">

            {readOnly && (
              <button
                onClick={() =>
                  navigate("/history")
                }
                aria-label="Back to history"
                className="p-1 -ml-1 rounded-lg hover:bg-mist-100"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            AI Mechanic

          </span>
        }

        subtitle="Senior Automotive Technician"

        right={
          <>
            <Badge tone="torque">
              ● Online
            </Badge>

            {!readOnly && (
              <button
                onClick={handleRestart}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900 px-2 py-1.5"
              >
                <RotateCcw size={13} />

                New chat
              </button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3 border-b border-mist-200 bg-white lg:hidden">

        <Avatar
          kind="ai"
          size={30}
          online
        />

      </div>

      <ChatWindow
        messages={messages}

        onQuickReply={
          readOnly
            ? () => {}
            : handleQuickReply
        }

        typing={typing}

        processing={processing}

        diagnosisSlot={
          diagnosis && (
            <div className="flex gap-3">

              <div className="w-8 shrink-0" />

              <div className="flex flex-col gap-3">

                <DiagnosisCard
                  diagnosis={diagnosis}
                />

                {existing?.booking && (
                  <div className="max-w-lg bg-torque-500/10 border border-torque-500/20 rounded-xl px-4 py-3 text-sm text-torque-700">
                    A mechanic has been booked for this issue — booking{" "}
                    {existing.booking.id}.
                  </div>
                )}

                {!readOnly &&
                  showBookCTA &&
                  !choseTroubleshooting &&
                  !existing?.choseTroubleshooting && (
                    <BookMechanicCTA
                      onBook={handleBook}
                      onContinue={handleContinue}
                    />
                  )}

              </div>
            </div>
          )
        }

        errorSlot={
          error && (
            <div className="flex gap-3">

              <div className="w-8 shrink-0" />

              <div className="max-w-lg w-full">

                <ErrorState
                  compact
                  description={error.message}
                  onRetry={handleRetry}
                />

              </div>

            </div>
          )
        }
      />

      {!readOnly ? (

        <ChatInput
          onSend={handleSend}
          disabled={
            typing ||
            processing
          }
        />

      ) : (

        <div className="border-t border-mist-200 bg-white px-4 sm:px-6 py-4 text-center">

          <p className="text-sm text-ink-500 mb-3">
            This is a past conversation.
          </p>

          <button
            onClick={handleRestart}
            className="text-sm font-medium text-ignition-600 hover:text-ignition-700"
          >
            Start a new diagnosis →
          </button>

        </div>

      )}

    </div>
  );
}