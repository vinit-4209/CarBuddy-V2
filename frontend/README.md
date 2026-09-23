# CarBuddy V2 — Frontend

"Your intelligent car mechanic, available anytime."

Frontend-only implementation of the AI Car Mechanic Chatbot assignment. There is **no backend** —
all AI, upload, diagnosis and booking behaviour is simulated in `src/services/*` with mock
async functions (with realistic delays, occasional simulated failures, and progress callbacks)
so it can be swapped for real Django REST Framework endpoints later without touching any
component code.

## Stack

React 19 + Vite, JavaScript (JSX), Tailwind CSS, React Router DOM, Lucide React.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production build in `dist/`.

## Where things live

- `src/pages` — one file per route (`/`, `/chat`, `/history`, `/diagnosis`, `/booking`,
  `/booking/success`, `/help`, `/settings`, 404).
- `src/components` — grouped by domain: `layout`, `chat`, `diagnosis`, `booking`, `history`,
  `common` (empty/error/loading states), `ui` (Button, Card, Badge, Modal, Toast, Avatar).
- `src/data/mockData.js` — seeded vehicles, conversations, services, mechanics, help content.
- `src/services/*` — `chatService`, `uploadService`, `diagnosisService`, `bookingService`.
  Every exported function is commented `// MOCK ONLY` at the point where a real `fetch` call
  would go.
- `src/hooks` — `useConversations` (localStorage-backed conversation store) and
  `useActiveConversationId`.
- `src/utils` — `storage.js` (localStorage helpers) and `format.js`.

## Notable UX details

- `/chat` plays a scripted example conversation (clicking-noise diagnosis) matching the brief,
  then supports free typing/quick replies, image/video/audio attachment with simulated upload
  progress and failure states, and an audio recorder UI.
- Diagnoses are always phrased as "possible cause" / "recommended inspection" — never presented
  as certain — with a disclaimer line on every diagnosis card.
- Every list/detail view has loading, empty and error states (see `components/common`).
- Data persists to `localStorage` under `automate_conversations`, `automate_activeConversationId`.
- Fully responsive: persistent sidebar on desktop, bottom nav + drawer on mobile, sticky chat
  composer, stacked diagnosis/booking layouts on small screens.
