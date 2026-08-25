# 🏥 CuraMind — AI-Powered Health Assistant

<div align="center">

![CuraMind Banner](https://img.shields.io/badge/CuraMind-AI%20Health%20Assistant-00E5FF?style=for-the-badge&logo=heart&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=flat-square)](https://groq.com/)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

**Understand Your Health. Instantly.**

[🌐 Live Demo](https://curamind-mu.vercel.app/) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Challenges & Solutions](#-challenges--solutions)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About the Project

**CuraMind** is a full-stack AI-powered health assistant that enables users to:

- Have intelligent conversations with an AI about any health topic
- Upload medical reports (PDFs or images) and get plain-language explanations
- Use voice input to ask questions hands-free
- Maintain a personal health profile for personalized AI responses
- Find nearby clinics using their real-time location

The project was built to solve a real problem: millions of people receive complex medical reports but have no easy way to understand them. CuraMind bridges that gap using Large Language Models (Groq), OCR technology (Tesseract), and voice AI (Whisper).

> ⚠️ **Disclaimer:** CuraMind is an AI assistant for informational purposes only. It does **not** replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat (Streaming)** | Real-time, token-by-token streaming chat powered by Groq LLM |
| 📄 **Medical Report Analysis** | Upload PDF or image reports — OCR extracts text, AI explains it in simple language |
| 🎤 **Voice Input** | Record voice questions using the built-in microphone, transcribed by Faster-Whisper |
| 🔊 **Text-to-Speech** | AI responses are read aloud using the Web Speech API with an animated avatar |
| 👤 **Health Profile** | Save age, gender, blood group, and medical history for personalized AI context |
| 🕘 **Chat History** | Full session management — create, browse, resume, and delete past conversations |
| 📊 **Personal Dashboard** | View health metrics and upload reports from a central dashboard |
| 🗺️ **Nearby Clinics** | Browser Geolocation API + OpenStreetMap to discover nearby clinics |
| 🔐 **Secure Auth** | Email/password sign-in + Google OAuth via Supabase Auth |
| 📱 **Responsive UI** | Works on desktop, tablet, and mobile browsers |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2 | React framework with App Router & SSR |
| React | 19 | UI component library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations & micro-interactions |
| Lucide React | Latest | Icon library |
| Recharts | 3 | Data visualization charts |
| Zustand | 5 | Lightweight state management |
| @supabase/ssr | Latest | Server-side auth integration |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Python REST API framework |
| Uvicorn | ASGI server |
| Pydantic | Request/response validation |
| Groq SDK | LLM inference (Llama 3) |
| PyMuPDF (fitz) | PDF text extraction |
| Pytesseract | OCR for image text extraction |
| Pillow | Image processing |
| Faster-Whisper | Voice-to-text transcription |
| gTTS | Google Text-to-Speech |
| python-multipart | File upload handling |
| supabase-py | Supabase database client |

### Database & Auth
| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Primary database with Row Level Security |
| Supabase Auth | User authentication & session management |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| Render | Cloud hosting for frontend and backend |
| Docker | Backend containerization (for Tesseract OCR) |
| GitHub | Version control & CI/CD trigger |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER                       │
│              Next.js 16 Frontend                     │
│      Dashboard / Chat / Settings / Auth              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│                FastAPI Backend                       │
│             (Render - Dockerized)                    │
│                                                     │
│  /api/chat     /api/documents     /api/voice         │
│  (Groq LLM)   (OCR/Tesseract)   (Faster-Whisper)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                          │
│     PostgreSQL + Auth + Row Level Security           │
│   users | profiles | sessions | messages | docs      │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User logs in → Supabase Auth issues JWT token
2. User sends message → Backend fetches profile context → Groq LLM streams response → saved to Supabase
3. User uploads PDF/image → Tesseract OCR extracts text → stored in Supabase → AI uses it as context
4. User records audio → Whisper transcribes to text → flows into chat pipeline

---

## 📁 Project Structure

```
curamind/
│
├── frontend/                       # Next.js 16 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/              # Authenticated routes
│   │   │   │   ├── dashboard/      # Dashboard page
│   │   │   │   ├── chat/           # Chat page
│   │   │   │   ├── settings/       # Profile settings
│   │   │   │   └── layout.tsx      # App shell with Sidebar
│   │   │   ├── (auth)/             # Auth routes
│   │   │   │   ├── login/          # Login page
│   │   │   │   └── signup/         # Signup page
│   │   │   ├── auth/callback/      # OAuth callback handler
│   │   │   └── page.tsx            # Landing page
│   │   ├── components/
│   │   │   ├── Chat/               # Streaming chat UI
│   │   │   ├── Sidebar/            # Chat history sidebar
│   │   │   ├── Upload/             # Document upload area
│   │   │   └── Map/                # Clinic map component
│   │   └── lib/supabase/           # Supabase client utilities
│   ├── next.config.ts
│   ├── package.json
│   └── .env.local                  # Frontend environment variables
│
├── backend/                        # FastAPI Python App
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py             # Chat, sessions, profile endpoints
│   │   │   ├── documents.py        # Document upload & OCR endpoints
│   │   │   └── voice.py            # Voice transcription endpoint
│   │   ├── core/
│   │   │   └── db.py               # Supabase client initialization
│   │   └── services/
│   │       ├── llm.py              # Groq LLM streaming integration
│   │       └── ocr.py              # Tesseract OCR + PyMuPDF
│   ├── main.py                     # FastAPI entry point + CORS
│   ├── Dockerfile                  # Docker config for Render
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Backend environment variables
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **Python** 3.10+ — [Download](https://python.org/)
- **Git** — [Download](https://git-scm.com/)
- **Tesseract OCR**
  - Windows: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)
  - Linux: `sudo apt-get install -y tesseract-ocr`
  - Mac: `brew install tesseract`
- **Supabase Account** — [supabase.com](https://supabase.com)
- **Groq API Key** — [console.groq.com](https://console.groq.com)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd curamind/backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file with your keys (see below)

# 6. Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

✅ Backend running at: `http://localhost:8000`
📖 API Docs at: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd curamind/frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file with your keys (see below)

# 4. Start dev server
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
GROQ_API_KEY=your-groq-api-key-here
```

> ⚠️ Use the **Service Role key** (not anon key) for the backend. It bypasses Row Level Security for admin operations.

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ✅ In production, set `NEXT_PUBLIC_API_URL` to your live Render backend URL.

---

## 🗄 Database Schema

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Users (mirrors Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  processing_status TEXT DEFAULT 'pending',
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📡 API Reference

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/sessions?user_id=` | Get all sessions for a user |
| POST | `/api/chat/sessions?user_id=&title=` | Create a new session |
| DELETE | `/api/chat/sessions/{id}` | Delete session + messages |
| GET | `/api/chat/sessions/{id}/messages` | Get messages in a session |
| POST | `/api/chat/stream` | Stream AI response |
| GET | `/api/chat/profile?user_id=` | Get health profile |
| POST | `/api/chat/profile` | Update health profile |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents/upload` | Upload PDF or image |
| GET | `/api/documents/{id}/status` | Poll processing status |

### Voice
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/voice/transcribe` | Transcribe audio to text |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |

---

## 🚀 Deployment

### Step 1 — Deploy Backend on Render

1. Push code to **GitHub**
2. Go to [Render.com](https://render.com) → **New +** → **Web Service**
3. Select your repository
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
5. Add Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GROQ_API_KEY`
6. Click **Create Web Service**
7. ✅ Copy the backend URL once it's live

### Step 2 — Deploy Frontend on Render

1. Go to [Render.com](https://render.com) → **New +** → **Web Service**
2. Select the same repository
3. Set:
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` → paste backend URL from Step 1
5. Click **Create Web Service**

### Step 3 — Update Supabase Auth URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL:** `https://your-frontend.onrender.com`
3. **Redirect URLs:** Add `https://your-frontend.onrender.com/*`
4. Click **Save**

---

## 🔴 Challenges & Solutions

| # | Challenge | Solution |
|---|---|---|
| 1 | Supabase RLS blocked profile writes from frontend | Created backend `POST /api/chat/profile` using Service Role key |
| 2 | Dashboard not reflecting saved profile data | Created backend `GET /api/chat/profile` to bypass RLS SELECT |
| 3 | Tesseract OCR missing on Render cloud server | Added `apt-get install tesseract-ocr` in Dockerfile |
| 4 | Next.js prerender crash on `/chat` page | Wrapped Sidebar in React `<Suspense>` in layout.tsx |
| 5 | All API calls hardcoded to localhost in production | Replaced with `process.env.NEXT_PUBLIC_API_URL` throughout |
| 6 | TypeScript build errors blocking deployment | Fixed invalid `next.config.ts` options + missing state variable |
| 7 | Auth redirected to localhost after Google OAuth | Updated Supabase Site URL and Redirect URLs whitelist |
| 8 | Document upload spinner stuck forever on error | Added HTTP error detection with proper state reset + alert |

---

## 🔮 Future Scope

- 📱 **Mobile App** — React Native for iOS & Android
- 💊 **Medication Reminders** — AI-powered scheduling and alerts
- 📈 **Health Trends** — Track vitals over time with interactive charts
- 🌐 **Multi-language Support** — Hindi, Tamil, Arabic, Spanish and more
- 👨‍⚕️ **Doctor Connect** — Integrated appointment booking
- 🧬 **Wearable Integration** — Apple Watch, Fitbit, Google Fit sync
- 🔒 **HIPAA Compliance** — Healthcare-grade data encryption
- 🧪 **Smart Lab Report Parser** — Auto-detect abnormal values in blood reports

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git clone https://github.com/your-username/curamind.git
git checkout -b feature/your-feature-name
git commit -m "Add: your feature"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with ❤️ for better healthcare accessibility**

⭐ Star this repo if you found it helpful!

</div>
