const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

import { mechanics } from "../data/mockData";

/**
 * Create a mechanic booking via POST /api/booking/
 *
 * @param {{
 *   diagnosisId?: number,
 *   serviceId?: string,
 *   service?: string,
 *   address: { name: string, phone: string, address: string, city: string, pincode: string } | string,
 *   vehicle?: string,
 *   date: string,
 *   time: string
 * }} data
 * @returns {Promise<object>} booking confirmation
 */
function formatTimeTo24H(timeStr) {
  if (!timeStr) return "10:00:00";
  const str = String(timeStr).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return str;
  let [, hours, minutes, modifier] = match;
  let h = parseInt(hours, 10);
  if (modifier) {
    if (modifier.toUpperCase() === "PM" && h < 12) h += 12;
    if (modifier.toUpperCase() === "AM" && h === 12) h = 0;
  }
  const hh = String(h).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

function formatDateToISO(dateVal) {
  if (!dateVal) return new Date().toISOString().slice(0, 10);
  if (dateVal instanceof Date) {
    return dateVal.toISOString().slice(0, 10);
  }
  const str = String(dateVal).trim();
  if (str.includes("T")) return str.split("T")[0];
  return str;
}

export async function createBooking(data) {
  const payload = {
    diagnosis_id: data.diagnosisId || data.diagnosis_id || null,
    customer_name: typeof data.address === "object" ? data.address?.name : data.customer_name,
    phone: typeof data.address === "object" ? data.address?.phone : data.phone,
    email: data.email || "",
    vehicle: data.vehicle || "Customer Vehicle",
    service: data.service || data.serviceId || "Auto Mechanic Service",
    address: typeof data.address === "object" ? data.address?.address : data.address,
    city: typeof data.address === "object" ? data.address?.city : (data.city || ""),
    pincode: typeof data.address === "object" ? data.address?.pincode : (data.pincode || ""),
    preferred_date: formatDateToISO(data.date || data.preferred_date),
    preferred_time: formatTimeTo24H(data.time || data.preferred_time),
  };

  const response = await fetch(`${API_BASE_URL}/booking/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const resData = await response.json().catch(() => null);

  if (!response.ok || !resData?.success) {
    const errorMsg = resData?.error || `Booking failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.code = "BOOKING_FAILED";
    throw err;
  }

  const b = resData.booking;
  const assignedMechanic = mechanics[Math.floor(Math.random() * mechanics.length)];

  return {
    id: `AM-${b.id}`,
    backendId: b.id,
    status: b.status || "Confirmed",
    mechanic: assignedMechanic,
    date: b.preferred_date,
    time: b.preferred_time,
    service: b.service,
    address: {
      name: b.customer_name,
      phone: b.phone,
      address: b.address,
      city: b.city,
      pincode: b.pincode,
    },
    vehicle: b.vehicle,
    diagnosisId: b.diagnosis_id,
  };
}

/**
 * Fetch a booking by ID via GET /api/booking/{id}/
 *
 * @param {number|string} bookingId
 * @returns {Promise<object>} booking details
 */
export async function getBooking(bookingId) {
  const numericId = String(bookingId).replace(/^AM-/, "");

  const response = await fetch(`${API_BASE_URL}/booking/${numericId}/`);
  const resData = await response.json().catch(() => null);

  if (!response.ok || !resData?.success) {
    const errorMsg = resData?.error || `Failed to fetch booking #${bookingId}`;
    throw new Error(errorMsg);
  }

  const b = resData.booking;
  const assignedMechanic = mechanics[0];

  return {
    id: `AM-${b.id}`,
    backendId: b.id,
    status: b.status || "Confirmed",
    mechanic: assignedMechanic,
    date: b.preferred_date,
    time: b.preferred_time,
    service: b.service,
    address: {
      name: b.customer_name,
      phone: b.phone,
      address: b.address,
      city: b.city,
      pincode: b.pincode,
    },
    vehicle: b.vehicle,
    diagnosisId: b.diagnosis_id,
  };
}
