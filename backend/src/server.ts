import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./services/prisma.service.js";
import { seedDatabase } from "./seed.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import privacyRoutes from "./routes/privacy.routes.js";
import contentRoutes from "./routes/content.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import searchRoutes from "./routes/search.routes.js";
import compareRoutes from "./routes/compare.routes.js";
import presentationRoutes from "./routes/presentation.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import documentRoutes from "./routes/document.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { interviewService } from "./services/interview/interviewService.js";
import { providerRegistry } from "./services/auth/providerRegistry.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL || "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security Headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Health Check
app.get("/api/health", async (_req, res) => {
  let dbStatus = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = "disconnected";
  }

  const providerStatus = providerRegistry.getPublicStatus();

  res.json({
    status: "ok",
    product: "VibeLens",
    architecture: "Relational Multimodal Signal Intelligence",
    version: "2.0.0",
    database: "prisma-sqlite",
    databaseStatus: dbStatus,
    providers: providerStatus,
    timestamp: new Date().toISOString(),
  });
});

// Static Uploads Storage
const uploadDir = path.resolve(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analyze", analysisRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/fusion", analysisRoutes);
app.use("/api/history", analysisRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/presentation", presentationRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// Production Static Frontend Delivery (SPA fallback for Single-Service Deployment)
const possibleDistPaths = [
  path.resolve(process.cwd(), "..", "frontend", "dist"),
  path.resolve(process.cwd(), "frontend", "dist"),
  path.resolve(__dirname, "..", "..", "frontend", "dist"),
  path.resolve(process.cwd(), "..", "client", "dist"),
  path.resolve(process.cwd(), "client", "dist"),
  path.resolve(__dirname, "..", "..", "client", "dist"),
];
const clientDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDist) {
  console.log(`✓ Production client distribution detected at: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function startServer() {
  try {
    console.log("▲ Connecting to Prisma database...");
    await prisma.$connect();
    console.log("✓ Connected to Prisma relational database successfully.");

    // Seed development accounts
    await seedDatabase();

    // Ensure interview question bank is seeded
    await interviewService.ensureSystemQuestionsSeeded();
  } catch (err: any) {
    console.warn("Prisma connection warning:", err?.message || err);
  }

  app.listen(PORT, () => {
    console.log(`✓ VibeLens Production-Grade API Server listening on http://localhost:${PORT}`);
    providerRegistry.logStartupStatus();
  });
}

startServer();

export default app;
