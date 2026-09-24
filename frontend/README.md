# 🏎️ CarBuddy V2 — Frontend

> Modern, responsive React + Vite web application for the **CarBuddy V2 — AI Car Mechanic** platform.

---

## 🌟 Overview

The CarBuddy V2 frontend provides an intuitive, conversational interface where vehicle owners can diagnose automotive problems, upload multimodal inspection media (photos, audio voice notes, videos), receive instant AI-assisted mechanical diagnoses, and schedule doorstep technician services.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS utilities
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **Deployment**: Vercel Free Tier (configured with SPA rewrites via `vercel.json`)

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure backend API URL
# Create or edit .env:
# VITE_API_BASE_URL=http://127.0.0.1:8000/api
# (Or set to your live Render backend URL)

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── chat/          # ChatWindow, ChatInput, ChatMessage, MediaUploader, AudioRecorderUI
│   ├── diagnosis/     # DiagnosisCard, SeverityBadge, ConfidenceIndicator, BookMechanicCTA
│   ├── booking/       # BookingForm, StepIndicator, TimeSlotPicker, AddressInput
│   ├── history/       # HistoryCard, SearchBar, FilterDropdown
│   ├── layout/        # Header, Sidebar, BottomNav
│   ├── common/        # EmptyState, ErrorState, LoadingState
│   └── ui/            # Button, Card, Badge, Modal, Toast, Avatar
├── pages/             # Home, Chat, History, Diagnosis, Booking, BookingSuccess, Help, Settings
├── services/          # api.js, chatService.js, uploadService.js, diagnosisService.js, bookingService.js
├── hooks/             # useConversations.js, useActiveConversationId.js
├── data/              # mockData.js (seed categories, mechanics, services)
└── utils/             # storage.js (localStorage wrapper), format.js
```

---

## 💡 Key Features & UX Highlights

1. **Multimodal Media Uploads & Audio Recorder:**
   - Supports camera photos, vehicle warning light snapshots, uploaded videos, and recorded audio notes (e.g. engine knocking or belt squealing).
   - In-chat HTML5 audio player allows instant playback of recorded voice notes.
2. **1-Click Sample Testing Prompts:**
   - Four pre-configured mechanical scenarios allow evaluators and users to test diagnostic reasoning with a single click.
3. **AI Minimization Attribution Badges:**
   - Assistant bubbles display engine badges:
     - `⚡ Local Rule Engine (0 AI Calls)`
     - `⚡ Domain Filter (0 AI Calls)`
     - `🧠 Gemini Multimodal AI`
     - `🛡️ Deterministic Rule Fallback`
4. **On-Demand Image Analysis:**
   - Media upload is completely optional. Users can chat via text first and attach photos/audio at any turn for multimodal inspection.
5. **Printable Work Order Report:**
   - Diagnosis cards include a 1-click **Print / PDF** button (`window.print()`).
6. **Isolated Device History:**
   - Conversation sessions are scoped to `localStorage`, giving evaluators a fresh session on their device.
