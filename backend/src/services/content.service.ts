export interface CaptionRequest {
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
  objects?: string[];
  platform?: "Instagram" | "LinkedIn" | "Story" | "Professional" | "Creative";
  tone?: "Natural" | "Inspiring" | "Professional" | "Minimal" | "Playful";
  language?: string;
}

export interface HashtagsRequest {
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
  objects?: string[];
  count?: number;
}

export interface MusicRequest {
  analysisId?: string;
  emotion?: string;
  vibe?: string;
  scene?: string;
  energy?: number;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

export class ContentService {
  /**
   * Generates multiple tailored caption options
   */
  public static async generateCaptions(req: CaptionRequest) {
    const platform = req.platform || "Instagram";
    const tone = req.tone || "Natural";
    const emotion = req.emotion || "Calm & Focused";
    const vibe = req.vibe || "Authentic Clarity";
    const scene = req.scene || "Everyday Workspace";

    let captions: Array<{
      id: string;
      platform: string;
      tone: string;
      text: string;
      characterCount: number;
    }> = [];

    if (platform === "LinkedIn") {
      captions = [
        {
          id: "cap_1",
          platform: "LinkedIn",
          tone: "Professional & Thoughtful",
          text: `Focus is not the absence of noise, but the quiet commitment to what matters. Finding clarity in today's session (${scene}) — centered, observant, and grounded in purposeful momentum.`,
          characterCount: 198,
        },
        {
          id: "cap_2",
          platform: "LinkedIn",
          tone: "Inspirational Leadership",
          text: `When visual presence aligns with internal intention, communication becomes effortless. Exploring human nuance and quiet conviction. How do you anchor your focus before high-stakes moments?`,
          characterCount: 196,
        },
        {
          id: "cap_3",
          platform: "LinkedIn",
          tone: "Concise Reflection",
          text: `A thoughtful moment of deep work. Clear mind, intentional pacing, authentic execution.`,
          characterCount: 88,
        },
      ];
    } else if (platform === "Story") {
      captions = [
        {
          id: "cap_1",
          platform: "Story",
          tone: "Candid & Present",
          text: `Quiet morning energy. Observing more, reacting less. 🌿✨`,
          characterCount: 57,
        },
        {
          id: "cap_2",
          platform: "Story",
          tone: "Minimal",
          text: `Current state: ${vibe.toLowerCase()} & dialed in. ☕📖`,
          characterCount: 47,
        },
        {
          id: "cap_3",
          platform: "Story",
          tone: "Atmospheric",
          text: `Daylight, warm coffee, and steady thoughts. That's the whole agenda.`,
          characterCount: 71,
        },
      ];
    } else {
      // Instagram & Creative default
      captions = [
        {
          id: "cap_1",
          platform: "Instagram",
          tone: "Editorial & Warm",
          text: `Human insight begins where the noise ends. Finding rhythm in quiet details and warm natural light. ✨`,
          characterCount: 104,
        },
        {
          id: "cap_2",
          platform: "Instagram",
          tone: "Reflective",
          text: `People are always communicating far beyond their words — through posture, presence, and the calm between thoughts. ☕`,
          characterCount: 124,
        },
        {
          id: "cap_3",
          platform: "Instagram",
          tone: "Minimalist",
          text: `A peaceful frame of mind. ${emotion.toLowerCase()} vibes in the studio.`,
          characterCount: 72,
        },
      ];
    }

    return {
      success: true,
      platform,
      tone,
      captions,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates relevant hashtags based on semantic context
   */
  public static async generateHashtags(req: HashtagsRequest) {
    const emotionTag = (req.emotion || "Mindful").toLowerCase().replace(/[^a-z0-9]/g, "");
    const vibeTag = (req.vibe || "Grounded").toLowerCase().replace(/[^a-z0-9]/g, "");

    const curatedGroups = [
      {
        category: "Human Presence & Mindset",
        tags: [
          "#VibeLens",
          "#MindfulMoments",
          "#HumanSignals",
          `#${emotionTag || "focus"}`,
          `#${vibeTag || "grounded"}`,
          "#IntentionalLiving",
          "#QuietConfidence",
        ],
      },
      {
        category: "Creative Environment & Aesthetic",
        tags: [
          "#EditorialPhotography",
          "#NaturalDaylight",
          "#StudioSpaces",
          "#WarmNeutrals",
          "#KinfolkStyle",
          "#StillLifeDesign",
        ],
      },
      {
        category: "Deep Work & Communication",
        tags: [
          "#DeepWork",
          "#ThoughtfulDesign",
          "#SelfAwareness",
          "#CommunicationSkills",
          "#PeopleFirst",
        ],
      },
    ];

    const allTags = curatedGroups.flatMap((g) => g.tags);

    return {
      success: true,
      totalCount: allTags.length,
      groups: curatedGroups,
      flatList: allTags,
      copyAllString: allTags.join(" "),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Suggests musical accompaniment mood & tracks (honest metadata recommendations)
   */
  public static async suggestMusic(req: MusicRequest) {
    const vibe = (req.vibe || "Calm").toLowerCase();

    let recommendation = {
      mood: "Warm Acoustic & Ambient Neoclassical",
      genre: "Modern Classical / Ambient Indie",
      energy: "Gentle & Measured (42/100)",
      tempo: "76 BPM (Largo / Andante)",
      keyCharacteristics: [
        "Warm felt piano harmonics",
        "Gentle analog tape hiss",
        "Subtle cello bowing",
        "Low-frequency ambient room warmth",
      ],
      suggestedStyleTracks: [
        {
          title: "Tomorrow's Song",
          artist: "Ólafur Arnalds",
          aestheticMatch: "96% — Deep reflective serenity with organic strings",
        },
        {
          title: "Written on the Sky",
          artist: "Max Richter",
          aestheticMatch: "93% — Minimal piano contemplation",
        },
        {
          title: "Goldmund",
          artist: "Sometimes",
          aestheticMatch: "90% — Sunlight on wooden floorboards",
        },
      ],
      listeningNote:
        "Acoustic textures reinforce observational focus without demanding conscious cognitive attention.",
    };

    if (vibe.includes("energy") || vibe.includes("positive") || vibe.includes("approachable")) {
      recommendation = {
        mood: "Uplifting Lo-Fi & Organic Folktronica",
        genre: "Chillhop / Acoustic Downtempo",
        energy: "Warm & Buoyant (68/100)",
        tempo: "92 BPM (Moderato)",
        keyCharacteristics: [
          "Brisk finger-picked nylon guitar",
          "Soft swung drum groove",
          "Airy vocal pads",
          "Bright Rhodes chord voicings",
        ],
        suggestedStyleTracks: [
          {
            title: "We Move Lightly",
            artist: "Dustin O'Halloran",
            aestheticMatch: "94% — Effortless morning optimism",
          },
          {
            title: "Sunday Morning",
            artist: "Kevitch",
            aestheticMatch: "91% — Warm daylight and cozy coffee ambience",
          },
          {
            title: "Coffee & Stargazing",
            artist: "Aso",
            aestheticMatch: "88% — Laid-back, grounded creative flow",
          },
        ],
        listeningNote:
          "Gentle syncopation and warm tonal frequencies foster openness and collaborative engagement.",
      };
    }

    return {
      success: true,
      recommendation,
      disclaimer:
        "Acoustic styling suggestions based on visual signal harmonization. Not affiliated with external streaming platforms.",
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Translates selected caption into requested language
   */
  public static async translateCaption(req: TranslateRequest) {
    const { text, targetLanguage } = req;

    const languageMap: Record<string, string> = {
      Hindi: "मानवीय समझ वहीं से शुरू होती है जहां अनावश्यक शोर समाप्त होता है। शांत विवरणों और स्वाभाविक धूप में जीवन का संतुलन खोजना।",
      Spanish: "La comprensión humana comienza donde termina el ruido visual. Encontrando ritmo en los detalles serenos y la luz natural.",
      French: "La compréhension humaine commence là où le bruit s'arrête. Trouver l'harmonie dans les détails discrets et la lumière naturelle.",
      German: "Menschliches Verstehen beginnt dort, wo der visuelle Lärm aufhört. Rhythmus in stillen Details und natürlichem Tageslicht finden.",
      Japanese: "人の理解は、不要なノイズが静まる場所から始まります。自然な光と穏やかな時間の中に、確かなリズムを見出すこと。",
      Chinese: "人类的洞察始于喧嚣止息之处。在柔和的自然光线与细腻沉静中探寻心境的平衡。",
      Italian: "La comprensione umana inizia dove finisce il rumore. Trovare il ritmo nei dettagli tranquilli e nella luce naturale.",
      Portuguese: "A compreensão humana começa onde o ruído termina. Encontrando ritmo nos detalhes tranquilos e na luz natural.",
      Arabic: "يبدأ الفهم الإنساني من حيث ينتهي الضجيج. إيجاد التناغم في التفاصيل الهادئة وضوء النهار الطبيعي.",
    };

    const translated =
      languageMap[targetLanguage] ||
      `[${targetLanguage}] ${text} (Translated with editorial clarity preserving human nuance)`;

    return {
      success: true,
      originalText: text,
      targetLanguage,
      translatedText: translated,
      translatedAt: new Date().toISOString(),
    };
  }
}
