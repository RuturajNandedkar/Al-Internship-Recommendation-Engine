# AI Internship Recommendation Engine — Backend

REST API backend built with **Node.js**, **Express.js**, **MongoDB** (Mongoose), and **OpenAI GPT-3.5 Turbo**.

## Folder Structure

```
backend/
├── config/
│   └── db.js                        # MongoDB connection setup
├── controllers/
│   ├── authController.js            # Register/Login/JWT handlers
│   ├── profileController.js         # Profile CRUD handlers
│   ├── recommendationController.js  # Recommendation generation handlers
│   ├── aiRecommendationController.js # AI-enhanced recommendation handlers
│   ├── internshipController.js      # Internship CRUD & bookmark handlers
│   ├── resumeController.js          # Resume upload & parsing handlers
│   ├── dashboardController.js       # Dashboard analytics handlers
│   └── skillGapController.js        # Skill gap analysis handlers
├── middleware/
│   ├── auth.js                      # JWT verification middleware
│   ├── errorHandler.js              # Global error handler
│   ├── validateRequest.js           # Input validation rules
│   └── asyncHandler.js              # Async error wrapper
├── models/
│   ├── User.js                      # User account schema
│   ├── Profile.js                   # User profile schema
│   ├── Internship.js                # Internship opportunity schema
│   ├── RecommendationHistory.js     # Recommendation history schema
│   └── SavedRecommendation.js       # Bookmarked recommendation schema
├── routes/
│   ├── authRoutes.js                # /api/auth
│   ├── profileRoutes.js             # /api/profiles
│   ├── recommendationRoutes.js      # /api/recommendations
│   ├── aiRecommendationRoutes.js    # /api/ai-recommendation
│   ├── internshipRoutes.js          # /api/internships
│   ├── resumeRoutes.js              # /api/resume
│   ├── dashboardRoutes.js           # /api/dashboard
│   └── skillGapRoutes.js            # /api/skill-gap
├── services/
│   ├── recommendationService.js     # TF-IDF + cosine similarity engine
│   ├── openaiService.js             # OpenAI GPT integration
│   ├── resumeService.js             # PDF parsing + skill extraction
│   └── skillGapService.js           # AI + rule-based gap analysis
├── data/
│   └── sampleInternships.json       # 50 seed internships
├── utils/
│   ├── AppError.js                  # Custom error class
│   ├── logger.js                    # Winston logger
│   └── seedData.js                  # Database seed script
├── logs/                            # Winston log files
├── .env                             # Environment variables (git-ignored)
├── .env.example                     # Template for .env
├── .gitignore
├── package.json
├── server.js                        # App entry point
├── API_DOCUMENTATION.md             # Full API reference
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** v16+
- **MongoDB** running locally or a MongoDB Atlas URI
- **OpenAI API Key** (optional, for AI-powered resume parsing & skill gap analysis)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your variables:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/internship-engine
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:5173
```

> **Note:** The app works without `OPENAI_API_KEY` — AI features fall back to rule-based algorithms.

### 3. Seed the database

Populate the internships collection with the **50 built-in internship opportunities**:

```bash
npm run seed
```

### 4. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The server starts at **http://localhost:5000**.

---

## API Endpoints

### Health & Docs

| Method | Endpoint       | Auth | Description                          |
|--------|----------------|------|--------------------------------------|
| GET    | `/api/health`  | No   | Server status, DB state, memory      |
| GET    | `/api/docs`    | No   | Interactive API documentation (JSON) |

### Auth

| Method | Endpoint             | Auth | Description      |
|--------|----------------------|------|------------------|
| POST   | `/api/auth/register` | No   | User registration|
| POST   | `/api/auth/login`    | No   | JWT login        |

### Profiles

| Method | Endpoint            | Auth | Description             |
|--------|---------------------|------|-------------------------|
| POST   | `/api/profiles`     | Yes  | Create a new profile    |
| GET    | `/api/profiles`     | Yes  | Get all profiles        |
| GET    | `/api/profiles/:id` | Yes  | Get profile by ID       |

### Recommendations

| Method | Endpoint                   | Auth | Description                                 |
|--------|----------------------------|------|---------------------------------------------|
| POST   | `/api/recommendations`     | Yes  | Submit profile & get recommendations        |
| GET    | `/api/recommendations/:id` | Yes  | Get recommendations for an existing profile |

### AI Recommendations

| Method | Endpoint              | Auth | Description                          |
|--------|-----------------------|------|--------------------------------------|
| POST   | `/api/ai-recommendation` | Yes | AI-enhanced recommendation matching |

### Internships

| Method | Endpoint                        | Auth | Description                              |
|--------|---------------------------------|------|------------------------------------------|
| GET    | `/api/internships`              | No   | List internships (paginated)             |
| GET    | `/api/internships/:id`          | No   | Get single internship                    |
| POST   | `/api/internships/save`         | Yes  | Save/bookmark a recommendation           |
| GET    | `/api/internships/saved/:id`    | Yes  | Get saved recommendations for a profile  |
| DELETE | `/api/internships/saved/:id`    | Yes  | Delete a saved recommendation            |

### Resume

| Method | Endpoint              | Auth | Description                 |
|--------|-----------------------|------|-----------------------------|
| POST   | `/api/resume/upload`  | Yes  | Upload & parse resume PDF   |

### Skill Gap Analysis

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/api/skill-gap/analyze` | Yes | AI-powered skill gap analysis |

### Dashboard

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/api/dashboard`      | Yes  | Dashboard analytics      |
| POST   | `/api/dashboard/save` | Yes  | Save recommendation      |

> See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the complete API reference with request/response examples.

---

## Security

- **JWT Authentication** — Stateless auth with Bearer tokens
- **3-tier Rate Limiting** — General (100/15min), Auth (20/15min), AI (10/15min)
- **Helmet** — Security headers (XSS, clickjacking, MIME sniffing protection)
- **Input Validation** — express-validator on all endpoints
- **CORS** — Configurable origin whitelist
- **Error Sanitization** — Stack traces hidden in production

---

## Running Both Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.
