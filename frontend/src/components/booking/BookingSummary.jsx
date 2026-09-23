import { formatCurrency, formatDate } from "../../utils/format";

export default function BookingSummary({ service, mechanic, address, date, time }) {
  const rows = [
    { label: "Service", value: service?.name },
    { label: "Mechanic", value: mechanic?.name || "Assigned on confirmation" },
    { label: "Location", value: address ? `${address.address}, ${address.city} ${address.pincode}` : "—" },
    { label: "Date", value: date ? formatDate(date) : "—" },
    { label: "Time", value: time || "—" },
    { label: "Estimated cost", value: service ? formatCurrency(service.price) : "—" },
  ];

  return (
    <div className="bg-mist-50 border border-mist-200 rounded-2xl divide-y divide-mist-200">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-ink-500">{row.label}</span>
          <span className="font-medium text-ink-900 text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
