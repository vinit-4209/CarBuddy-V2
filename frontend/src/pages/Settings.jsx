import { useState } from "react";
import { Trash2, Moon, Sun, User, Bell, Shield, Database } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useConversations } from "../hooks/useConversations";
import { useToast } from "../components/ui/Toast";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
        checked ? "bg-ignition-500 justify-end" : "bg-mist-300 justify-start"
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-mist-100 text-ink-600 flex items-center justify-center">
          <Icon size={15} />
        </div>
        <h2 className="font-display font-semibold text-ink-900 text-[15px]">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function Settings() {
  const { clearHistory } = useConversations();
  const { showToast } = useToast();
  const [name, setName] = useState("Vinit Kumar");
  const [email, setEmail] = useState("vinit@gmail.com");
  const [notifDiagnosis, setNotifDiagnosis] = useState(true);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifTips, setNotifTips] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shareUsage, setShareUsage] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <main className="px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto space-y-5">
        <Section icon={User} title="Profile">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-mist-50 border border-mist-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-ignition-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-mist-50 border border-mist-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-ignition-300"
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => showToast("Profile updated.", "success")}
          >
            Save changes
          </Button>
        </Section>

        <Section icon={Bell} title="Notifications">
          <Row label="Diagnosis updates" description="Get notified when a diagnosis is ready.">
            <Toggle checked={notifDiagnosis} onChange={setNotifDiagnosis} label="Diagnosis updates" />
          </Row>
          <Row label="Booking reminders" description="Reminders before your mechanic appointment.">
            <Toggle checked={notifBooking} onChange={setNotifBooking} label="Booking reminders" />
          </Row>
          <Row label="Tips & product news" description="Occasional maintenance tips.">
            <Toggle checked={notifTips} onChange={setNotifTips} label="Tips and product news" />
          </Row>
        </Section>

        <Section icon={darkMode ? Moon : Sun} title="Appearance">
          <Row label="Dark mode" description="Switch the interface to a darker theme.">
            <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
          </Row>
        </Section>

        <Section icon={Shield} title="Privacy">
          <Row label="Share anonymized usage data" description="Helps us improve diagnostic accuracy.">
            <Toggle checked={shareUsage} onChange={setShareUsage} label="Share anonymized usage data" />
          </Row>
        </Section>

        <Section icon={Database} title="Data">
          <Row label="Clear conversation history" description="Remove all saved diagnoses from this device.">
            <Button size="sm" variant="secondary" onClick={() => setConfirmClear(true)}>
              Clear
            </Button>
          </Row>
          <Row label="Delete account" description="Permanently delete your CarBuddy V2 account." danger>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </Row>
        </Section>
      </main>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear conversation history?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearHistory();
                setConfirmClear(false);
                showToast("Conversation history cleared.", "success");
              }}
            >
              Clear history
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">
          This removes all saved conversations and diagnoses from this device. This can't be undone.
        </p>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDelete(false);
                showToast("This is a demo — no account was deleted.", "info");
              }}
            >
              Delete account
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">
          This is a UI-only demo — no backend account exists to delete. In production this would
          permanently remove your account and data.
        </p>
      </Modal>
    </>
  );
}

function Row({ label, description, children, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 first:pt-0">
      <div>
        <p className={`text-sm font-medium ${danger ? "text-alert-600" : "text-ink-900"}`}>{label}</p>
        {description && <p className="text-xs text-ink-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}
