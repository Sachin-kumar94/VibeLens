import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      id: "free",
      name: "Starter",
      badge: null,
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "forever",
      description: "Essential personal composure diagnostics and basic practice sessions.",
      features: [
        "Single-stream vocal & facial composure checks",
        "3 practice simulations per month",
        "Radial composure profile & baseline telemetry",
        "Local privacy encryption (zero server recording storage)",
        "Standard community question bank",
      ],
      ctaText: "Start Free Practice",
      isPrimary: false,
    },
    {
      id: "pro",
      name: "Pro Practice",
      badge: "MOST POPULAR",
      priceMonthly: "$24",
      priceAnnual: "$19",
      period: "per month",
      description: "Real-time multimodal AI coaching for career-defining interviews & speeches.",
      features: [
        "Unlimited practice sessions (Interview, Voice, Body, Presentation)",
        "Real-time Gemini 3.8 AI turn-by-turn STAR coaching",
        "Vocal cadence (WPM), pitch jitter & filler-word detection",
        "Slide deck rehearsal with gaze calibration & posture tracking",
        "Side-by-side longitudinal session comparisons",
        "Exportable PDF executive performance dossiers",
      ],
      ctaText: "Get Started with Pro",
      isPrimary: true,
    },
    {
      id: "team",
      name: "Executive & Team",
      badge: "ENTERPRISE READY",
      priceMonthly: "$79",
      priceAnnual: "$64",
      period: "per seat / month",
      description: "Tailored candidate assessment rubrics and private cohort analytics.",
      features: [
        "Everything in Pro included for all members",
        "Custom role rubrics & private company question banks",
        "Multi-interviewer scorecards & consensus dashboards",
        "High-throughput ONNX multimodal inference queue",
        "Dedicated SAML / Okta SSO & audit logs",
        "Quarterly executive communication coaching workshop",
      ],
      ctaText: "Start Team Trial",
      isPrimary: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE4D7] border border-[#DDD7CB] text-[11px] font-mono uppercase tracking-wider text-[#6B6E6A]">
            <Sparkles size={12} className="text-[#A97858]" />
            <span>Transparent Investment</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#15171A] leading-tight tracking-tight">
            Simple, honest pricing for lasting communication poise.
          </h2>

          <p className="text-[#6E716C] text-sm sm:text-base leading-relaxed">
            Begin with free foundational tools. Upgrade when you are preparing for high-stakes interviews, executive briefings, or keynote presentations.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-medium cursor-pointer transition ${
                billingCycle === "monthly" ? "text-[#15171A] font-semibold" : "text-[#8C8983]"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly billing
            </span>

            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-12 h-6 bg-[#DDD7CB] rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none"
              aria-label="Toggle billing frequency"
            >
              <div
                className={`w-5 h-5 bg-[#15171A] rounded-full shadow-md transform transition-transform duration-200 ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-xs font-medium cursor-pointer transition flex items-center gap-1.5 ${
                billingCycle === "annual" ? "text-[#15171A] font-semibold" : "text-[#8C8983]"
              }`}
              onClick={() => setBillingCycle("annual")}
            >
              <span>Annual billing</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#708C74]/15 text-[#4D6D51] font-semibold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  plan.isPrimary
                    ? "bg-[#FFFFFF] border-2 border-[#15171A] shadow-[0_12px_32px_rgba(21,23,26,0.08)] scale-[1.02] lg:-translate-y-2 z-10"
                    : "bg-[#FAF7F0] border border-[#DDD7CB] shadow-[0_2px_8px_rgba(21,23,26,0.02)] hover:border-[#15171A] hover:bg-[#FFFFFF]"
                }`}
              >
                {/* Badge if present */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#15171A] text-[#F6F3EC] text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-semibold shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Desc */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#15171A]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#707582] mt-2 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-[#EAE4D7] flex items-baseline gap-2">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-[#15171A]">
                      {price}
                    </span>
                    <span className="text-xs font-mono text-[#8C8983]">
                      {plan.period}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-[#EAE4D7]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983] font-semibold">
                      What's Included:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#3D4044] leading-relaxed">
                          <div className="w-4 h-4 rounded-full bg-[#708C74]/15 text-[#4D6D51] flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={2.5} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3 px-5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                      plan.isPrimary
                        ? "bg-[#15171A] text-[#F7F4EE] hover:bg-[#2C3035] shadow-md hover:shadow-lg"
                        : "bg-white border border-[#DDD7CB] text-[#15171A] hover:border-[#15171A] hover:bg-[#F6F3EC]"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Trust Bar */}
        <div className="pt-8 border-t border-[#DDD7CB] flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-[#707582]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#708C74]" />
            <span>14-day full satisfaction money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#708C74]" />
            <span>Zero biometric resale or commercial ad tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#708C74]" />
            <span>Cancel, pause or switch plans anytime in one click</span>
          </div>
        </div>

      </div>
    </section>
  );
};
