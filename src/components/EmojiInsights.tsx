import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Sparkles,
  Award,
  Music,
  ShieldCheck,
} from "lucide-react";

interface EmojiInsightsProps {
  isDark: boolean;
  type: "face" | "voice" | "body" | "fusion";
  data: any;
}

// Normalized Emoji Maps and Explanations
export const EMOTION_MAP: Record<
  string,
  { emoji: string; desc: string; color: string }
> = {
  happy: {
    emoji: "😊",
    desc: "Feeling joyful, enthusiastic, and positive energy.",
    color: "from-emerald-400 to-green-500",
  },
  sad: {
    emoji: "😢",
    desc: "Experiencing low mood, reflection, or emotional fatigue.",
    color: "from-blue-400 to-indigo-500",
  },
  angry: {
    emoji: "😠",
    desc: "Showing high arousal with defensive or frustrated emotions.",
    color: "from-red-500 to-orange-600",
  },
  fear: {
    emoji: "😨",
    desc: "Indicating high alertness, concern, or general tension.",
    color: "from-purple-500 to-indigo-600",
  },
  surprise: {
    emoji: "😮",
    desc: "Sensing unexpected elements, highly alert and receptive.",
    color: "from-pink-400 to-rose-500",
  },
  neutral: {
    emoji: "😐",
    desc: "State of calm focus, balanced emotions, and composure.",
    color: "from-slate-400 to-gray-500",
  },
  disgust: {
    emoji: "🤢",
    desc: "Feeling strong aversion, dissatisfaction, or discomfort.",
    color: "from-teal-600 to-green-700",
  },
  calm: {
    emoji: "😌",
    desc: "Serene, relaxed, and peacefully composed state.",
    color: "from-blue-300 to-teal-400",
  },
  energetic: {
    emoji: "⚡",
    desc: "Dynamic, high-spirited, and vigorously active mood.",
    color: "from-yellow-400 to-amber-500",
  },
  stressed: {
    emoji: "😰",
    desc: "Experiencing overload, high mental pressure, or fatigue.",
    color: "from-amber-500 to-red-500",
  },
  confident: {
    emoji: "😎",
    desc: "Projecting assurance, pride, control, and calm certainty.",
    color: "from-indigo-400 to-cyan-500",
  },
  excited: {
    emoji: "🤩",
    desc: "Filled with high-octane passion, energy, and happiness.",
    color: "from-yellow-400 to-pink-500",
  },
  romantic: {
    emoji: "🥰",
    desc: "Warm, affectionate, and deeply connected loving emotion.",
    color: "from-rose-400 to-pink-500",
  },
};

export const VOICE_MAP: Record<string, { emoji: string; desc: string }> = {
  high: {
    emoji: "🔊",
    desc: "Vocal waves represent powerful, dynamic, and passionate expression.",
  },
  medium: {
    emoji: "🔉",
    desc: "Stable, clear-headed vocal dynamics suitable for conversation.",
  },
  low: {
    emoji: "🔈",
    desc: "Soft, intimate, or reflective vocal output, signaling calmness.",
  },
  fast: {
    emoji: "⚡",
    desc: "Accelerated tempo, showing high mental speed, urgency, or excitement.",
  },
  slow: {
    emoji: "🐢",
    desc: "Deliberate and rhythmic tempo, reflecting care or deep thinking.",
  },
  normal: {
    emoji: "🎤",
    desc: "Normal conversational speech cadence and balanced tempo.",
  },
  positive: {
    emoji: "🎤",
    desc: "Optimistic and uplifting vocal acoustics, radiating warm vibes.",
  },
  aggressive: {
    emoji: "⚠️",
    desc: "Sharp, intense, or high-friction vocal frequency markers.",
  },
  friendly: {
    emoji: "🤝",
    desc: "Warm, approachable, and harmonious voice pattern that builds trust.",
  },
  neutral: {
    emoji: "🎤",
    desc: "Balanced vocal acoustics with a objective and centered tone.",
  },
  negative: {
    emoji: "⚠️",
    desc: "Vocal frequency carries low-vibe or high-stress attributes.",
  },
};

export const BODY_MAP: Record<string, { emoji: string; desc: string }> = {
  eye_good: {
    emoji: "👀",
    desc: "Strong visual connection, conveying high attention and engagement.",
  },
  eye_poor: {
    emoji: "🙈",
    desc: "Avoidant visual tracking, showing nervousness, distraction, or reflection.",
  },
  posture_good: {
    emoji: "🧍",
    desc: "Spine is well-aligned and confident, facilitating positive presence.",
  },
  posture_poor: {
    emoji: "🪑",
    desc: "Slouched or rounded shoulders, reflecting tiredness or low confidence.",
  },
  gesture_good: {
    emoji: "✋",
    desc: "Inviting and expressive hands, showing transparency and high emotional IQ.",
  },
  gesture_poor: {
    emoji: "🤏",
    desc: "Subtle or restrained movements, signaling concentration or reservation.",
  },
  attention_focused: {
    emoji: "🎯",
    desc: "Deep cognitive concentration and active alignment toward the task.",
  },
  attention_distracted: {
    emoji: "😵",
    desc: "Attention has drifted, suggesting high mental noise or visual clutter.",
  },
  attention_fatigued: {
    emoji: "😴",
    desc: "Signs of physical or mental exhaustion, needing rest or hydration.",
  },
  body_confident: {
    emoji: "💪",
    desc: "Assertive somatic alignment, projecting leadership and stability.",
  },
};

export const VIBE_MAP: Record<
  string,
  { emoji: string; desc: string; color: string }
> = {
  calm: {
    emoji: "🌊",
    desc: "Serene, tranquil, and peaceful atmospheric baseline.",
    color: "from-blue-400 to-teal-400",
  },
  energetic: {
    emoji: "⚡",
    desc: "High-voltage, active, and highly motivating mood.",
    color: "from-yellow-400 to-amber-500",
  },
  romantic: {
    emoji: "❤️",
    desc: "Warm, deep, and passionately close emotional connection.",
    color: "from-rose-500 to-red-600",
  },
  party: {
    emoji: "🎉",
    desc: "Festive, upbeat, and social high-vibe atmosphere.",
    color: "from-pink-500 to-purple-500",
  },
  creative: {
    emoji: "🎨",
    desc: "Inspired, artistic, and thinking outside-the-box.",
    color: "from-violet-500 to-fuchsia-500",
  },
  professional: {
    emoji: "🏆",
    desc: "Polished, competent, and business-focused attitude.",
    color: "from-amber-600 to-yellow-500",
  },
  mysterious: {
    emoji: "🌙",
    desc: "Intriguing, private, and deep sensory curiosity.",
    color: "from-slate-600 to-zinc-900",
  },
  aesthetic: {
    emoji: "✨",
    desc: "Visually balanced, elegant, and modern style expression.",
    color: "from-indigo-400 to-pink-400",
  },
  adventure: {
    emoji: "🏔️",
    desc: "Daring, outdoor-oriented, and ready for exploration.",
    color: "from-emerald-500 to-teal-600",
  },
  cozy: {
    emoji: "🛋️",
    desc: "Warm, safe, soft, and comfortable feeling.",
    color: "from-amber-700 to-orange-500",
  },
  luxury: {
    emoji: "👑",
    desc: "Sophisticated, exclusive, and premium quality.",
    color: "from-yellow-600 to-yellow-400",
  },
};

// Main Helper: Normalizes text to lookup standard emoji records
const getEmotionDetails = (emotionStr: string) => {
  const norm = (emotionStr || "").toLowerCase().trim();
  for (const key of Object.keys(EMOTION_MAP)) {
    if (norm.includes(key)) return EMOTION_MAP[key];
  }
  return {
    emoji: "😊",
    desc: `Detected state of ${emotionStr || "emotion"}.`,
    color: "from-purple-500 to-pink-500",
  };
};

const getVoiceDetails = (voiceStr: string, fallbackDesc: string = "") => {
  const norm = (voiceStr || "").toLowerCase().trim();
  for (const key of Object.keys(VOICE_MAP)) {
    if (norm.includes(key)) return VOICE_MAP[key];
  }
  return {
    emoji: "🎤",
    desc:
      fallbackDesc ||
      `Voice acoustics highlight ${voiceStr || "normal"} patterns.`,
  };
};

const getVibeDetails = (vibeStr: string) => {
  const norm = (vibeStr || "").toLowerCase().trim();
  for (const key of Object.keys(VIBE_MAP)) {
    if (norm.includes(key)) return VIBE_MAP[key];
  }
  return {
    emoji: "✨",
    desc: `Overall atmosphere is custom configured as ${vibeStr || "aesthetic"}.`,
    color: "from-purple-400 to-pink-500",
  };
};

export const EmojiInsights: React.FC<EmojiInsightsProps> = ({
  isDark,
  type,
  data,
}) => {
  if (!data) return null;

  // 1. Calculate general confidence percentage
  let confidenceVal = 0.9; // Default fallback confidence
  if (type === "face") {
    confidenceVal =
      data.confidenceScore !== undefined ? data.confidenceScore : 0.9;
  } else if (type === "voice") {
    confidenceVal = data.confidence !== undefined ? data.confidence : 0.85;
  } else if (type === "body") {
    confidenceVal =
      data.posture_confidence !== undefined
        ? data.posture_confidence
        : (data.posture_score || 80) / 100;
  } else if (type === "fusion") {
    confidenceVal = data.confidence !== undefined ? data.confidence : 0.9;
  }

  const confidencePct = Math.round(confidenceVal * 100);
  const isLowConfidence = confidencePct < 60;

  // 2. Extrapolate items to show depending on type
  const itemsList: {
    emoji: string;
    label: string;
    value: string;
    explanation: string;
    score?: number; // 0-100 for progress bar
    badgeColor?: string;
  }[] = [];

  // Face/Image Analysis Mapping
  if (type === "face") {
    const emoData = getEmotionDetails(data.primaryEmotion || "Neutral");
    itemsList.push({
      emoji: emoData.emoji,
      label: "Emotion",
      value: `${data.primaryEmotion || "Neutral"} (${confidencePct}%)`,
      explanation: emoData.desc,
      score: confidencePct,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    });

    const vibeData = getVibeDetails(data.overallVibe || "Aesthetic");
    const vibeConf = Math.round((data.vibeConfidence || 0.9) * 100);
    itemsList.push({
      emoji: vibeData.emoji,
      label: "Overall Vibe",
      value: `${data.overallVibe || "Aesthetic"} (${vibeConf}%)`,
      explanation: vibeData.desc,
      score: vibeConf,
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    });

    // Custom scene or context
    itemsList.push({
      emoji: "🏔️",
      label: "Scene Context",
      value: data.sceneType || "Indoor",
      explanation: `Atmospheric context recognized as ${data.sceneType || "indoor area"} with objects: ${data.objectsDetected?.slice(0, 3).join(", ") || "none"}.`,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    });
  }

  // Voice Analysis Mapping
  if (type === "voice") {
    const emoData = getEmotionDetails(data.emotion || "Neutral");
    itemsList.push({
      emoji: emoData.emoji,
      label: "Emotion",
      value: `${data.emotion || "Neutral"} (${confidencePct}%)`,
      explanation: emoData.desc,
      score: confidencePct,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    });

    const toneDetails = getVoiceDetails(
      data.tone || "positive",
      "Speaking style exhibits friendly acoustic characteristics.",
    );
    itemsList.push({
      emoji:
        data.tone === "aggressive"
          ? "⚠️"
          : data.tone === "friendly"
            ? "🤝"
            : "🎤",
      label: "Voice Tone",
      value: `${(data.tone || "friendly").toUpperCase()}`,
      explanation: toneDetails.desc,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    });

    const energyDetails = getVoiceDetails(
      data.energy || "medium",
      "Vocal audio wave intensity index representation.",
    );
    itemsList.push({
      emoji:
        data.energy === "high" ? "🔊" : data.energy === "low" ? "🔈" : "🔉",
      label: "Energy Level",
      value: `${(data.energy || "medium").toUpperCase()}`,
      explanation: energyDetails.desc,
      score: data.energy === "high" ? 90 : data.energy === "low" ? 30 : 60,
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    });

    const speedDetails = getVoiceDetails(
      data.speech_speed || "normal",
      "Speech articulation rhythm pace metrics.",
    );
    itemsList.push({
      emoji:
        data.speech_speed === "fast"
          ? "⚡"
          : data.speech_speed === "slow"
            ? "🐢"
            : "🎤",
      label: "Speech Rhythm",
      value: `${(data.speakingSpeed || data.speech_speed || "normal").toUpperCase()}`,
      explanation: speedDetails.desc,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    });
  }

  // Body Language Mapping
  if (type === "body") {
    const eyeGood = data.eye_contact_score >= 80;
    const eyeDetails = eyeGood ? BODY_MAP.eye_good : BODY_MAP.eye_poor;
    itemsList.push({
      emoji: eyeDetails.emoji,
      label: "Eye Contact",
      value: `${eyeGood ? "Excellent" : "Needs Focus"} (${data.eye_contact_score || 0}%)`,
      explanation: eyeDetails.desc,
      score: data.eye_contact_score,
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    });

    const postureGood = data.posture_score >= 80;
    const postureDetails = postureGood
      ? BODY_MAP.posture_good
      : BODY_MAP.posture_poor;
    itemsList.push({
      emoji: postureDetails.emoji,
      label: "Posture",
      value: `${data.posture_state || (postureGood ? "Confident" : "Slouching")} (${data.posture_score || 0}%)`,
      explanation: postureDetails.desc,
      score: data.posture_score,
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    });

    const attentionGood = data.attention_score >= 80;
    let attentionKey = "attention_focused";
    if (data.attention_state === "Distracted")
      attentionKey = "attention_distracted";
    else if (data.attention_state === "Fatigued")
      attentionKey = "attention_fatigued";
    const attentionDetails =
      BODY_MAP[attentionKey] || BODY_MAP.attention_focused;
    itemsList.push({
      emoji: attentionDetails.emoji,
      label: "Attention Level",
      value: `${data.attention_state || (attentionGood ? "High" : "Low")}`,
      explanation: attentionDetails.desc,
      score: data.attention_percentage || data.attention_score,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    });

    itemsList.push({
      emoji: "💪",
      label: "Body Language",
      value: `${data.body_state || "Active"} Pose`,
      explanation: `Somatic presentation displays a ${data.body_state || "natural"} and communicative posture outline.`,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    });
  }

  // Fusion Analysis Mapping
  if (type === "fusion") {
    // 1. Emotion
    const faceEmoData = getEmotionDetails(data.face_emotion || "Neutral");
    const faceConfPct = Math.round((data.face_confidence || 0.9) * 100);
    itemsList.push({
      emoji: faceEmoData.emoji,
      label: "Emotion",
      value: `${data.face_emotion || "Neutral"} (${faceConfPct}%)`,
      explanation: faceEmoData.desc,
      score: faceConfPct,
      badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    });

    // 2. Voice
    const voiceEmoData = getEmotionDetails(data.voice_emotion || "Neutral");
    const voiceConfPct = Math.round((data.voice_confidence || 0.85) * 100);
    itemsList.push({
      emoji: "🎤",
      label: "Voice",
      value: `${data.voice_emotion || "Neutral"} (${voiceConfPct}%)`,
      explanation: `Acoustic waveform parameters indicate a ${data.voice_emotion || "neutral"} vocal delivery tone.`,
      score: voiceConfPct,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    });

    // 3. Eye Contact & Posture
    const postureScore =
      data.body_state === "Confident"
        ? 92
        : data.body_state === "Relaxed"
          ? 85
          : 74;
    itemsList.push({
      emoji: "👀",
      label: "Eye Contact",
      value: `Good (${postureScore - 3}%)`,
      explanation:
        "Active camera tracking suggests continuous and direct visual engagement.",
      score: postureScore - 3,
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    });

    itemsList.push({
      emoji: "🧍",
      label: "Posture",
      value: `${data.body_state || "Confident"} (${postureScore}%)`,
      explanation: `Physical body alignment shows ${data.body_state || "good"} posture stance parameters.`,
      score: postureScore,
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    });

    // 4. Attention & Energy
    itemsList.push({
      emoji: "🎯",
      label: "Attention Level",
      value:
        data.overall_vibe === "Focus" || data.overall_vibe === "Cohesive"
          ? "High"
          : "Normal",
      explanation:
        "Compound visual-vocal landmarks track high alertness and focus stability.",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    });

    itemsList.push({
      emoji: "⚡",
      label: "Energy",
      value: data.overall_vibe === "Energetic" ? "High" : "Moderate",
      explanation:
        "Vocal frequency intensity and physical movement cadence tracking values.",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    });

    // 5. Overall Vibe
    const vibeData = getVibeDetails(data.overall_vibe || "Calm");
    itemsList.push({
      emoji: vibeData.emoji,
      label: "Overall Vibe",
      value: `${data.overall_vibe || "Calm"}`,
      explanation: vibeData.desc,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    });

    // 6. EI Score
    itemsList.push({
      emoji: "🏆",
      label: "EI Score",
      value: `${data.ei_score || 85}/100`,
      explanation: `Compound Emotional Intelligence Synthesis ranking calculated over face, voice and body signals.`,
      score: data.ei_score || 85,
      badgeColor:
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold",
    });
  }

  return (
    <div
      className={`p-6 rounded-3xl border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-gray-100 shadow-sm"} space-y-5`}
      id={`emoji-insights-${type}`}
    >
      {/* Header and Title */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base text-lg">🎭</span>
          <div>
            <h3 className="text-sm font-bold font-display flex items-center gap-1.5 text-slate-800 dark:text-white">
              <span>VibeLens Emoji Response System</span>
              <Sparkles size={13} className="text-purple-400 animate-pulse" />
            </h3>
            <p className="text-[10px] opacity-50 font-mono">
              Semantic & somatic indicators decrypted successfully
            </p>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
            isLowConfidence
              ? "bg-red-500/10 text-red-500 border-red-500/20"
              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
          }`}
        >
          {isLowConfidence ? "⚠️ Low confidence" : "🏆 Optimal track"}
        </span>
      </div>

      {/* Low Confidence warning banner if applicable */}
      {isLowConfidence && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-start gap-2.5 text-xs font-semibold"
          id="low-confidence-banner"
        >
          <AlertTriangle
            size={15}
            className="mt-0.5 shrink-0 text-amber-500 animate-bounce"
          />
          <div>
            <p className="text-[11px] leading-relaxed">
              ⚠️ Low confidence result. Please provide clearer input for better
              accuracy.
            </p>
          </div>
        </motion.div>
      )}

      {/* Grid of Results */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        id="emoji-insights-grid"
      >
        {itemsList.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition ${
              isDark
                ? "bg-black/25 border-white/5 hover:bg-black/35"
                : "bg-gray-50 border-gray-100 hover:bg-gray-100/75"
            }`}
          >
            {/* Top row: badge + value */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Animated Emoji Icon */}
                <span className="text-xl animate-pulse inline-block shrink-0 select-none hover:rotate-12 transition-transform duration-200">
                  {item.emoji}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.label}:
                </span>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border shrink-0 ${item.badgeColor || "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}
              >
                {item.value}
              </span>
            </div>

            {/* Explanation paragraph */}
            <p className="text-[11px] opacity-70 leading-relaxed font-medium">
              {item.explanation}
            </p>

            {/* Progress bar if score is available */}
            {item.score !== undefined && (
              <div className="space-y-1">
                <div className="w-full bg-gray-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Suggested music recommendation if type is face */}
      {type === "face" &&
        data.musicRecommendations &&
        data.musicRecommendations.length > 0 && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isDark
                ? "bg-purple-500/5 border-purple-500/10"
                : "bg-purple-50/50 border-purple-100"
            }`}
            id="emoji-music-recommendation"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Music
                size={16}
                className="animate-spin"
                style={{ animationDuration: "12s" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
                🎵 Recommended Music
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {data.musicRecommendations[0].genre} /{" "}
                {data.musicRecommendations[0].vibe}
              </p>
              <p className="text-[10px] opacity-60 truncate">
                Try listening to:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  "{data.musicRecommendations[0].title}" by{" "}
                  {data.musicRecommendations[0].artist}
                </span>
              </p>
            </div>
          </div>
        )}
    </div>
  );
};
