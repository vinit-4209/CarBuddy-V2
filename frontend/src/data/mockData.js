// Mock data only. No backend calls happen anywhere in this file.

export const SEVERITY = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical",
};

export const SEVERITY_META = {
  low: { label: "Low", color: "torque" },
  moderate: { label: "Moderate", color: "caution" },
  high: { label: "High", color: "alert" },
  critical: { label: "Critical", color: "alert" },
};

export const STATUS = {
  ACTIVE: "active",
  DIAGNOSED: "diagnosed",
  BOOKED: "booked",
};

export const services = [
  {
    id: "svc-general",
    name: "General Inspection",
    price: 499,
    duration: "45 min",
    description: "A full top-to-bottom check across engine, brakes, electricals and fluids.",
  },
  {
    id: "svc-engine",
    name: "Engine Diagnostics",
    price: 799,
    duration: "60 min",
    description: "Deep diagnostic scan for engine performance, misfires and warning lights.",
  },
  {
    id: "svc-battery",
    name: "Battery Inspection",
    price: 299,
    duration: "20 min",
    description: "Battery health, terminal corrosion and charging system check.",
  },
  {
    id: "svc-brake",
    name: "Brake Inspection",
    price: 599,
    duration: "40 min",
    description: "Pad wear, rotor condition and brake fluid inspection.",
  },
];

export const timeSlots = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:30 PM",
  "04:00 PM",
  "06:00 PM",
];

export const mechanics = [
  { id: "mech-1", name: "Rohit Verma", rating: 4.9, specialty: "Engine & Electricals", years: 11 },
  { id: "mech-2", name: "Ayesha Khan", rating: 4.8, specialty: "Brakes & Suspension", years: 8 },
  { id: "mech-3", name: "Suresh Patil", rating: 4.7, specialty: "General Inspection", years: 14 },
];

export const quickReplyBank = [
  ["Only when starting", "Continues while running", "Happens randomly", "Not sure"],
  ["Engine cranks", "Only clicking", "Not sure"],
  ["Yes", "No", "Not sure"],
];

// Seeded conversations (empty by default so no fake mock data is shown)
export const seedConversations = [];

export const introMessage = {
  id: "m0",
  role: "ai",
  text: "Hello! I'm CarBuddy V2, your virtual senior automotive mechanic. What vehicle (make, model, year) are you driving, and what symptoms or issue are you experiencing today?",
  time: "Just now",
};

export const helpTopics = [
  {
    q: "How does CarBuddy V2 work?",
    a: "You describe your vehicle's symptoms in chat, optionally attach photos, audio or video, and answer a few guided questions. CarBuddy V2 then produces a possible diagnosis with confidence level and next steps.",
  },
  {
    q: "What information should I provide?",
    a: "The more specific you are — when the issue happens, any sounds or smells, warning lights, recent repairs — the more useful the guidance will be.",
  },
  {
    q: "Can I upload photos/videos?",
    a: "Yes. You can attach photos of warning lights or damage, short videos, or audio recordings of unusual sounds directly in the chat composer.",
  },
  {
    q: "When should I stop driving?",
    a: "Stop driving if you notice smoke, burning smells, fluid leaks, brake failure, or the temperature gauge in the red zone.",
  },
  {
    q: "When should I contact a professional mechanic?",
    a: "Any time the AI's confidence is moderate or higher on a safety-related issue, or if symptoms worsen — book a certified mechanic for an in-person inspection.",
  },
];
