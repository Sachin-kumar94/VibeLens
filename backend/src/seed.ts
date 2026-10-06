import bcrypt from "bcryptjs";
import { prisma } from "./services/prisma.service.js";

export async function seedDatabase() {
  try {
    const defaultPassword = "VibeLens@2026";
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Seed Sachin Kumar
    const sachin = await prisma.user.upsert({
      where: { email: "sachin@example.com" },
      update: {
        passwordHash,
        emailVerified: true,
      },
      create: {
        name: "Sachin Kumar",
        email: "sachin@example.com",
        passwordHash,
        emailVerified: true,
        emailVerifiedAt: new Date("2026-08-01"),
        avatarUrl: "/assets/editorial/hero-editorial-woman.jpg",
        plan: "Pro Plan",
        confidenceBaseline: 88,
        paceBaselineWpm: 142,
        postureBaseline: 90,
        vocalEnergyBaseline: 82,
        status: "ACTIVE",
      },
    });

    // 2. Seed development demo user
    await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {
        passwordHash,
        emailVerified: true,
      },
      create: {
        name: "Maya Lin (Demo)",
        email: "demo@example.com",
        passwordHash,
        emailVerified: true,
        emailVerifiedAt: new Date("2026-08-01"),
        avatarUrl: "/assets/vibelens/vibelens-realistic-hero.jpg",
        plan: "Free Plan",
        status: "ACTIVE",
      },
    });

    // Check if Sachin has sample analyses seeded
    const count = await prisma.analysis.count({
      where: { userId: sachin.id },
    });

    if (count === 0) {
      await prisma.analysis.createMany({
        data: [
          {
            userId: sachin.id,
            type: "fusion",
            title: "Executive Project Briefing",
            timestamp: new Date("2026-09-07T14:30:00Z"),
            inputUrl: "/assets/vibelens/vibelens-cinematic-hero.jpg",
            emotion: "Confident & Engaged",
            confidence: 94,
            vibe: "Grounded Creative Resonance",
            signalQuality: "Good",
            qualityReason: "High facial visibility with synchronized acoustic cadence.",
            signalsData: JSON.stringify({
              facialExpressions: ["Relaxed Brow", "Subtle Smile", "Direct Gaze"],
              vocalEnergy: 84,
              speechPaceWpm: 148,
              postureAlignment: 92,
            }),
            emotionData: JSON.stringify({
              primary: "Confident & Engaged",
              confidence: 94,
              valence: 0.85,
            }),
            vibeData: JSON.stringify({
              descriptor: "Grounded Creative Resonance",
              radialProfile: { calm: 88, energy: 78, confidence: 94, warmth: 86 },
            }),
            insightsData: JSON.stringify([
              "Vocal cadence remained consistent within 145-152 WPM.",
              "Multi-sensor concordance verified alignment between assertive tone and open posture.",
            ]),
            recommendations: JSON.stringify([
              "Maintain current vocal pacing during strategic transitions.",
            ]),
            explanationData: JSON.stringify({
              observedSignals: ["Sustained eye contact 88%", "Balanced diaphragmatic breathing"],
              aiInterpretation: "Subject demonstrates high self-regulation and organic warmth.",
            }),
          },
          {
            userId: sachin.id,
            type: "voice",
            title: "Investor Pitch Dry-Run",
            timestamp: new Date("2026-09-06T10:15:00Z"),
            emotion: "Dynamic Focus",
            confidence: 89,
            vibe: "Clear Strategic Vision",
            signalQuality: "Good",
            qualityReason: "Optimal signal-to-noise ratio in low reverberation room.",
            signalsData: JSON.stringify({
              vocalTone: "Dynamic, Focused, Clear",
              vocalEnergy: 88,
              speechPaceWpm: 154,
            }),
            emotionData: JSON.stringify({ primary: "Dynamic Focus", confidence: 89 }),
            vibeData: JSON.stringify({ descriptor: "Strategic Vision" }),
            insightsData: JSON.stringify(["Articulate cadence with zero filler speech."]),
            recommendations: JSON.stringify(["Incorporate pause intervals after key milestones."]),
            explanationData: JSON.stringify({ aiInterpretation: "High clarity pitch delivery." }),
          },
        ],
      });

      // Seed starter insight
      await prisma.insight.create({
        data: {
          userId: sachin.id,
          category: "confidence",
          title: "Confidence Concordance",
          description: "Your confidence has improved 7% compared with your previous baseline sessions.",
          confidence: 94,
          changePercent: 7,
          metric: "Confidence",
        },
      });

      // Seed starter journal entry
      await prisma.journalEntry.create({
        data: {
          userId: sachin.id,
          date: new Date("2026-09-07T18:00:00Z"),
          vibe: "Grounded Creative Resonance",
          emotion: "Confident & Engaged",
          confidence: 94,
          context: "Keynote Preparation",
          userNote: "Delivered dry run with steady pacing and natural eye contact.",
          signalsData: JSON.stringify(["Steady gaze", "Warm tone", "Open posture"]),
          sourceMode: "fusion",
        },
      });
    }

    console.log("✓ Database seeded successfully with default development accounts.");
  } catch (e) {
    console.error("Database seed error:", e);
  }
}

// Run directly if invoked as script
if (process.argv[1]?.includes("seed")) {
  seedDatabase().then(() => process.exit(0));
}
