import React, { useState } from "react";
import { BookOpen, Sparkles, ArrowRight, X, Clock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

interface ResourceItem {
  id: string;
  category: string;
  title: string;
  readTime: string;
  summary: string;
  badge: string;
  content: {
    overview: string;
    keyTakeaways: string[];
    practicalSteps: { step: string; detail: string }[];
    sampleExample?: string;
  };
}

export const ResourcesSection: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const resources: ResourceItem[] = [
    {
      id: "star-methodology",
      category: "INTERVIEW ARCHITECTURE",
      badge: "RUBRIC PLAYBOOK",
      title: "The Multimodal STAR Method: Executive Behavioral Framework",
      readTime: "6 min read",
      summary: "How to articulate high-impact projects using Situation, Task, Action, and Result without sounding mechanical.",
      content: {
        overview: "Top-tier interviewers evaluate not just the facts of your story, but the narrative arc and your vocal conviction. Over-rehearsing leads to flat vocal cadence. The Multimodal STAR method grounds your response in specific inflection markers.",
        keyTakeaways: [
          "Situation should consume under 15% of your total response time.",
          "Action must highlight your individual contribution ('I decided', 'I architected'), not just the group ('We').",
          "Result must specify concrete metrics, timelines, or organizational impact.",
          "Pause for 1.2 seconds after the Result to let the magnitude land before transitioning.",
        ],
        practicalSteps: [
          { step: "1. The Context Hook (15s)", detail: "State the company, problem scope, and stakes in 2 punchy sentences." },
          { step: "2. The Decision Node (30s)", detail: "Explain the architectural or strategic alternatives you evaluated and why you chose your path." },
          { step: "3. The Execution Sprint (45s)", detail: "Detail how you overcame unexpected roadblocks, coordinated stakeholders, or solved technical bugs." },
          { step: "4. The Quantified Delta (20s)", detail: "Close with the percentage improvement, revenue gained, or latency eliminated." },
        ],
        sampleExample: "\"When our payment gateway latency spiked by 340ms during Black Friday, I was the primary on-call engineer (Situation). My task was to restore P99 latencies below 50ms without dropping live checkouts (Task). I identified a database connection pool exhaustion bug, hot-patched the connection queue with circuit breakers, and re-routed failover traffic across two replicas (Action). As a result, latency dropped to 42ms in 11 minutes, and we processed $1.4M without a single dropped transaction (Result).\"",
      },
    },
    {
      id: "vocal-cadence",
      category: "ACOUSTIC COMPOSURE",
      badge: "VOCAL SCIENCE",
      title: "The Acoustic Anatomy of Poise: Pacing, Pitch & Diaphragmatic Resonance",
      readTime: "5 min read",
      summary: "Why speaking between 135–155 WPM with intentional pauses commands authority and calms adrenaline in high-stakes presentations.",
      content: {
        overview: "When adrenaline rises, physiological response causes vocal cords to tighten, raising pitch jitter and elevating speed beyond 175 WPM. Listeners perceive rapid cadence as anxiety. Grounded communication relies on diaphragmatic breathing.",
        keyTakeaways: [
          "Optimal conversational pacing for technical and executive clarity is 135 to 152 Words Per Minute.",
          "Micro-pauses of 0.8–1.5 seconds replace vocal fillers ('um', 'like', 'you know') with deliberate presence.",
          "Chest-resonance sounds thin; diaphragmatic projection maintains low acoustic variance and perceived confidence.",
        ],
        practicalSteps: [
          { step: "Breathe on Period Stops", detail: "Train yourself to inhale gently through your nose at the end of each complex sentence." },
          { step: "Anchor Pitch Inflection", detail: "Avoid upward intonation ('uptalk') at the end of declarative answers. End sentences on a steady downward cadence." },
          { step: "Vocal Warmup Routine", detail: "Practice 60 seconds of gentle humming before starting an interview call to relax laryngeal muscles." },
        ],
      },
    },
    {
      id: "kinesic-landmarks",
      category: "BODY LANGUAGE",
      badge: "KINESIC GUIDE",
      title: "Virtual Body Language: Head Tilt, Gaze Tracking & Open Posture",
      readTime: "7 min read",
      summary: "Observable computer vision landmarks that signal presence, calm conviction, and authentic engagement across webcams.",
      content: {
        overview: "Remote communication flattens non-verbal cues. Camera angle, eye contact frequency, and shoulder posture dramatically shape how colleagues and hiring managers perceive your competence.",
        keyTakeaways: [
          "Maintain lens gaze 65–75% of the time, looking away naturally during moments of cognitive synthesis.",
          "Keep shoulders relaxed with 10–15% open collarbone posture rather than slumping into the screen.",
          "Hand gestures visible in the upper frame increase viewer retention and message clarity by 38%.",
        ],
        practicalSteps: [
          { step: "Align Camera to Eye Level", detail: "Elevate your webcam so you look straight ahead, avoiding downward angles that distort perspective." },
          { step: "The 3-Foot Framing Rule", detail: "Position yourself so head, shoulders, and upper chest are clearly framed with 2 inches of headroom." },
          { step: "Subtle Reciprocal Nodding", detail: "When an interviewer is asking a question, nod gently once every 4–6 seconds to confirm active listening." },
        ],
      },
    },
    {
      id: "system-design-talk",
      category: "TECHNICAL ARTICULATION",
      badge: "ENGINEERING PLAYBOOK",
      title: "Articulating Trade-offs in System Design & Architecture Rounds",
      readTime: "8 min read",
      summary: "A structured communication model for navigating ambiguity, framing non-functional requirements, and justifying architectural choices.",
      content: {
        overview: "System design interviews are not coding tests; they are collaborative architectural consultations. Candidates frequently fail not on technical knowledge, but on failing to drive requirements and state trade-offs explicitly.",
        keyTakeaways: [
          "Never jump straight into drawing boxes. Spend the first 5 minutes defining read vs. write ratios, SLA latency limits, and data scale.",
          "State every architectural decision as a trade-off: 'We gain strong consistency at the expense of write availability under partition'.",
          "Continuously check in with the interviewer: 'Does this match the scale profile you had in mind before we dive into caching?'",
        ],
        practicalSteps: [
          { step: "1. Scope & Scale Estimation", detail: "Calculate daily active users, requests per second, and storage growth over 5 years." },
          { step: "2. High-Level Blueprint", detail: "Define API contracts, data models, and primary system flow from client to storage." },
          { step: "3. Deep-Dive Bottlenecks", detail: "Analyze single points of failure, partition tolerance, caching layers, and database sharding." },
        ],
      },
    },
  ];

  return (
    <section id="resources" className="py-24 bg-[#F8F6F2] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDD7CB]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE4D7] border border-[#DDD7CB] text-[11px] font-mono uppercase tracking-wider text-[#6B6E6A]">
              <BookOpen size={12} className="text-[#A97858]" />
              <span>Signal Science & Knowledge</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#15171A] leading-tight tracking-tight">
              Curated frameworks for the thoughtful communicator.
            </h2>

            <p className="text-[#6E716C] text-sm sm:text-base leading-relaxed">
              Explore evidence-backed guides on vocal acoustic cadence, kinesic composure landmarks, and structured interview rubrics.
            </p>
          </div>

          <div className="text-xs font-mono text-[#8C8983] shrink-0">
            <span>4 Complete Frameworks Available</span>
          </div>
        </div>

        {/* Resources Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((res) => (
            <div
              key={res.id}
              onClick={() => setSelectedResource(res)}
              className="bg-white rounded-2xl border border-[#DDD7CB] p-8 shadow-[0_2px_10px_rgba(21,23,26,0.02)] hover:border-[#15171A] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A97858] font-semibold">
                    {res.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E6E1D6] text-[#707582]">
                      {res.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#8C8983] flex items-center gap-1">
                      <Clock size={11} />
                      {res.readTime}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#15171A] group-hover:text-[#A97858] transition-colors leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#575A60] leading-relaxed">
                  {res.summary}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F5F1E8] flex items-center justify-between text-xs font-medium text-[#15171A] group-hover:text-[#A97858] transition-colors">
                <span>Read Full Framework</span>
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Reading View */}
        {selectedResource && (
          <div className="fixed inset-0 z-50 bg-[#15171A]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative space-y-8">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#FAF7F0] hover:bg-[#EAE4D7] text-[#15171A] flex items-center justify-center transition-colors cursor-pointer border border-[#DDD7CB]"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97858] font-semibold">
                    {selectedResource.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#8C8983] flex items-center gap-1">
                    <Clock size={12} />
                    {selectedResource.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A] leading-tight">
                  {selectedResource.title}
                </h3>
              </div>

              {/* Overview */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#EAE4D7] text-xs sm:text-sm text-[#4A4E54] leading-relaxed">
                {selectedResource.content.overview}
              </div>

              {/* Key Takeaways */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#15171A] font-bold">
                  Core Scientific Principles
                </h4>
                <div className="space-y-2">
                  {selectedResource.content.keyTakeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#33373C] leading-relaxed">
                      <CheckCircle2 size={16} className="text-[#708C74] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#15171A] font-bold">
                  Actionable Execution Protocol
                </h4>
                <div className="space-y-3">
                  {selectedResource.content.practicalSteps.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#EAE4D7] bg-[#FFFFFF] space-y-1">
                      <div className="font-semibold text-xs text-[#15171A]">{step.step}</div>
                      <div className="text-xs text-[#63676D] leading-relaxed">{step.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example if present */}
              {selectedResource.content.sampleExample && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983] font-semibold">
                    Verbatim Reference Script
                  </div>
                  <p className="text-xs font-serif italic text-[#15171A] leading-relaxed">
                    {selectedResource.content.sampleExample}
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#DDD7CB] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#15171A] text-[#F7F4EE] text-xs font-medium hover:bg-[#2C3035] transition cursor-pointer"
                >
                  Close Framework
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
