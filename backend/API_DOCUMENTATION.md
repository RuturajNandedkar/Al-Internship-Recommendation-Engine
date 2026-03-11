# AI Internship Recommendation Engine — API Documentation

> **Base URL:** `http://localhost:5000/api`
> **Content-Type:** `application/json` (unless otherwise specified)
> **Authentication:** Bearer Token (JWT) via `Authorization` header

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Auth](#auth)
   - [Profiles](#profiles)
   - [Recommendations](#recommendations)
   - [Internships](#internships)
   - [AI Recommendations](#ai-recommendations)
   - [Skill Gap Analysis](#skill-gap-analysis)
   - [Resume](#resume)
   - [Dashboard](#dashboard)
6. [Data Models](#data-models)

---

## Overview

The AI Internship Recommendation Engine API provides intelligent internship matching based on user skills, interests, and experience. It combines algorithmic scoring with OpenAI-powered analysis to deliver personalized internship recommendations, skill gap assessments, and resume parsing.

### Key Features

| Feature                  | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| Algorithmic Matching     | Weighted scoring across skills, domain, interests, & experience |
| AI Recommendations       | GPT-powered role & company suggestions                          |
| Skill Gap Analysis       | AI-driven learning path and readiness assessment                |
| Resume Parsing           | PDF upload with keyword + AI extraction                         |
| Dashboard & History      | Track searches, saved internships, and recommendation history   |

---

## Authentication

Protected endpoints require a JSON Web Token (JWT) obtained via `/api/auth/signup` or `/api/auth/login`.

**Include the token in the `Authorization` header:**

```
Authorization: Bearer <token>
```

Tokens expire after **7 days** (configurable via `JWT_EXPIRE` env variable).

| Auth Type        | Description                                             |
| ---------------- | ------------------------------------------------------- |
| **Required**     | Returns `401 Unauthorized` if token is missing/invalid  |
| **Optional**     | Enhances response if token is present; works without it |
| **None**         | No authentication needed                                |

---

## Rate Limiting

All responses include standard rate limit headers (`RateLimit-Policy`, `RateLimit-Remaining`, etc.).

| Tier         | Window     | Max Requests | Applied To                                        |
| ------------ | ---------- | ------------ | ------------------------------------------------- |
| **General**  | 15 minutes | 100          | All `/api/*` endpoints                            |
| **Auth**     | 15 minutes | 20           | `/api/auth/*`                                     |
| **AI**       | 15 minutes | 10           | `/api/ai-recommendation`, `/api/skill-gap`, `/api/resume` |

**Rate Limit Exceeded Response:**

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

**Status Code:** `429 Too Many Requests`

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

In **development mode**, a `stack` field is also included for debugging.

### Standard Error Codes

| Status | Meaning                | Common Cause                                      |
| ------ | ---------------------- | ------------------------------------------------- |
| `400`  | Bad Request            | Validation failure, malformed JSON, invalid ObjectId |
| `401`  | Unauthorized           | Missing/expired/invalid JWT, invalid API key      |
| `403`  | Forbidden              | Insufficient role permissions                     |
| `404`  | Not Found              | Resource does not exist, unknown route             |
| `409`  | Conflict               | Duplicate resource (e.g., duplicate save)          |
| `429`  | Too Many Requests      | Rate limit exceeded                               |
| `500`  | Internal Server Error  | Unexpected server failure                         |

---

## Endpoints

---

### Health Check

#### `GET /api/health`

Returns the server status. No authentication required.

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Server is running",
  "environment": "development",
  "timestamp": "2026-03-11T10:30:00.000Z"
}
```

---

### Auth

#### `POST /api/auth/signup`

Register a new user account.

**Auth:** None

**Request Body:**

| Field      | Type   | Required | Constraints                                      |
| ---------- | ------ | -------- | ------------------------------------------------ |
| `name`     | string | Yes      | Max 100 characters                               |
| `email`    | string | Yes      | Valid email format                                |
| `password` | string | Yes      | Min 8 chars, must contain uppercase, lowercase & digit |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "password": "SecurePass1"
  }'
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "660a1b2c3d4e5f6789abcdef",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "role": "user",
      "profile": "660a1b2c3d4e5f6789abc000",
      "createdAt": "2026-03-11T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

| Status | Message                          |
| ------ | -------------------------------- |
| `400`  | `"Validation error: ..."`        |
| `409`  | `"Email already registered"`     |

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Auth:** None

**Request Body:**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "SecurePass1"
  }'
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "660a1b2c3d4e5f6789abcdef",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "role": "user",
      "lastLogin": "2026-03-11T10:15:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

| Status | Message                        |
| ------ | ------------------------------ |
| `401`  | `"Invalid email or password"`  |

---

#### `GET /api/auth/me`

Get the authenticated user's profile.

**Auth:** Required

**Example Request:**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "_id": "660a1b2c3d4e5f6789abcdef",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "role": "user",
    "profile": {
      "_id": "660a1b2c3d4e5f6789abc000",
      "skills": ["Python", "React", "SQL"],
      "interests": ["AI", "Web Development"],
      "preferred_domain": "AI",
      "experience_level": "intermediate",
      "location": "Bangalore, India"
    },
    "resumeText": "",
    "resumeFileName": "",
    "lastLogin": "2026-03-11T10:15:00.000Z"
  }
}
```

---

#### `PUT /api/auth/me`

Update the authenticated user's account details.

**Auth:** Required

**Request Body:**

| Field  | Type   | Required | Constraints        |
| ------ | ------ | -------- | ------------------ |
| `name` | string | No       | Max 100 characters |
| `email`| string | No       | Valid email format  |

**Example Request:**

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya S."
  }'
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "660a1b2c3d4e5f6789abcdef",
    "name": "Priya S.",
    "email": "priya@example.com",
    "role": "user"
  }
}
```

---

### Profiles

#### `POST /api/profiles`

Create a new candidate profile.

**Auth:** None

**Request Body:**

| Field              | Type     | Required | Constraints                                             |
| ------------------ | -------- | -------- | ------------------------------------------------------- |
| `skills`           | string[] | Yes      | Min 1 item, each non-empty string                       |
| `interests`        | string[] | No       | Array of interest areas                                 |
| `preferred_domain` | string   | No       | Default: `"all"`                                        |
| `experience_level` | string   | Yes      | One of: `"beginner"`, `"intermediate"`, `"advanced"`    |
| `location`         | string   | No       | Preferred location                                      |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "TensorFlow", "Deep Learning"],
    "interests": ["AI", "Machine Learning"],
    "preferred_domain": "AI",
    "experience_level": "intermediate",
    "location": "Bangalore, India"
  }'
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "_id": "660b2c3d4e5f6789abcdef01",
    "skills": ["Python", "TensorFlow", "Deep Learning"],
    "interests": ["AI", "Machine Learning"],
    "preferred_domain": "AI",
    "experience_level": "intermediate",
    "location": "Bangalore, India",
    "createdAt": "2026-03-11T10:00:00.000Z",
    "updatedAt": "2026-03-11T10:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message                                                          |
| ------ | ---------------------------------------------------------------- |
| `400`  | `"skills must be an array with at least one skill"`              |
| `400`  | `"experience_level is required and must be beginner, intermediate, or advanced"` |

---

#### `GET /api/profiles`

Retrieve all profiles.

**Auth:** None

**Response `200 OK`:**

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "660b2c3d4e5f6789abcdef01",
      "skills": ["Python", "TensorFlow", "Deep Learning"],
      "interests": ["AI", "Machine Learning"],
      "preferred_domain": "AI",
      "experience_level": "intermediate",
      "location": "Bangalore, India"
    }
  ]
}
```

---

#### `GET /api/profiles/:id`

Retrieve a single profile by ID.

**Auth:** None

**Path Parameters:**

| Param | Type     | Description          |
| ----- | -------- | -------------------- |
| `id`  | ObjectId | Profile document ID  |

**Example Request:**

```bash
curl http://localhost:5000/api/profiles/660b2c3d4e5f6789abcdef01
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "_id": "660b2c3d4e5f6789abcdef01",
    "skills": ["Python", "TensorFlow", "Deep Learning"],
    "interests": ["AI", "Machine Learning"],
    "preferred_domain": "AI",
    "experience_level": "intermediate",
    "location": "Bangalore, India"
  }
}
```

**Errors:**

| Status | Message                         |
| ------ | ------------------------------- |
| `400`  | `"Invalid ID format"`           |
| `404`  | `"Profile not found"`           |

---

### Recommendations

#### `POST /api/recommendations`

Generate internship recommendations based on a candidate profile.

**Auth:** Optional (if authenticated, saves to recommendation history)

**Request Body:**

| Field              | Type     | Required | Constraints                                          |
| ------------------ | -------- | -------- | ---------------------------------------------------- |
| `skills`           | string[] | Yes      | Min 1 item                                           |
| `interests`        | string[] | No       | Interest areas for scoring                           |
| `preferred_domain` | string   | No       | Target domain for matching                           |
| `experience_level` | string   | Yes      | `"beginner"`, `"intermediate"`, or `"advanced"`      |
| `location`         | string   | No       | Preferred location                                   |

**Scoring Algorithm:**

```
score = (0.50 × skill_match) + (0.25 × domain_match) + (0.25 × interest_match) + experience_bonus
```

- **Skill Match:** 70% substring matching + 30% Jaccard token similarity
- **Domain Match:** Exact (1.0), related (0.5), or none (0.0)
- **Interest Match:** Jaccard similarity between interests and internship text
- **Experience Bonus:** 0.02–0.08 based on experience level and skill count

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "skills": ["Python", "TensorFlow", "Deep Learning", "Linear Algebra"],
    "interests": ["AI", "Research"],
    "preferred_domain": "AI",
    "experience_level": "intermediate",
    "location": "Bangalore, India"
  }'
```

**Response `200 OK`:**

```json
{
  "success": true,
  "profileId": "660b2c3d4e5f6789abcdef01",
  "count": 5,
  "data": [
    {
      "internship": {
        "_id": "660c3d4e5f6789abcdef0001",
        "title": "AI Research Intern",
        "company": "Google DeepMind",
        "location": "Bangalore, India",
        "domain": "AI",
        "required_skills": ["Python", "TensorFlow", "Deep Learning", "Linear Algebra", "Research"],
        "stipend": "₹80,000/month",
        "duration": "6 months",
        "application_link": "https://deepmind.google/careers",
        "description": "Work alongside world-class researchers on cutting-edge AI models..."
      },
      "score": 92,
      "breakdown": {
        "skills": 48,
        "field": 25,
        "sector": 0,
        "location": 0,
        "mode": 0
      },
      "reasoning": "Strong skill match (96%) for AI Research Intern at Google DeepMind. Excellent domain alignment with AI..."
    },
    {
      "internship": {
        "_id": "660c3d4e5f6789abcdef0006",
        "title": "Machine Learning Intern",
        "company": "Microsoft Research India",
        "location": "Bangalore, India",
        "domain": "Machine Learning",
        "required_skills": ["Python", "PyTorch", "NLP", "Statistics", "Git"],
        "stipend": "₹70,000/month",
        "duration": "6 months",
        "application_link": "https://www.microsoft.com/en-us/research/careers",
        "description": "..."
      },
      "score": 78,
      "breakdown": {
        "skills": 35,
        "field": 12,
        "sector": 0,
        "location": 0,
        "mode": 0
      },
      "reasoning": "Good skill overlap for Machine Learning Intern..."
    }
  ]
}
```

---

#### `GET /api/recommendations/:id`

Get recommendations for an existing profile.

**Auth:** None

**Path Parameters:**

| Param | Type     | Description         |
| ----- | -------- | ------------------- |
| `id`  | ObjectId | Profile document ID |

**Example Request:**

```bash
curl http://localhost:5000/api/recommendations/660b2c3d4e5f6789abcdef01
```

**Response `200 OK`:** Same format as `POST /api/recommendations`.

**Errors:**

| Status | Message                |
| ------ | ---------------------- |
| `400`  | `"Invalid ID format"`  |
| `404`  | `"Profile not found"`  |

---

### Internships

#### `GET /api/internships`

Retrieve all internships in the database.

**Auth:** None

**Example Request:**

```bash
curl http://localhost:5000/api/internships
```

**Response `200 OK`:**

```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "_id": "660c3d4e5f6789abcdef0001",
      "title": "AI Research Intern",
      "company": "Google DeepMind",
      "location": "Bangalore, India",
      "domain": "AI",
      "required_skills": ["Python", "TensorFlow", "Deep Learning", "Linear Algebra", "Research"],
      "stipend": "₹80,000/month",
      "duration": "6 months",
      "application_link": "https://deepmind.google/careers",
      "description": "Work alongside world-class researchers on cutting-edge AI models..."
    }
  ]
}
```

---

#### `GET /api/internships/:id`

Retrieve a single internship by ID.

**Auth:** None

**Path Parameters:**

| Param | Type     | Description             |
| ----- | -------- | ----------------------- |
| `id`  | ObjectId | Internship document ID  |

**Example Request:**

```bash
curl http://localhost:5000/api/internships/660c3d4e5f6789abcdef0001
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "_id": "660c3d4e5f6789abcdef0001",
    "title": "AI Research Intern",
    "company": "Google DeepMind",
    "location": "Bangalore, India",
    "domain": "AI",
    "required_skills": ["Python", "TensorFlow", "Deep Learning", "Linear Algebra", "Research"],
    "stipend": "₹80,000/month",
    "duration": "6 months",
    "application_link": "https://deepmind.google/careers",
    "description": "Work alongside world-class researchers on cutting-edge AI models..."
  }
}
```

**Errors:**

| Status | Message                     |
| ------ | --------------------------- |
| `400`  | `"Invalid ID format"`       |
| `404`  | `"Internship not found"`    |

---

#### `POST /api/internships/save`

Save an internship recommendation for a profile.

**Auth:** None

**Request Body:**

| Field          | Type     | Required | Constraints                   |
| -------------- | -------- | -------- | ----------------------------- |
| `profileId`    | ObjectId | Yes      | Valid MongoDB ObjectId        |
| `internshipId` | ObjectId | Yes      | Valid MongoDB ObjectId        |
| `score`        | number   | Yes      | Integer between 0 and 100     |
| `breakdown`    | object   | No       | Score breakdown object        |
| `reasoning`    | string   | No       | Match reasoning text          |

**`breakdown` Object Schema:**

| Field      | Type   | Default |
| ---------- | ------ | ------- |
| `skills`   | number | 0       |
| `field`    | number | 0       |
| `sector`   | number | 0       |
| `location` | number | 0       |
| `mode`     | number | 0       |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/internships/save \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "660b2c3d4e5f6789abcdef01",
    "internshipId": "660c3d4e5f6789abcdef0001",
    "score": 92,
    "breakdown": {
      "skills": 48,
      "field": 25,
      "sector": 0,
      "location": 0,
      "mode": 0
    },
    "reasoning": "Strong skill match for AI Research Intern at Google DeepMind."
  }'
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Recommendation saved successfully",
  "data": {
    "_id": "660d4e5f6789abcdef012345",
    "profileId": "660b2c3d4e5f6789abcdef01",
    "internshipId": "660c3d4e5f6789abcdef0001",
    "score": 92,
    "breakdown": {
      "skills": 48,
      "field": 25,
      "sector": 0,
      "location": 0,
      "mode": 0
    },
    "reasoning": "Strong skill match for AI Research Intern at Google DeepMind.",
    "createdAt": "2026-03-11T10:30:00.000Z"
  }
}
```

**Errors:**

| Status | Message                                    |
| ------ | ------------------------------------------ |
| `400`  | `"profileId must be a valid ObjectId"`     |
| `400`  | `"score is required and must be 0-100"`    |
| `409`  | `"Recommendation already saved"`           |

---

#### `GET /api/internships/saved/:id`

Get all saved recommendations for a profile.

**Auth:** None

**Path Parameters:**

| Param | Type     | Description         |
| ----- | -------- | ------------------- |
| `id`  | ObjectId | Profile document ID |

**Example Request:**

```bash
curl http://localhost:5000/api/internships/saved/660b2c3d4e5f6789abcdef01
```

**Response `200 OK`:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "660d4e5f6789abcdef012345",
      "profileId": "660b2c3d4e5f6789abcdef01",
      "internshipId": {
        "_id": "660c3d4e5f6789abcdef0001",
        "title": "AI Research Intern",
        "company": "Google DeepMind",
        "location": "Bangalore, India",
        "domain": "AI",
        "required_skills": ["Python", "TensorFlow", "Deep Learning", "Linear Algebra", "Research"],
        "stipend": "₹80,000/month",
        "duration": "6 months"
      },
      "score": 92,
      "breakdown": { "skills": 48, "field": 25, "sector": 0, "location": 0, "mode": 0 },
      "reasoning": "Strong skill match for AI Research Intern at Google DeepMind."
    }
  ]
}
```

---

#### `DELETE /api/internships/saved/:id`

Delete a saved recommendation.

**Auth:** None

**Path Parameters:**

| Param | Type     | Description                  |
| ----- | -------- | ---------------------------- |
| `id`  | ObjectId | SavedRecommendation document ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/internships/saved/660d4e5f6789abcdef012345
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Saved recommendation removed"
}
```

**Errors:**

| Status | Message                             |
| ------ | ----------------------------------- |
| `400`  | `"Invalid ID format"`               |
| `404`  | `"Saved recommendation not found"`  |

---

### AI Recommendations

#### `POST /api/ai-recommendation`

Get AI-powered role suggestions, company recommendations, and skill gap insights using OpenAI GPT.

**Auth:** None
**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field        | Type     | Required | Constraints                                          |
| ------------ | -------- | -------- | ---------------------------------------------------- |
| `skills`     | string[] | Yes      | Min 1 item                                           |
| `interests`  | string[] | No       | Interest areas                                       |
| `experience` | string   | Yes      | `"Beginner"`, `"Intermediate"`, or `"Advanced"`      |

> **Note:** Requires a valid OpenAI API key configured in the `OPENAI_API_KEY` environment variable.

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/ai-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "TensorFlow", "Deep Learning"],
    "interests": ["AI", "Research"],
    "experience": "Intermediate"
  }'
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "top_roles": [
      "Machine Learning Engineer Intern",
      "AI Research Intern",
      "Data Scientist Intern",
      "Computer Vision Intern",
      "NLP Engineer Intern"
    ],
    "suggested_companies": [
      "Google DeepMind",
      "Microsoft Research",
      "OpenAI",
      "Meta AI",
      "NVIDIA"
    ],
    "skill_gaps": [
      "PyTorch — widely used alongside TensorFlow for research prototyping",
      "MLOps — crucial for deploying models to production",
      "Statistics & Probability — foundational for ML theory"
    ]
  }
}
```

**Errors:**

| Status | Message                                         |
| ------ | ----------------------------------------------- |
| `400`  | `"skills must be an array with at least one skill"` |
| `400`  | `"experience is required"`                      |
| `401`  | `"Invalid OpenAI API key"`                      |
| `429`  | `"AI rate limit reached. Please try again later."` |

---

### Skill Gap Analysis

#### `POST /api/skill-gap`

Get a comprehensive AI-powered skill gap analysis with learning paths and project recommendations.

**Auth:** Optional (if authenticated, saves skill gaps to latest recommendation history)
**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field              | Type     | Required | Constraints                                      |
| ------------------ | -------- | -------- | ------------------------------------------------ |
| `skills`           | string[] | Yes      | Min 1 item                                       |
| `interests`        | string[] | No       | Interest areas                                   |
| `preferred_domain` | string   | No       | Target domain                                    |
| `experience_level` | string   | No       | `"beginner"`, `"intermediate"`, or `"advanced"`  |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/skill-gap \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "SQL", "Pandas"],
    "interests": ["Data Science", "Machine Learning"],
    "preferred_domain": "Data Science",
    "experience_level": "beginner"
  }'
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "summary": "You have a solid foundation in data manipulation with Python, SQL, and Pandas. To become competitive for Data Science internships, focus on building statistical knowledge and machine learning skills.",
    "readiness_score": 45,
    "current_strengths": [
      "Python programming",
      "Data manipulation with Pandas",
      "SQL database querying"
    ],
    "skill_gaps": [
      {
        "skill": "Machine Learning Fundamentals",
        "importance": "High",
        "reason": "Core requirement for Data Science roles",
        "resources": [
          "Andrew Ng's Machine Learning course on Coursera",
          "Hands-On ML with Scikit-Learn (book)"
        ]
      },
      {
        "skill": "Data Visualization",
        "importance": "Medium",
        "reason": "Essential for communicating insights to stakeholders",
        "resources": [
          "Matplotlib & Seaborn documentation",
          "Storytelling with Data (book)"
        ]
      },
      {
        "skill": "Statistics & Probability",
        "importance": "High",
        "reason": "Foundational knowledge for hypothesis testing and model evaluation",
        "resources": [
          "Khan Academy Statistics",
          "Think Stats by Allen Downey"
        ]
      }
    ],
    "learning_path": [
      {
        "phase": "Phase 1: Foundations (Weeks 1–4)",
        "focus": "Statistics, probability, and data visualization",
        "milestones": ["Complete a statistics course", "Build 3 data visualizations"]
      },
      {
        "phase": "Phase 2: Core ML (Weeks 5–10)",
        "focus": "Supervised & unsupervised learning algorithms",
        "milestones": ["Implement 5 ML algorithms from scratch", "Complete a Kaggle competition"]
      },
      {
        "phase": "Phase 3: Specialization (Weeks 11–14)",
        "focus": "Deep learning and NLP fundamentals",
        "milestones": ["Build a neural network project", "Deploy a model via API"]
      }
    ],
    "recommended_projects": [
      "Exploratory Data Analysis on a real-world dataset (e.g., Titanic, Housing Prices)",
      "Build a movie recommendation system using collaborative filtering",
      "Customer churn prediction model with end-to-end pipeline",
      "Sentiment analysis on Twitter data using NLP techniques"
    ]
  }
}
```

---

### Resume

#### `POST /api/resume/upload`

Upload a PDF resume for automatic skill extraction and internship recommendations.

**Auth:** Required
**Rate Limit:** 10 requests / 15 minutes
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field    | Type | Required | Constraints        |
| -------- | ---- | -------- | ------------------ |
| `resume` | file | Yes      | PDF format, ≤ 5 MB |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.pdf"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "extractedProfile": {
      "skills": ["Python", "JavaScript", "React", "Node.js", "SQL", "Git"],
      "interests": ["Web Development", "AI"],
      "experience_level": "intermediate",
      "preferred_domain": "Web Development"
    },
    "recommendations": [
      {
        "internship": {
          "_id": "660c3d4e5f6789abcdef0002",
          "title": "Full Stack Web Developer Intern",
          "company": "Flipkart",
          "domain": "Web Development",
          "required_skills": ["React", "Node.js", "MongoDB", "REST APIs", "JavaScript"],
          "stipend": "₹40,000/month",
          "duration": "3 months"
        },
        "score": 85,
        "reasoning": "Excellent match for Full Stack Web Developer Intern..."
      }
    ],
    "fileName": "resume.pdf"
  }
}
```

**Errors:**

| Status | Message                                  |
| ------ | ---------------------------------------- |
| `400`  | `"Please upload a PDF file"`             |
| `400`  | `"Could not extract text from PDF"`      |
| `401`  | `"Not authorized, no token"`             |

---

#### `POST /api/resume/analyze`

Upload a PDF resume for AI-powered analysis, extraction, and recommendations.

**Auth:** Required
**Rate Limit:** 10 requests / 15 minutes
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field    | Type | Required | Constraints        |
| -------- | ---- | -------- | ------------------ |
| `resume` | file | Yes      | PDF format, ≤ 5 MB |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.pdf"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "extractedProfile": {
      "skills": ["Python", "JavaScript", "React", "Node.js", "SQL", "Git", "Docker"],
      "interests": ["Web Development", "Cloud"],
      "experience_level": "intermediate",
      "preferred_domain": "Web Development",
      "education": "B.Tech Computer Science",
      "years_of_experience": 1
    },
    "analysis": {
      "summary": "A well-structured resume showcasing strong full-stack development skills with hands-on project experience.",
      "strengths": [
        "Clear project descriptions with measurable outcomes",
        "Diverse technical skill set covering frontend and backend",
        "Relevant internship experience"
      ],
      "weaknesses": [
        "Missing quantifiable metrics in work experience",
        "No mention of open-source contributions",
        "Limited demonstration of leadership or teamwork"
      ],
      "resume_score": 72,
      "recommendations": [
        "Add metrics to project descriptions (e.g., '40% faster load time')",
        "Include links to GitHub or portfolio",
        "Add a brief professional summary at the top"
      ],
      "suitable_roles": [
        "Full Stack Developer Intern",
        "Frontend Engineer Intern",
        "Software Engineer Intern"
      ],
      "missing_skills": [
        "TypeScript",
        "CI/CD pipelines",
        "Testing frameworks"
      ]
    },
    "recommendations": [
      {
        "internship": { "..." : "..." },
        "score": 85,
        "reasoning": "..."
      }
    ],
    "fileName": "resume.pdf"
  }
}
```

**Errors:**

| Status | Message                                    |
| ------ | ------------------------------------------ |
| `400`  | `"Please upload a PDF file"`               |
| `400`  | `"Could not extract text from PDF"`        |
| `401`  | `"Not authorized, no token"`               |

---

### Dashboard

#### `GET /api/dashboard`

Get the authenticated user's dashboard overview with stats, recent activity, and saved internships.

**Auth:** Required

**Example Request:**

```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSearches": 15,
      "savedInternships": 4,
      "profileComplete": true
    },
    "recentSearches": [
      {
        "_id": "660e5f6789abcdef01234567",
        "source": "backend",
        "profileSnapshot": {
          "skills": ["Python", "TensorFlow"],
          "preferred_domain": "AI",
          "experience_level": "intermediate"
        },
        "recommendations": [
          {
            "title": "AI Research Intern",
            "company": "Google DeepMind",
            "score": 92
          }
        ],
        "createdAt": "2026-03-11T09:00:00.000Z"
      }
    ],
    "savedInternships": [
      {
        "_id": "660d4e5f6789abcdef012345",
        "internshipId": {
          "title": "AI Research Intern",
          "company": "Google DeepMind",
          "domain": "AI"
        },
        "score": 92
      }
    ],
    "topSkills": ["Python", "TensorFlow", "Deep Learning"]
  }
}
```

---

#### `GET /api/dashboard/history`

Get the authenticated user's recommendation search history with pagination.

**Auth:** Required

**Query Parameters:**

| Param   | Type   | Default | Constraints     |
| ------- | ------ | ------- | --------------- |
| `page`  | number | 1       | Min 1           |
| `limit` | number | 10      | Min 1, Max 50   |

**Example Request:**

```bash
curl "http://localhost:5000/api/dashboard/history?page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "660e5f6789abcdef01234567",
      "userId": "660a1b2c3d4e5f6789abcdef",
      "source": "backend",
      "profileSnapshot": {
        "skills": ["Python", "TensorFlow"],
        "interests": ["AI"],
        "preferred_domain": "AI",
        "experience_level": "intermediate",
        "location": "Bangalore, India"
      },
      "recommendations": [
        {
          "internshipId": "660c3d4e5f6789abcdef0001",
          "title": "AI Research Intern",
          "company": "Google DeepMind",
          "score": 92,
          "reasoning": "Strong skill match..."
        }
      ],
      "skillGaps": [],
      "createdAt": "2026-03-11T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "pages": 3
  }
}
```

---

#### `GET /api/dashboard/saved`

Get all saved internships for the authenticated user.

**Auth:** Required

**Example Request:**

```bash
curl http://localhost:5000/api/dashboard/saved \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "660d4e5f6789abcdef012345",
      "userId": "660a1b2c3d4e5f6789abcdef",
      "internshipId": {
        "_id": "660c3d4e5f6789abcdef0001",
        "title": "AI Research Intern",
        "company": "Google DeepMind",
        "location": "Bangalore, India",
        "domain": "AI",
        "stipend": "₹80,000/month"
      },
      "score": 92,
      "reasoning": "Strong skill match..."
    }
  ]
}
```

---

#### `POST /api/dashboard/save`

Save an internship to the authenticated user's collection.

**Auth:** Required

**Request Body:**

| Field          | Type     | Required | Constraints               |
| -------------- | -------- | -------- | ------------------------- |
| `internshipId` | ObjectId | Yes      | Valid MongoDB ObjectId    |
| `score`        | number   | No       | 0–100                     |
| `breakdown`    | object   | No       | Score breakdown object    |
| `reasoning`    | string   | No       | Match reasoning text      |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/dashboard/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "internshipId": "660c3d4e5f6789abcdef0001",
    "score": 92,
    "reasoning": "Strong skill match for AI Research Intern"
  }'
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Internship saved successfully",
  "data": {
    "_id": "660d4e5f6789abcdef012345",
    "userId": "660a1b2c3d4e5f6789abcdef",
    "internshipId": "660c3d4e5f6789abcdef0001",
    "score": 92,
    "reasoning": "Strong skill match for AI Research Intern",
    "createdAt": "2026-03-11T10:45:00.000Z"
  }
}
```

---

#### `DELETE /api/dashboard/saved/:id`

Remove a saved internship from the authenticated user's collection.

**Auth:** Required

**Path Parameters:**

| Param | Type     | Description                     |
| ----- | -------- | ------------------------------- |
| `id`  | ObjectId | SavedRecommendation document ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/dashboard/saved/660d4e5f6789abcdef012345 \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Saved internship removed"
}
```

**Errors:**

| Status | Message                            |
| ------ | ---------------------------------- |
| `404`  | `"Saved recommendation not found"` |

---

## Data Models

### User

| Field          | Type     | Description                          |
| -------------- | -------- | ------------------------------------ |
| `name`         | String   | Full name (max 100 chars)            |
| `email`        | String   | Unique, lowercase email              |
| `password`     | String   | Bcrypt-hashed (min 8 chars raw)      |
| `role`         | String   | `"user"` or `"admin"`               |
| `profile`      | ObjectId | Reference to Profile                 |
| `resumeText`   | String   | Extracted text from uploaded resume  |
| `resumeFileName` | String | Uploaded resume filename             |
| `lastLogin`    | Date     | Last login timestamp                 |
| `createdAt`    | Date     | Account creation timestamp           |

### Profile

| Field              | Type     | Description                                              |
| ------------------ | -------- | -------------------------------------------------------- |
| `skills`           | String[] | Required, min 1 skill                                    |
| `interests`        | String[] | Optional interest areas                                  |
| `preferred_domain` | String   | Target domain (default: `"all"`)                         |
| `experience_level` | String   | `"beginner"`, `"intermediate"`, or `"advanced"`          |
| `location`         | String   | Preferred location                                       |

### Internship

| Field             | Type     | Description                                              |
| ----------------- | -------- | -------------------------------------------------------- |
| `title`           | String   | Internship title                                         |
| `company`         | String   | Company name                                             |
| `location`        | String   | Work location                                            |
| `domain`          | String   | One of: AI, Web Development, Cybersecurity, Data Science, Cloud, Mobile Development, DevOps, Blockchain, IoT, Game Development, UI/UX Design, Machine Learning, Other |
| `required_skills` | String[] | Min 1 skill                                              |
| `stipend`         | String   | Compensation info                                        |
| `duration`        | String   | Internship length                                        |
| `application_link`| String   | Application URL                                          |
| `description`     | String   | Detailed description                                     |

### SavedRecommendation

| Field          | Type     | Description                            |
| -------------- | -------- | -------------------------------------- |
| `userId`       | ObjectId | Reference to User                      |
| `profileId`    | ObjectId | Reference to Profile                   |
| `internshipId` | ObjectId | Reference to Internship (required)     |
| `score`        | Number   | 0–100 match score                      |
| `breakdown`    | Object   | `{ skills, field, sector, location, mode }` |
| `reasoning`    | String   | Match reasoning text                   |

### RecommendationHistory

| Field             | Type     | Description                              |
| ----------------- | -------- | ---------------------------------------- |
| `userId`          | ObjectId | Reference to User                        |
| `profileSnapshot` | Object   | Snapshot of profile at time of search    |
| `recommendations` | Array    | `[{ internshipId, title, company, score, reasoning }]` |
| `source`          | String   | `"backend"`, `"ai"`, or `"local"`       |
| `skillGaps`       | Array    | `[{ skill, importance, reason, resources }]` |
| `createdAt`       | Date     | Timestamp when history was created       |

---

## Environment Variables

| Variable                 | Required | Default                | Description                         |
| ------------------------ | -------- | ---------------------- | ----------------------------------- |
| `PORT`                   | No       | `5000`                 | Server port                         |
| `NODE_ENV`               | No       | `development`          | Environment mode                    |
| `MONGODB_URI`            | Yes      | —                      | MongoDB connection string           |
| `JWT_SECRET`             | Yes      | —                      | Secret key for JWT signing          |
| `JWT_EXPIRE`             | No       | `7d`                   | JWT token expiration duration       |
| `OPENAI_API_KEY`         | Yes*     | —                      | OpenAI API key (*for AI features)   |
| `CORS_ORIGIN`            | No       | `http://localhost:5173` | Comma-separated allowed origins    |
| `RATE_LIMIT_WINDOW_MS`   | No       | `900000` (15 min)      | Rate limit window in milliseconds   |
| `RATE_LIMIT_MAX_REQUESTS`| No       | `100`                  | Max requests per window             |

---

## Database Seeding

Populate the database with 20 sample internships:

```bash
cd backend
npm run seed
```

This clears the existing `Internship` collection and inserts sample data from `data/sampleInternships.json`.

---

> **Generated for AI Internship Recommendation Engine v1.0**
