# CarBuddy V2 — AI Car Mechanic Chatbot

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5%2B-646CFF.svg)](https://vitejs.dev/)

An intelligent, full-stack web application where car owners can chat with a virtual senior automotive mechanic agent for vehicle troubleshooting, multimodal inspection (images, audio, video), actionable diagnosis, and doorstep mechanic service bookings.

---

## 🏗️ Architecture Overview

The system is designed with a **hybrid architecture** that balances state-of-the-art AI reasoning with high-performance traditional backend logic to maximize reliability and minimize unnecessary AI/API usage.

```
┌─────────────────────────────────────────────────────────────┐
│                 React + Vite Frontend (UI)                  │
│   • Conversational Chat Window   • Media Uploader & Audio   │
│   • Diagnosis Summary Card       • Step-by-Step Booking     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST JSON / FormData
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Django REST Framework Backend                   │
│                                                             │
│  [1. Input Validation & Conversation Store]                 │
│         │                                                   │
│  [2. Traditional Filter: Greeting & Persona Response]       │──▶ Instant (0 AI calls)
│         │                                                   │
│  [3. Traditional Filter: Automotive Domain Verification]    │──▶ Polite Rejection
│         │                                                   │
│  [4. Resilient Hybrid Diagnostic Intelligence Engine]       │
│         ├── Priority 1: Gemini 3.6 Flash (Multimodal)       │
│         ├── Priority 2: Groq Llama-3.3-70B (Fast Fallback)  │
│         └── Priority 3: Rule-Based Automotive Expert Engine │
│         │                                                   │
│  [5. Diagnosis Persistence & Mechanic Booking Engine]       │
│         │                                                   │
│      SQLite3 Database (Conversations, Messages, Bookings)   │
└─────────────────────────────────────────────────────────────┘
```

### Minimizing Unnecessary AI Usage
Per the evaluation criteria, AI calls are minimized systematically:
1. **Traditional Greeting Short-Circuit**: Standard greetings ("Hello", "Hi", "Good morning") are handled immediately by deterministic rule-based logic without querying AI APIs.
2. **Automotive Domain Filter**: Unrelated queries (e.g. general trivia, cooking recipes, weather) are flagged via traditional keyword & context classification and politely rejected without consuming AI tokens.
3. **Multimodal Analysis on Demand**: Gemini AI is reserved strictly for analyzing complex mechanical symptoms, vehicle sounds (engine knocking, squealing belts), photos of components (leaking hoses, worn brake pads), or videos.
4. **Deterministic Fallback Engine**: If external AI quotas are exhausted or networks spike, a built-in rule-based mechanical troubleshooting state machine takes over seamlessly so the user never faces downtime.

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

---

### Backend Setup (Django & DRF)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend/` folder:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Start the development server**:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   The backend API is now live at `http://127.0.0.1:8000/api/`.

---

### Frontend Setup (React & Vite)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create or edit `.env` in the `frontend/` folder:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📡 REST API Documentation

### 1. Health Check
- **Endpoint**: `GET /api/health/`
- **Description**: Verifies backend server health.
- **Example Response**:
  ```json
  {
    "status": "success",
    "message": "CarBuddy V2 backend is running"
  }
  ```

---

### 2. Chat / Troubleshooting
- **Endpoint**: `POST /api/chat/`
- **Description**: Send a customer message to the virtual mechanic.
- **Request Body**:
  ```json
  {
    "message": "My 2018 Maruti Swift engine overheats when idling in traffic",
    "conversation_id": 1
  }
  ```
- **Example Response (Follow-up Turn)**:
  ```json
  {
    "success": true,
    "conversation_id": 1,
    "user_message": {
      "id": 12,
      "content": "My 2018 Maruti Swift engine overheats when idling in traffic",
      "role": "user"
    },
    "assistant_message": {
      "id": 13,
      "content": "Have you noticed if the radiator fan turns on when the engine gets hot?",
      "role": "assistant"
    },
    "is_automotive": true,
    "needs_followup": true,
    "followup_question": "Have you noticed if the radiator fan turns on when the engine gets hot?",
    "diagnosis_ready": false
  }
  ```
- **Example Response (Diagnosis Ready)**:
  ```json
  {
    "success": true,
    "conversation_id": 1,
    "diagnosis_ready": true,
    "diagnosis_id": 4,
    "diagnosis": "Radiator Cooling Fan Failure or Defective Fan Relay",
    "confidence": 0.88,
    "severity": "high",
    "symptoms": ["Engine overheating in traffic", "Radiator fan inoperative"],
    "possible_causes": ["Burnt out fan motor", "Blown fan fuse/relay"],
    "recommended_service": "Cooling System & Radiator Fan Inspection / Replacement",
    "safety_warning": "Avoid driving in red temperature zone to prevent head gasket failure."
  }
  ```

---

### 3. Media Upload
- **Endpoint**: `POST /api/upload/`
- **Content-Type**: `multipart/form-data`
- **Description**: Upload photos, recorded audio voice notes, or videos for mechanic inspection.
- **Parameters**:
  - `file`: Binary file (image, audio, or video, up to 20MB)
  - `conversation_id` (optional): ID of active conversation
- **Example Response**:
  ```json
  {
    "success": true,
    "conversation_id": 1,
    "message": {
      "id": 15,
      "conversation_id": 1,
      "media_type": "image",
      "file_name": "engine_bay.jpg",
      "file_size": 245100,
      "url": "http://127.0.0.1:8000/media/conversations/2026/09/23/engine_bay.jpg"
    }
  }
  ```

---

### 4. Fetch or Generate Diagnosis
- **Endpoint**: `POST /api/diagnosis/`
- **Request Body**:
  ```json
  {
    "conversation_id": 1
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "diagnosis": {
      "id": 4,
      "conversation": 1,
      "title": "Radiator Cooling Fan Failure or Defective Fan Relay",
      "severity": "high",
      "confidence": 0.88,
      "symptoms": ["Engine overheating in traffic"],
      "possible_causes": ["Burnt out fan motor", "Blown fan fuse/relay"],
      "recommended_service": "Cooling System & Radiator Fan Inspection / Replacement",
      "safety_notes": "Avoid driving in red temperature zone to prevent head gasket failure."
    }
  }
  ```

---

### 5. Create Mechanic Booking
- **Endpoint**: `POST /api/booking/`
- **Request Body**:
  ```json
  {
    "diagnosis_id": 4,
    "customer_name": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "vehicle": "2018 Maruti Swift",
    "service": "Cooling System & Radiator Fan Service",
    "address": "Flat 402, High Street",
    "city": "Mumbai",
    "pincode": "400050",
    "preferred_date": "2026-09-26",
    "preferred_time": "11:00:00"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Mechanic booking created successfully.",
    "booking": {
      "id": 1,
      "diagnosis_id": 4,
      "customer_name": "John Doe",
      "phone": "+91 9876543210",
      "email": "john@example.com",
      "vehicle": "2018 Maruti Swift",
      "service": "Cooling System & Radiator Fan Service",
      "address": "Flat 402, High Street",
      "city": "Mumbai",
      "pincode": "400050",
      "preferred_date": "2026-09-26",
      "preferred_time": "11:00:00",
      "status": "confirmed",
      "created_at": "2026-09-23T14:27:08.549848Z"
    }
  }
  ```

---

### 6. Get Booking Details
- **Endpoint**: `GET /api/booking/{id}/`
- **Description**: Retrieve booking confirmation details.
- **Example Response**:
  ```json
  {
    "success": true,
    "booking": {
      "id": 1,
      "diagnosis_id": 4,
      "customer_name": "John Doe",
      "phone": "+91 9876543210",
      "email": "john@example.com",
      "vehicle": "2018 Maruti Swift",
      "service": "Cooling System & Radiator Fan Service",
      "address": "Flat 402, High Street",
      "city": "Mumbai",
      "pincode": "400050",
      "preferred_date": "2026-09-26",
      "preferred_time": "11:00:00",
      "status": "confirmed",
      "created_at": "2026-09-23T14:27:08.549848Z"
    }
  }
  ```

---

## 🌐 Deployment Guide

### Deploying Frontend to Vercel (Free Tier)

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-backend-domain.com/api`
6. Click **Deploy**.

---

### Deploying Backend to AWS (Free Tier / EC2 or App Runner)

1. **Launch an AWS EC2 t2.micro instance** (Free Tier eligible with Ubuntu 22.04 LTS).
2. SSH into your instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```
3. Install Python, Git, and Nginx:
   ```bash
   sudo apt update && sudo apt install -y python3-pip python3-venv nginx git
   ```
4. Clone the repository and configure virtual environment:
   ```bash
   git clone <your-repo-url>
   cd automate-ai/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt gunicorn
   ```
5. Create `.env` with your API keys and run migrations:
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
6. Run Gunicorn as a systemd service or background process:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000 --daemon
   ```
7. Configure Nginx reverse proxy to port 8000 and enable HTTPS using Certbot.

---

## 🚀 Live Cloud Deployment Guide

### A. Deploy Backend to Render (Free)

1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `carbuddy-v2-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`)
   - **Start Command**: `gunicorn config.wsgi:application --log-file -`
5. Under **Environment Variables**, add:
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*`
   - `SECRET_KEY`: `<Generate a random secret key>`
   - `GROQ_API_KEY`: `<Your Groq API Key>`
   - `GEMINI_API_KEY`: `<Your Gemini API Key>`
6. Click **Deploy Web Service**.
7. Copy your assigned Render URL (e.g. `https://carbuddy-v2-backend.onrender.com`).
   - Verify health: `https://carbuddy-v2-backend.onrender.com/api/health/`

---

### B. Deploy Frontend to Vercel (Free)

1. Sign in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Import your GitHub repository.
3. In the project setup:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-app.onrender.com/api` (use your actual Render backend URL)
5. Click **Deploy**.
6. Your CarBuddy V2 frontend will be live at `https://<your-project>.vercel.app` with full SPA routing (`vercel.json`) and direct connection to your Render backend!

---

## 🧪 Testing

Run the automated backend test suite covering all 5 core endpoints and filtering logic:
```bash
cd backend
python test_all_endpoints.py
```
Expected output:
```
=== 1. Health Check === (Status: 200)
=== 2. Chat - Greeting === (Status: 200)
=== 3. Chat - Irrelevant Query === (Status: 200, is_automotive: False)
=== 4. Chat - Automotive Query === (Status: 200, followup returned)
=== 5. Media Upload === (Status: 201)
=== 6. Diagnosis View === (Status: 200)
=== 7. Create Booking === (Status: 201)
=== 8. Get Booking === (Status: 200)
ALL 8 TESTS PASSED SUCCESSFULLY!
```

---

## 📄 License
MIT License
