# VibeLens AI Platform Architecture

This document describes the high-level microservice and full-stack architecture of **VibeLens**.

```
                           +----------------------------+
                           |     React Web Client       |
                           |   (Vite, Tailwind, Motion) |
                           +--------------+-------------+
                                          |
                                          | HTTPS / WebSockets
                                          v
                           +--------------+-------------+
                           |  Express Gateway & Proxy   |
                           |   (Node.js / TypeScript)   |
                           +-------+------------+-------+
                                   |            |
                REST / JSON API    |            |  REST API / ONNX
                                   v            v
                      +------------+----+  +----+-------------+
                      | MongoDB Cluster |  | Python AI Engine |
                      |  (User & Logs)  |  |  (FastAPI / ONNX)|
                      +-----------------+  +------------------+
```

## System Modules

### 1. Web Portal Interface (Frontend)
- **Framework**: React (Vite, TypeScript, Tailwind, Framer Motion).
- **Core Views**:
  - **Landing Page**: Immersive marketing layout with pricing tables and testimonials.
  - **Dashboard**: Direct visual workbench for single-image drops, crop previews, and real-time outputs.
  - **Batch Tray**: Multi-threaded sequential file analyzes queue.
  - **Live Camera API**: Web RTC camera stream parser capturing raw frame bitmaps at controlled 1 FPS.
  - **Vibe Comparer**: Side-by-side analytics comparison matrix.
  - **Interactive Stats**: Fluid SVG dashboard tracking emotion frequencies and sentiment trendlines.

### 2. Custom Server API & Gateway (Backend)
- **Framework**: Node.js Express.
- **Responsibilities**:
  - Acts as a secure HTTP proxy to shield third-party AI keys.
  - Handles session authentication and profile updates.
  - Controls local persistence (simulated MongoDB S3 file stream) and weekly statistical aggregation.

### 3. Dedicated AI Inference Service (Production Target)
- **Framework**: Python FastAPI / PyTorch / ONNX Runtime.
- **Model Pipelines**:
  - **Emotion Detection (FER2013 / AffectNet)**: Runs a specialized lightweight MobileNetV3 model optimized with depthwise separable convolutions to identify facial bounding boxes and classify standard facial expressions (Happy, Sad, Neutral, Angry, Surprise, Fear, Disgust).
  - **Scene Recognition (Places365)**: Triggers ResNet50 vision backbones to parse background contexts (Office, Sunset, Forest, Beach).
  - **Color Psychology Decoders**: Formulates 3 dominant hex colors and generates color psychology interpretation indexes.
