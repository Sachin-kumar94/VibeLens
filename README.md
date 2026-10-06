# VibeLens — Multimodal Signal Intelligence & Interview Practice Lab

VibeLens is a production-grade multimodal communication coach and interview practice simulator. It analyzes vocal composure, body language pose landmarks, response structure (STAR, System Design, Product, Leadership rubrics), and observable camera signals to provide actionable, evidence-based feedback.

---

## 📁 Repository Architecture

The project is structured into two clean primary directories:

```
vibelens/
├── frontend/             # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/  # Modular UI (Interview, Voice, Body, Presentation, Analytics)
│   │   ├── pages/       # Route Views (Interview, Dashboard, History, Analytics, etc.)
│   │   ├── services/    # REST API & WebRTC Clients
│   │   ├── hooks/       # Custom React hooks (Camera, Audio, Pose, Recorder)
│   │   └── types/       # Global TypeScript interfaces
│   ├── public/          # Static assets & media icons
│   ├── vercel.json      # Optional Vercel deployment config
│   ├── vite.config.ts   # Vite configuration with API reverse proxy
│   └── package.json
│
├── backend/              # Node.js + Express + TypeScript + Prisma Relational Engine
│   ├── prisma/          # Prisma relational schema (SQLite & PostgreSQL compatible)
│   ├── src/
│   │   ├── controllers/ # HTTP Route Controllers
│   │   ├── services/    # Business Logic, Evaluator Engines & Question Bank
│   │   ├── routes/      # Express API Router
│   │   ├── middleware/  # Auth, Security, Multer Uploads
│   │   └── server.ts    # Server entry point + Static SPA fallback
│   ├── datasets/        # ML models, dataset pipelines & ONNX scripts
│   ├── data/            # Local SQLite database & media uploads storage
│   ├── .env.example     # Environment template
│   └── package.json
│
├── docker/               # Containerization configs (Dockerfiles & Compose)
├── docs/                 # Documentation, guides & visual references
├── scripts/              # Monorepo dev runner & dependency installers
├── render.yaml           # Turnkey Render.com Cloud deployment blueprint
└── package.json          # Root orchestration scripts
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Installs both backend and frontend dependencies
npm run install:all
```

### 2. Start Development Servers
```bash
# Starts backend on http://localhost:5000 and frontend on http://localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
# Builds both backend TypeScript and frontend Vite assets
npm run build

# Starts unified production server on port 5000 (serves API + React frontend)
npm start
```

---

## 🌐 Deployment to GitHub & Cloud

For detailed step-by-step instructions on deploying to **Render**, **Railway**, **Vercel**, or generating an **instant live URL in 30 seconds**, see the comprehensive [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

### Quick Deploy Options:
- **Instant Live Link (30 seconds):** `npx localtunnel --port 5000`
- **Render.com:** Connect your GitHub repo, select Web Service, set Build Command to `npm run install:all && npm run build`, and Start Command to `npm start`.
- **Railway.app:** Deploy from GitHub repo and generate a public domain under Networking.
- **Docker Compose:** `docker compose -f docker/docker-compose.yml up -d --build`.

---

## 🛡️ License
Private & Confidential — VibeLens.
