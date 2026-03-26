# 🎯 AI Internship Recommendation Engine

> A full-stack AI-powered platform that matches candidates with the most relevant internships using **TF-IDF cosine similarity**, **multi-factor weighted scoring**, **resume parsing**, **skill gap analysis**, and **personalized dashboards**. Built with React, Node.js, MongoDB, and dual AI engines (Google Gemini + OpenAI).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6.svg)
![Node.js](https://img.shields.io/badge/Node.js-20-339933.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248.svg)
![Redis](https://img.shields.io/badge/Redis-7-dc382d.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8.svg)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285f4.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How the AI Recommendation Works](#-how-the-ai-recommendation-works)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Customization](#-customization)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Recommendation Engine (v2.0)
- **TF-IDF Term Weighting** combined with **Cosine Similarity** for high-precision matching
- **Redis Caching** layer for instantaneous recommendation retrieval
- **6-factor scoring**: Skills (40%), Domain (20%), Interest (15%), Location (10%), Experience (10%), Recency (5%)
- **Skill synonym resolution** — "js" matches "JavaScript", "k8s" matches "Kubernetes"
- **Confidence scoring** based on profile completeness and score consistency
- Auto-generated reasoning explaining each recommendation
- **3-tier fallback**: Backend API → Gemini AI (client) → Local scoring engine

### 📄 Resume Parsing
- PDF upload with **section-aware skill extraction** (detects Education, Experience, Skills, Projects sections)
- **250+ skill database** across 13 categories (languages, frontend, backend, cloud, AI/ML, etc.)
- Contact info extraction (email, phone, LinkedIn, GitHub)
- Education detection (B.Tech, M.Tech, Ph.D., etc.)
- Years of experience calculation from date ranges
- Resume completeness scoring
- AI-enhanced extraction with keyword fallback

### 📊 Skill Gap Analysis
- AI-powered gap analysis with **domain-specific skill requirements**
- Rule-based fallback for offline operation (no API key needed)
- **4-phase learning path** from current level to internship-ready
- Portfolio project recommendations with estimated hours
- Industry insights: trending skills, market demand, hiring companies
- Priority ranking: Critical → High → Medium → Low

### 📈 Personalized Dashboard & UX
- **Performance-first UI**: Skeleton loading states and smooth transitions
- **Error Resilience**: React ErrorBoundary and robust error handling
- **Guided Onboarding**: Interactive first-time user walkthrough
- **Global Search**: Paginated and filtered internship discovery
- **Analytics**: Profile completeness, domain distribution, and match trend charts
- **Feedback Loop**: Rate recommendations to improve engine accuracy
- **Resume Hub**: Instant PDF parsing and skill extraction

### 🗄️ Internship Dataset
- **50 real-world internships** from top companies (Google, Microsoft, Netflix, OpenAI, Stripe, etc.)
- **Global coverage**: India, USA, UK, Ireland, Sweden, Canada, Remote
- **12 domains**: AI, Web Dev, Mobile, Data Science, Cloud, DevOps, Cybersecurity, Blockchain, IoT, ML, UI/UX, Game Dev
- Detailed descriptions, required skills, stipends, and durations

### 🏗️ Backend Infrastructure
- **TypeScript Core**: Full type safety across controllers, services, and middleware
- **Adzuna API Integration**: Automated script to fetch and sync real-world internships
- **Redis & BullMQ**: Scalable background processing and caching
- **Health monitoring**: Advanced system diagnostics at `/api/health`
- **Security**: 3-tier rate limiting, JWT auth, and helmet headers
- **Observability**: Winston logging with environment-specific rotation

### 🌐 Additional Features
- **Multi-language support**: English, Hindi (हिन्दी), Tamil (தமிழ்)
- Mobile-first responsive design
- Animated UI with score visualization rings
- Real-time API key testing for Gemini AI

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|----------|
| **React 18 + TS** | UI framework with TypeScript safety |
| **Vite 6** | Modern build tool & HMR dev server |
| **Tailwind CSS 3** | Utility-first responsive styling |
| **Framer Motion** | Advanced animations and transitions |
| **Google Gemini AI** | Client-side fallback matching (2.0 Flash) |
| **Recharts** | Data visualization for student analytics |

### Backend
| Technology | Purpose |
|------------|----------|
| **Node.js 20** | Runtime with ESM and modern JS support |
| **Express + TS** | Core API with `AuthRequest` type safety |
| **MongoDB 7** | Primary NoSQL database with optimized indexes |
| **Redis 7** | High-performance caching and task orchestration |
| **BullMQ** | Reliable background job management |
| **OpenAI GPT-4o** | Advanced resume parsing and skill analysis |
| **Multer + PDF-parse**| Document processing pipeline |

---

## 🧠 How the AI Recommendation Works

The platform uses a **3-tier recommendation system** with automatic failover:

### Tier 1: Backend AI Engine (Primary)

The backend recommendation service uses a sophisticated **TF-IDF cosine similarity** algorithm combined with multi-factor weighted scoring:

```
Final Score = skill(0.40) + domain(0.20) + interest(0.15) + location(0.10) + experience(0.10) + recency(0.05)
```

**Skill Scoring (3-pass composite):**
1. **TF-IDF Cosine Similarity** (50%) — Builds inverse document frequency across all internships, then computes cosine similarity between user skill vector and internship skill vector
2. **Substring Coverage** (30%) — Fuzzy matching for partial skill matches (e.g., "react" matches "react native")
3. **Jaccard Similarity** (20%) — Set intersection over union for exact matches

**Additional Factors:**
- **Synonym Resolution** — Maps aliases: "js" → "javascript", "k8s" → "kubernetes", "ml" → "machine learning"
- **Confidence Scoring** — Weighted combination of profile completeness (40%), score magnitude (30%), and standard deviation (30%)
- **Auto-generated Reasoning** — Explains why each internship was recommended

### Tier 2: Google Gemini AI (Client-side fallback)

When the backend is unavailable, the frontend sends the profile to **Gemini 2.0 Flash** for holistic AI matching with personalized explanations.

### Tier 3: Local Scoring Algorithm (Offline fallback)

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Match | 35% | Keyword comparison against internship requirements |
| Field Alignment | 25% | Maps academic field to industry sectors |
| Sector Preference | 20% | Direct sector match |
| Location Match | 12% | State/city proximity |
| Work Mode | 8% | On-site/Remote/Hybrid preference |

Education level acts as a **multiplier** for qualification matching.

---

## 📁 Project Structure

```
al-internship-recommendation-engine/
├── src/                            # ── FRONTEND (TypeScript) ──
│   ├── components/
│   │   ├── SkeletonCard.tsx        # Loading placeholders
│   │   ├── ErrorBoundary.tsx       # Robust error handling
│   │   ├── OnboardingModal.tsx     # First-time user guide
│   │   ├── RecommendationCard.tsx  # Result card with AI insight
│   │   └── ...
│   ├── pages/                      # Dashboard, HomePage, SkillGapPage
│   ├── services/                   # Gemini AI and API clients
│   └── main.tsx                    # React entry point
│
├── backend/                        # ── BACKEND (TypeScript) ──
│   ├── server.ts                   # Express server entry
│   ├── controllers/                # Request handlers
│   ├── services/                   # Multi-tier recommendation logic
│   ├── models/                     # Mongoose/TypeScript schemas
│   ├── middleware/                 # AuthRequest and validation logic
│   ├── types/                      # Shared TS interfaces
│   ├── queues/                     # BullMQ worker configurations
│   ├── config/                     # Redis and Database config
│   └── scripts/                    # fetchInternships.js (Adzuna)
│
├── docker-compose.yml              # Full-stack orchestration
├── Dockerfile                      # Frontend production build
└── .env.example                    # Configuration template
```

---

## 🚀 Getting Started

### 🐳 Quick Start with Docker

The easiest way to get the full stack running (Frontend, Backend, MongoDB, Redis) is using Docker Compose.

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### Spin up the application
1. Clone the repository (if you haven't already).
2. Configure your `.env` files (see [Backend Setup](#1-backend-setup) for details).
3. Run the following command in the root directory:
   ```bash
   docker compose up --build
   ```
4. Access the application:
   - **Frontend:** http://localhost:80
   - **Backend API:** http://localhost:5000/api
   - **Health Check:** http://localhost:5000/api/health

#### Production Deployment
To run with production overrides (restart policies, etc.):
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Local Development Setup

### Prerequisites

- **Node.js** v16+ — [Download](https://nodejs.org/)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- **Google Gemini API Key** (free) — [Get it here](https://aistudio.google.com/apikey)
- **OpenAI API Key** (optional, for backend AI) — [Get it here](https://platform.openai.com/api-keys)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/al-internship-recommendation-engine.git
cd al-internship-recommendation-engine

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend** — create `.env` in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:5000/api
```

**Backend** — create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/internship-recommendation
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
PORT=5000
NODE_ENV=development
```

> **Note:** The app works without API keys — it falls back to rule-based algorithms. AI features are optional but recommended.

### 3. Initialize Data & Integration

```bash
cd backend
# Seed initial 50 internships
npm run seed

# Optional: Fetch real-time internships from Adzuna
node scripts/fetchInternships.js
```

This loads **50 internships** from `sampleInternships.json` into MongoDB.

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Verify Setup

- **Health check**: `GET http://localhost:5000/api/health`
- **API docs**: `GET http://localhost:5000/api/docs`
- **Frontend**: Navigate to http://localhost:5173

### Build for Production

```bash
npm run build     # Frontend → dist/
```

---

## 🌐 Deployment

This is a full-stack application requiring **3 services** to deploy:

| Service | Platform | Cost |
|---------|----------|------|
| **Database** | MongoDB Atlas | Free (M0 tier) |
| **Backend** | Render / Railway | Free tier available |
| **Frontend** | Netlify | Free tier available |

> **📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step deployment guide** covering MongoDB Atlas setup, Render/Railway backend deployment, and Netlify frontend deployment.

### Quick Deployment Summary

1. **MongoDB Atlas** — Create free M0 cluster → Get connection string
2. **Backend on Render** — Connect GitHub repo → Set env vars → Deploy
3. **Frontend on Netlify** — Connect GitHub repo → Set `VITE_BACKEND_URL` → Deploy

Total cost: **$0/month** using free tiers.

---

## � API Documentation

The backend exposes an interactive API documentation endpoint:

```
GET /api/docs    → Full API documentation (JSON)
GET /api/health  → Server health + DB status
```

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/login` | No | JWT login |
| GET | `/api/internships` | No | List internships (paginated/filtered) |
| POST | `/api/recommendations` | Yes | Get AI recommendations (v2.0) |
| POST | `/api/resume/upload` | Yes | Upload & parse resume PDF |
| GET | `/api/skill-gap/analyze` | Yes | Skill gap analysis |
| GET | `/api/dashboard` | Yes | Dashboard analytics & trends |
| POST | `/api/dashboard/save` | Yes | Save recommendation |
| POST | `/api/dashboard/feedback`| Yes | Submit recommendation feedback |

> See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for the complete API reference.

---

## ⚙️ Customization

### Adding Internships

**Backend (database):** Add entries to `backend/data/sampleInternships.json` and run `npm run seed`.

**Frontend (client-side):** Edit `src/data/internships.js` following the existing format.

### Tuning Recommendation Weights

**Backend** — Edit `backend/services/recommendationService.ts`:
```typescript
const WEIGHTS: ScoringWeights = {
  skill: 0.40, domain: 0.20, interest: 0.15,
  location: 0.10, experience: 0.10, recency: 0.05
};
```

**Frontend fallback** — Edit `src/engine/recommendationEngine.js`:
```javascript
const WEIGHTS = {
  skills: 0.35, field: 0.25, sector: 0.20,
  location: 0.12, mode: 0.08
};
```

### Adding Skill Synonyms

Edit `SKILL_SYNONYMS` in `backend/services/recommendationService.ts`:
```typescript
const SKILL_SYNONYMS: Record<string, string> = {
  js: 'javascript', ts: 'typescript', k8s: 'kubernetes', ...
};
```

### Adding Domain Skill Requirements

Edit `DOMAIN_REQUIREMENTS` in `backend/services/skillGapService.ts` to add new domains or update skill tiers (core → intermediate → advanced).

### Adding Languages

1. Add a language object in `src/data/translations.js`
2. Add it to the `languages` array in `src/components/Header.jsx`

---

## 🔒 Security

- **JWT Authentication** — Stateless auth with httpOnly-friendly tokens
- **Rate Limiting** — 3-tier: General (100/15min), Auth (20/15min), AI (10/15min)
- **Helmet** — Security headers (XSS, clickjacking, MIME sniffing protection)
- **Input Validation** — express-validator on all endpoints
- **CORS** — Configurable origin whitelist
- **Error Sanitization** — Stack traces hidden in production
- **Frontend API Key** — The Gemini key (`VITE_` prefix) is exposed client-side. For production, restrict it via Google AI Studio HTTP referrer settings. Backend AI keys (OpenAI) are server-side only.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Made with ❤️ | Full-Stack AI Portfolio Project
</p>
