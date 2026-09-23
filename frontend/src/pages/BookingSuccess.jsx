import { useLocation, useNavigate } from "react-router-dom";
import { Wrench, Home } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SuccessState from "../components/booking/SuccessState";
import { formatDate } from "../utils/format";

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;
  const service = state?.service;

  if (!booking) {
    return (
      <>
        <Header title="Booking" />
        <main className="px-4 sm:px-6 py-10 max-w-lg w-full mx-auto text-center">
          <p className="text-ink-500 text-sm mb-4">No recent booking found.</p>
          <Button onClick={() => navigate("/booking")}>Book a Mechanic</Button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Booking Confirmed" />
      <main className="px-4 sm:px-6 py-6 max-w-lg w-full mx-auto">
        <SuccessState
          title="Mechanic Booked Successfully"
          description="Your mechanic appointment has been scheduled."
        >
          <Card className="text-left divide-y divide-mist-200" padded={false}>
            <Row label="Booking ID" value={booking.id} mono />
            <Row label="Status" value={booking.status} badge />
            <Row label="Service" value={service?.name} />
            <Row label="Mechanic" value={booking.mechanic?.name} />
            <Row label="Date" value={formatDate(booking.date)} />
            <Row label="Time" value={booking.time} />
            <Row label="Location" value={`${booking.address?.city || ''} ${booking.address?.pincode || ''}`} />
            <Row label="Payment" value="Pay After Service (Zero Advance Payment)" />
          </Card>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="secondary" icon={Wrench} onClick={() => navigate("/history")}>
              View Booking
            </Button>
            <Button icon={Home} onClick={() => navigate("/")}>
              Back to Dashboard
            </Button>
          </div>
        </SuccessState>
      </main>
    </>
  );
}

function Row({ label, value, mono, badge }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-ink-500">{label}</span>
      {badge ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-torque-500/10 text-torque-600 text-xs font-medium border border-torque-500/20">
          {value}
        </span>
      ) : (
        <span className={`font-medium text-ink-900 ${mono ? "font-mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}
