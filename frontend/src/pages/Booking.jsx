import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Phone, MapPin, Home as HomeIcon, Hash, CheckCircle } from "lucide-react";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import BookingStepper from "../components/booking/BookingStepper";
import ServiceCard from "../components/booking/ServiceCard";
import Calendar from "../components/booking/Calendar";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";
import BookingSummary from "../components/booking/BookingSummary";
import ErrorState from "../components/common/ErrorState";
import { services, timeSlots } from "../data/mockData";
import { createBooking } from "../services/bookingService";
import { useConversations } from "../hooks/useConversations";
import { useActiveConversationId } from "../hooks/useActiveConversationId";
import { useToast } from "../components/ui/Toast";

const emptyAddress = { name: "Vinit Kumar", phone: "", address: "", city: "", pincode: "" };

export default function Booking() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getConversation, upsertConversation } = useConversations();
  const [activeId] = useActiveConversationId();
  const activeConversation = activeId ? getConversation(activeId) : null;

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(activeConversation?.diagnosis?.recommendedService || null);
  const [address, setAddress] = useState(emptyAddress);
  const [addressErrors, setAddressErrors] = useState({});
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const service = services.find((s) => s.id === serviceId);

  function validateAddress() {
    const errs = {};
    if (!address.name.trim()) errs.name = "Name is required";
    if (!/^\+?[0-9\s]{7,15}$/.test(address.phone.trim())) errs.phone = "Enter a valid phone number";
    if (!address.address.trim()) errs.address = "Address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!/^\d{4,6}$/.test(address.pincode.trim())) errs.pincode = "Enter a valid pincode";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (step === 1 && !serviceId) {
      showToast("Please choose a service to continue.", "warning");
      return;
    }
    if (step === 2 && !validateAddress()) return;
    if (step === 3) {
      if (!date || !time) {
        showToast("Please select a date and time slot.", "warning");
        return;
      }
      handleConfirm();
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    if (step === 1) {
      navigate(-1);
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await createBooking({
        diagnosisId: activeConversation?.diagnosis?.id || activeConversation?.diagnosisId,
        vehicle: activeConversation?.vehicle || "Customer Vehicle",
        serviceId,
        service: service?.name || "Auto Mechanic Service",
        address,
        date,
        time,
      });
      if (activeConversation) {
        upsertConversation({ ...activeConversation, status: "booked", booking });
      }
      navigate("/booking/success", { state: { booking, service } });
    } catch (err) {
      setSubmitError(err?.message || "Booking failed. Please review your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header title="Book a Mechanic" subtitle="Get a certified technician at your doorstep" />

      <main className="px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto">
        <BookingStepper current={step} />

        {step === 1 && (
          <div className="space-y-4 animate-rise">
            <h2 className="font-display font-semibold text-ink-900 text-lg">Choose Service</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} selected={serviceId === s.id} onSelect={setServiceId} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-rise">
            <h2 className="font-display font-semibold text-ink-900 text-lg">Location</h2>
            <Card className="space-y-4">
              <Field
                icon={User}
                label="Name"
                value={address.name}
                onChange={(v) => setAddress((a) => ({ ...a, name: v }))}
                error={addressErrors.name}
                placeholder="Full name"
              />
              <Field
                icon={Phone}
                label="Phone"
                value={address.phone}
                onChange={(v) => setAddress((a) => ({ ...a, phone: v }))}
                error={addressErrors.phone}
                placeholder="+91 98765 43210"
              />
              <Field
                icon={HomeIcon}
                label="Address"
                value={address.address}
                onChange={(v) => setAddress((a) => ({ ...a, address: v }))}
                error={addressErrors.address}
                placeholder="House no., street, area"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  icon={MapPin}
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress((a) => ({ ...a, city: v }))}
                  error={addressErrors.city}
                  placeholder="City"
                />
                <Field
                  icon={Hash}
                  label="Pincode"
                  value={address.pincode}
                  onChange={(v) => setAddress((a) => ({ ...a, pincode: v }))}
                  error={addressErrors.pincode}
                  placeholder="000000"
                />
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-rise">
            <h2 className="font-display font-semibold text-ink-900 text-lg">Date &amp; Time</h2>
            <Calendar selectedDate={date} onSelect={setDate} />
            <div>
              <p className="text-sm font-medium text-ink-900 mb-2">Available time slots</p>
              <TimeSlotPicker slots={timeSlots} selected={time} onSelect={setTime} />
            </div>

            <div className="bg-torque-500/10 border border-torque-500/20 rounded-2xl p-4 flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-xl bg-torque-500/20 text-torque-600 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-torque-900">Zero Advance Payment Required</p>
                <p className="text-xs text-torque-700 mt-0.5">
                  Booking is 100% free right now. Pay only after the certified mechanic completes the service at your doorstep.
                </p>
              </div>
            </div>

            {submitError && <ErrorState compact description={submitError} onRetry={handleConfirm} />}
          </div>
        )}

        <div className="flex items-center justify-between mt-7">
          <Button variant="ghost" icon={ArrowLeft} onClick={back}>
            Back
          </Button>
          {step < 3 ? (
            <Button icon={ArrowRight} iconPosition="right" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button icon={ArrowRight} iconPosition="right" loading={submitting} onClick={next}>
              Confirm Booking (No Payment Required)
            </Button>
          )}
        </div>
      </main>
    </>
  );
}

function Field({ icon: Icon, label, value, onChange, error, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 mb-1.5 block">{label}</label>
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 bg-mist-50 ${
          error ? "border-alert-400" : "border-mist-200 focus-within:border-ignition-300"
        }`}
      >
        <Icon size={15} className="text-ink-500 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={Boolean(error)}
          className="bg-transparent outline-none text-sm flex-1 text-ink-900 placeholder:text-ink-500"
        />
      </div>
      {error && <p className="text-xs text-alert-600 mt-1">{error}</p>}
    </div>
  );
}
