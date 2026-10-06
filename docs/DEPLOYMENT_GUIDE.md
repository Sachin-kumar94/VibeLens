# VibeLens — Deployment & Live Link Guide

This guide explains how to deploy VibeLens and generate a public live HTTPS link that you can share with anyone or test on any mobile device/desktop.

---

## ⚡ Method 1: Instant Live Link (30 Seconds — Zero Setup)

If you have VibeLens running locally right now and want an **instant public HTTPS link** to share or test on your mobile phone:

### Step 1: Ensure VibeLens is running
In your terminal, start the app:
```bash
npm run dev
```
*(Your server runs on port 5000 and client on port 3000).*

### Step 2: Generate Live Public URL
Open a new terminal window and run:
```bash
npx localtunnel --port 3000
```
*(Or for single-service production on port 5000: `npx localtunnel --port 5000`)*

**Output:**
```
your url is: https://vibelens-demo.loca.lt
```

> **Note:** The first time you open a `loca.lt` link, it asks for the tunnel IP password. Run `curl https://loca.lt/mytunnelpassword` in your terminal to see your IP password and paste it into the prompt.

**Alternative with Cloudflare Tunnel (No password prompt):**
```bash
npx untun tunnel http://localhost:3000
```
Or with ngrok:
```bash
npx ngrok http 3000
```

---

## 🚀 Method 2: Render.com (Recommended Cloud Deployment — Free Live Link)

Render provides a 100% free web service and generates an automatic HTTPS domain: `https://vibelens.onrender.com`.

Since VibeLens is configured for **Single-Service Full-Stack Deployment**, one single Web Service hosts both your React client and your Express API.

### Step 1: Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial VibeLens production commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vibelens.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com) and log in.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository (`vibelens`).
4. Configure the settings:
   - **Name:** `vibelens` (your live link will be `https://vibelens.onrender.com`)
   - **Region:** Any (e.g. Oregon or Frankfurt)
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** `Free`

### Step 3: Add Environment Variables
Under the **Environment Variables** tab, add:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = `file:./data/vibelens.db`
- `JWT_SECRET` = `(generate any random 32-character string)`
- `SESSION_SECRET` = `(generate any random 32-character string)`
- `FRONTEND_URL` = `https://vibelens.onrender.com`
- `BACKEND_URL` = `https://vibelens.onrender.com`

### Step 4: Click "Deploy Web Service"
Render will install dependencies, push the Prisma database, build the React SPA, compile the TypeScript server, and start the application.

Your live link will be active at:
`https://vibelens.onrender.com`

---

## 🚆 Method 3: Railway.app (One-Click Full Stack)

Railway is extremely fast and provides an automatic domain like `https://vibelens-production.up.railway.app`.

1. Go to [railway.app](https://railway.app) and sign up with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `vibelens` repository.
4. Click **Add Variables**:
   - `DATABASE_URL` = `file:./data/vibelens.db`
   - `JWT_SECRET` = `vibelens_secret_key_2026`
   - `SESSION_SECRET` = `vibelens_session_2026`
   - `NODE_ENV` = `production`
5. Go to **Settings** → **Networking** → Click **Generate Domain**.
6. Railway will automatically build and expose your live link!

---

## ⚡ Method 4: Vercel (Frontend) + Render (Backend)

If you prefer deploying the React frontend on Vercel:

### 1. Deploy Backend (Express) to Render or Railway
- Deploy only the `backend/` directory or full repo on Render.
- Get your backend live URL: `https://vibelens-api.onrender.com`.

### 2. Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set **Root Directory** to `frontend`.
4. Update `frontend/vercel.json` with your backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://vibelens-api.onrender.com/api/$1" },
       { "source": "/uploads/(.*)", "destination": "https://vibelens-api.onrender.com/uploads/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**. Vercel will generate your live link: `https://vibelens.vercel.app`.

---

## 🐳 Method 5: Self-Hosted Docker / VPS (DigitalOcean / AWS / Hetzner)

If you have a Linux VPS (Ubuntu, Debian):

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vibelens.git
cd vibelens

# Build and start with Docker Compose
docker compose -f docker/docker-compose.yml up -d --build
```
Your app will be live on your server's IP address:
- Frontend: `http://YOUR_SERVER_IP:3000`
- Backend: `http://YOUR_SERVER_IP:5000`
