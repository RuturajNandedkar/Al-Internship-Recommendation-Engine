# 🚀 Deployment Guide — AI Internship Recommendation Engine

This guide walks you through deploying the full-stack application:

| Layer | Service | Cost |
|-------|---------|------|
| **Frontend** | Netlify | Free tier |
| **Backend** | Render or Railway | Free tier |
| **Database** | MongoDB Atlas | Free tier (512 MB) |

---

## 📋 Prerequisites

- GitHub account with the project pushed to a repository
- Node.js 18+ installed locally
- Accounts on: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Netlify](https://www.netlify.com), and [Render](https://render.com) or [Railway](https://railway.app)

---

## Step 1: MongoDB Atlas (Database)

### 1.1 Create a Free Cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up
2. Click **"Build a Database"**
3. Choose **M0 Free Tier** (shared)
4. Select a cloud provider and region close to your backend server:
   - If backend on Render (Oregon): choose **AWS us-west-2**
   - If backend on Railway: choose **AWS us-east-1**
5. Name your cluster (e.g., `internship-engine`)
6. Click **Create Cluster**

### 1.2 Set Up Database Access

1. Go to **Database Access** in the left sidebar
2. Click **+ Add New Database User**
3. Create a user:
   - **Username**: `app_user` (avoid special characters)
   - **Password**: Click **Autogenerate** and save the password securely
   - **Privileges**: "Read and write to any database"
4. Click **Add User**

### 1.3 Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **+ Add IP Address**
3. Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - This is required for cloud-hosted backends (Render/Railway)
4. Click **Confirm**

### 1.4 Get Your Connection String

1. Go to **Database** → Click **Connect** on your cluster
2. Choose **"Connect your application"**
3. Select **Node.js** driver, version **5.5 or later**
4. Copy the connection string. It will look like:
   ```
   mongodb+srv://app_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add the database name before the `?`:
   ```
   mongodb+srv://app_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/internship-engine?retryWrites=true&w=majority
   ```

### 1.5 Seed the Database

From your local machine, temporarily set the Atlas URI and run the seed script:

```bash
cd backend
# Set your Atlas connection string
set MONGODB_URI=mongodb+srv://app_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/internship-engine?retryWrites=true&w=majority

npm run seed
```

You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing internships
✅ Seeded 50 internships
📦 Database connection closed
```

---

## Step 2: Backend Deployment

### Option A: Deploy to Render (Recommended)

#### 2A.1 Create a Render Account

1. Go to [https://render.com](https://render.com) and sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository

#### 2A.2 Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `internship-engine-api` |
| **Region** | Oregon (US West) — closest to Atlas |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

#### 2A.3 Set Environment Variables

In the **Environment** tab, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random string (use `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `OPENAI_API_KEY` | Your OpenAI API key (optional) |
| `OPENAI_MODEL` | `gpt-3.5-turbo` |
| `CORS_ORIGIN` | `https://your-app.netlify.app` (set after frontend deploy) |

#### 2A.4 Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run `npm install` in the `backend/` directory
3. Start the server with `node server.js`
4. Give you a URL like `https://internship-engine-api.onrender.com`

**Verify**: Visit `https://internship-engine-api.onrender.com/api/health`

> **Note**: Render free tier spins down after 15 minutes of inactivity. First request after idle takes ~30s.

---

### Option B: Deploy to Railway

#### 2B.1 Create a Railway Account

1. Go to [https://railway.app](https://railway.app) and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository

#### 2B.2 Configure the Service

1. After importing, click on the service
2. Go to **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `node server.js`
3. Go to **Variables** and add the same environment variables as Render (Step 2A.3)
4. Railway will auto-detect Node.js and run `npm install`

#### 2B.3 Generate a Domain

1. Go to **Settings** → **Networking**
2. Click **Generate Domain**
3. You'll get a URL like `https://internship-engine-production.up.railway.app`

**Verify**: Visit `https://YOUR_APP.up.railway.app/api/health`

> Railway gives $5 free credits/month which covers a small backend easily.

---

## Step 3: Frontend Deployment (Netlify)

### 3.1 Prepare the Frontend Build

Update the backend URL in your frontend. Create or update a `.env.production` file in the project root:

```env
VITE_API_URL=https://internship-engine-api.onrender.com/api
```

### 3.2 Update Backend Service URL

In [src/services/backendService.js](src/services/backendService.js), ensure the API URL uses the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

In [src/services/dashboardService.js](src/services/dashboardService.js), ensure the same:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

### 3.3 Deploy to Netlify

#### Option 1: Netlify CLI (Terminal)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 2: Netlify Dashboard (Recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `main` |
| **Base directory** | (leave empty) |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

5. Click **Show advanced** → **New variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://internship-engine-api.onrender.com/api` |

6. Click **Deploy site**

### 3.4 Configure Redirects for SPA

Create a `public/_redirects` file (already handled by Vite):

```
/*    /index.html   200
```

This ensures React Router works correctly on Netlify.

### 3.5 Update Backend CORS

After deploying, go back to your backend environment variables and update:

```
CORS_ORIGIN=https://your-site-name.netlify.app
```

---

## Step 4: Post-Deployment Checklist

### 4.1 Verify Everything Works

- [ ] Visit `https://YOUR_BACKEND.onrender.com/api/health` — should return JSON with `"success": true`
- [ ] Visit `https://YOUR_BACKEND.onrender.com/api/docs` — should show API documentation
- [ ] Visit `https://YOUR_BACKEND.onrender.com/api/internships` — should return 50 internships
- [ ] Visit your Netlify URL — should load the React app
- [ ] Test signup/login flow
- [ ] Test recommendation generation
- [ ] Test resume upload
- [ ] Test skill gap analysis
- [ ] Test dashboard

### 4.2 Custom Domain (Optional)

**Netlify**:
1. Go to **Domain settings** → **Add custom domain**
2. Follow DNS configuration instructions
3. Netlify provides free HTTPS via Let's Encrypt

**Render**:
1. Go to **Settings** → **Custom Domains**
2. Add your domain and configure DNS

### 4.3 Monitoring

- **Render/Railway**: Built-in logging dashboard
- **MongoDB Atlas**: Built-in monitoring + alerts
- **Netlify**: Deploy logs and analytics

---

## 🔧 Environment Variables Summary

### Backend (Render / Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `10000` (Render) or auto (Railway) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Random string for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `OPENAI_API_KEY` | No | For AI features (skill gap, resume analysis) |
| `OPENAI_MODEL` | No | Default: `gpt-3.5-turbo` |
| `CORS_ORIGIN` | Yes | Your Netlify frontend URL |

### Frontend (Netlify)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g., `https://your-api.onrender.com/api`) |
| `VITE_GEMINI_API_KEY` | No | Google Gemini API key for client-side AI |

---

## 💰 Cost Breakdown (Free Tiers)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas M0** | Free forever | 512 MB storage, shared RAM |
| **Render Free** | Free | 750 hours/month, spins down after 15 min idle |
| **Railway** | $5 credit/month | ~500 hours of small instance |
| **Netlify Free** | Free | 100 GB bandwidth, 300 build min/month |
| **OpenAI (optional)** | Pay-as-you-go | ~$0.002 per recommendation |
| **Gemini AI (optional)** | Free tier | 60 requests/minute |

**Total for a portfolio project: $0/month** (with free tiers)

---

## 🔄 Continuous Deployment

Both Netlify and Render/Railway support automatic deploys:

1. Push code to `main` branch
2. Services auto-detect changes and redeploy
3. Zero-downtime deployments

```bash
git add .
git commit -m "feat: update recommendation algorithm"
git push origin main
# ✅ Both frontend and backend will auto-deploy
```

---

## ⚠️ Important Notes

1. **Render Free Tier Cold Starts**: The first request after idle takes ~30 seconds. Consider upgrading to a paid plan ($7/month) for always-on.
2. **MongoDB Atlas IP Whitelist**: Keep `0.0.0.0/0` for cloud backends since their IPs change.
3. **CORS**: Always update `CORS_ORIGIN` to match your actual frontend URL.
4. **API Keys**: Never commit API keys to Git. Use environment variables on all platforms.
5. **JWT Secret**: Use a cryptographically random string in production. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
