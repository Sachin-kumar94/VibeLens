# VibeLens: Intelligent Visual Emotion & Vibe Analysis Platform

VibeLens is a production-ready visual emotion, psychology, and vibe analysis platform. Using the power of Gemini's advanced multimodal vision technology, VibeLens extracts deep emotional signals, scene context, color palettes, and psychological vibes from any static image or live camera stream. It automatically curates captions, trending hashtags, and matching song recommendations.

---

## 🚀 Key Features

1. **AI Visual Workbench**: Drag-and-drop support for PNG, JPG, or WEBP files. Detects scene classifications, primary facial emotions, dominant hex codes, and ambient vibes.
2. **Live Camera Snapshot API**: Integrates directly with browser-native WebRTC video streams to capture controlled frames and run real-time mood audits.
3. **Multi-Style Captioning Engine**: Generates customized social captions (Instagram, LinkedIn, Story, Creative, and Professional) in multiple languages.
4. **Vibe Comparer**: Display and diagnostic comparison of any two historical scans side-by-side.
5. **Batch Processing Sequence**: Bulk process lists of images sequentially.
6. **Interactive Visual Diagnostics**: Custom, responsive SVG graphs rendering weekly trends and mood/vibe distributions.
7. **Accounts Preferences**: Easily change display names, capture languages, switch between Dark/Light modes, or wipe archive databases.

---

## 🛠️ Project Structure

The project has been fully configured for local development and scalable Docker/Kubernetes container deployments:

```
VibeLens/
│
├── frontend/             # React & Vite application files (rendered under /src)
├── backend/              # Node Express API and proxy service (rendered under /server.ts)
├── ai-service/           # FastAPI python service configuration
├── database/             # MongoDB schema modeling files
├── docker/               # Multi-stage production Dockerfiles and docker-compose.yml
├── docs/                 # Complete Architectural plans and REST API specifications
├── deployment/           # Kubernetes manifests (Deployment, Services, Ingress configs)
└── datasets/             # FER2013 data augmentation, PyTorch training & ONNX export pipeline
```

---

## 💻 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sachin-Arya/VibeLens.git
   cd VibeLens
   ```

2. **Install core dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   NODE_ENV="development"
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000) to access the Launch Console.

---

## 🐳 Docker Deployment

1. **Build and spin up the complete microservice stack (React, Python FastAPI, MongoDB, Redis)**:
   ```bash
   docker-compose -f docker/docker-compose.yml up --build
   ```
2. **Kubernetes Rollout**:
   ```bash
   kubectl apply -f deployment/kubernetes.yaml
   ```
