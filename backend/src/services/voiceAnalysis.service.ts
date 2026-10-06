import { prisma } from "./prisma.service.js";
import { VoiceAnalyzer, NormalizedVoiceAnalysisResult, VoiceAnalysisInput } from "./ai/voiceAnalyzer.js";
import fs from "fs";
import path from "path";

export class VoiceAnalysisService {
  /**
   * Run AI/acoustic voice analysis and save results
   */
  public static async processAndSaveVoice(
    userId: string,
    input: VoiceAnalysisInput
  ): Promise<{ analysis: NormalizedVoiceAnalysisResult; voiceRecordId: string; generalAnalysisId: string }> {
    const analysis = await VoiceAnalyzer.analyze(input);

    // Save into VoiceAnalysis table
    const voiceRecord = await prisma.voiceAnalysis.create({
      data: {
        userId,
        title: analysis.title,
        timestamp: new Date(analysis.timestamp),
        audioUrl: analysis.fileUrl || null,
        fileName: analysis.fileName,
        mimeType: analysis.mimeType,
        fileSize: analysis.fileSize,
        duration: analysis.duration,
        pitch: analysis.pitch,
        pitchHz: analysis.pitchHz,
        pitchVariation: analysis.pitchVariation,
        tone: `${analysis.tone} (${analysis.toneDescriptors.join(", ")})`,
        energy: analysis.energyScore,
        speechSpeed: analysis.speakingRate,
        wordsPerMinute: analysis.wordsPerMinute,
        pauseFrequency: analysis.pauseFrequency,
        speakingSpeed: Number((analysis.wordsPerMinute / 60).toFixed(2)),
        speechIntensity: analysis.speechIntensityDb,
        loudness: analysis.loudnessDb,
        vocalEnergy: analysis.vocalEnergy,
        emotion: analysis.primaryEmotion,
        emotionDistribution: JSON.stringify(analysis.emotionDistribution),
        confidence: analysis.confidence,
        backgroundNoise: analysis.qualityDetails.noise,
        volume: analysis.qualityDetails.volume,
        clarity: analysis.clarity,
        signalQuality: analysis.signalQuality,
        qualityReason: analysis.signalQualityReasons.join(". "),
        qualityNotes: analysis.qualityNotes,
        evidence: JSON.stringify(analysis.evidence),
        transcript: analysis.transcript ? JSON.stringify(analysis.transcript) : null,
        fillerWords: JSON.stringify(analysis.fillerWords),
        timeline: JSON.stringify(analysis.timeline),
        coachInsights: JSON.stringify(analysis.coach),
        isDemo: analysis.isDemo,
      },
    });

    // Mirror to general Analysis table so History, Dashboard, Analytics, and Compare immediately reflect it
    const generalRecord = await prisma.analysis.create({
      data: {
        userId,
        type: "voice",
        title: analysis.title,
        timestamp: new Date(analysis.timestamp),
        fileUrl: analysis.fileUrl || null,
        fileName: analysis.fileName,
        inputUrl: analysis.fileUrl || null,
        inputText: analysis.transcript?.fullText || `Vocal recording: ${analysis.fileName}`,
        emotion: `${analysis.primaryEmotion} (${analysis.primaryEmotionConfidence}%)`,
        confidence: analysis.confidence,
        vibe: `${analysis.tone} Cadence`,
        signalQuality: analysis.signalQuality,
        qualityReason: analysis.signalQualityReasons.join(". "),
        context: `${analysis.duration}s vocal sample`,
        signalsData: JSON.stringify([
          { name: "Pace", value: `${analysis.wordsPerMinute} WPM` },
          { name: "Pitch", value: `${analysis.pitchHz} Hz` },
          { name: "Loudness", value: analysis.loudness },
          { name: "Clarity", value: `${analysis.clarity}%` },
          { name: "Pause Rate", value: `${analysis.pauseFrequency}/min` },
        ]),
        emotionData: JSON.stringify(analysis.emotionDistribution),
        vibeData: JSON.stringify({
          calm: analysis.emotionDistribution.find((e) => e.emotion.toLowerCase().includes("calm"))?.score || 75,
          energy: analysis.energyScore,
          confidence: analysis.confidence,
          warmth: analysis.clarity,
          focus: 85,
          engagement: analysis.energyScore,
        }),
        insightsData: JSON.stringify(analysis.coach.whatWentWell),
        recommendations: JSON.stringify(analysis.coach.recommendations),
        explanationData: JSON.stringify(analysis.evidence),
        isDemo: analysis.isDemo,
      },
    });

    analysis.id = voiceRecord.id;

    return {
      analysis,
      voiceRecordId: voiceRecord.id,
      generalAnalysisId: generalRecord.id,
    };
  }

  /**
   * Get voice analysis by ID with ownership verification
   */
  public static async getVoiceAnalysisById(userId: string, id: string) {
    const record = await prisma.voiceAnalysis.findUnique({
      where: { id },
    });

    if (!record) return null;
    if (record.userId !== userId) {
      throw new Error("Unauthorized: You do not have permission to view this analysis.");
    }

    // Parse JSON fields
    let emotionDistribution = [];
    let evidence = null;
    let transcript = null;
    let fillerWords = null;
    let timeline = [];
    let coach = null;

    try { emotionDistribution = record.emotionDistribution ? JSON.parse(record.emotionDistribution) : []; } catch (e) {}
    try { evidence = record.evidence ? JSON.parse(record.evidence) : null; } catch (e) {}
    try { transcript = record.transcript ? JSON.parse(record.transcript) : null; } catch (e) {}
    try { fillerWords = record.fillerWords ? JSON.parse(record.fillerWords) : null; } catch (e) {}
    try { timeline = record.timeline ? JSON.parse(record.timeline) : []; } catch (e) {}
    try { coach = record.coachInsights ? JSON.parse(record.coachInsights) : null; } catch (e) {}

    return {
      ...record,
      emotionDistribution,
      evidence,
      transcript,
      fillerWords,
      timeline,
      coach,
    };
  }

  /**
   * Delete voice analysis by ID with ownership verification and disk cleanup
   */
  public static async deleteVoiceAnalysis(userId: string, id: string) {
    const record = await prisma.voiceAnalysis.findUnique({
      where: { id },
    });

    if (!record) return null;
    if (record.userId !== userId) {
      throw new Error("Unauthorized: You do not have permission to delete this analysis.");
    }

    // Clean up audio file on disk if stored locally
    if (record.audioUrl && record.audioUrl.startsWith("/uploads/")) {
      const localPath = path.resolve(process.cwd(), "data", record.audioUrl.replace("/uploads/", "uploads/"));
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          console.warn("Failed to delete audio file on disk:", e);
        }
      }
    }

    await prisma.voiceAnalysis.delete({ where: { id } });

    // Also remove mirrored general analysis record if matching title/fileUrl
    try {
      await prisma.analysis.deleteMany({
        where: {
          userId,
          type: "voice",
          fileUrl: record.audioUrl,
        },
      });
    } catch (e) {}

    return { id, success: true };
  }

  /**
   * Get user's voice history
   */
  public static async getUserVoiceHistory(userId: string, limit = 50) {
    return prisma.voiceAnalysis.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  /**
   * Calculate personal vocal baseline from user's history
   */
  public static async calculateUserBaseline(userId: string) {
    const history = await prisma.voiceAnalysis.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    if (history.length === 0) {
      return {
        hasBaseline: false,
        totalSessions: 0,
        averagePaceWpm: 138,
        averageConfidence: 85,
        averageVocalEnergy: 78,
        averageClarity: 90,
      };
    }

    const total = history.length;
    const avgPace = Math.round(history.reduce((acc, curr) => acc + curr.wordsPerMinute, 0) / total);
    const avgConf = Math.round(history.reduce((acc, curr) => acc + curr.confidence, 0) / total);
    const avgEnergy = Math.round(history.reduce((acc, curr) => acc + curr.vocalEnergy, 0) / total);
    const avgClarity = Math.round(history.reduce((acc, curr) => acc + curr.clarity, 0) / total);

    return {
      hasBaseline: total >= 2,
      totalSessions: total,
      averagePaceWpm: avgPace,
      averageConfidence: avgConf,
      averageVocalEnergy: avgEnergy,
      averageClarity: avgClarity,
    };
  }
}
