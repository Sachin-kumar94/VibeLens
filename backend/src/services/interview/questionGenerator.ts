import { prisma } from "../prisma.service.js";
import { geminiClient } from "../ai/geminiClient.js";

export interface QuestionValidationResult {
  isValid: boolean;
  qualityScore: number; // 0 - 100
  reasons: string[];
}

export interface GeneratedQuestionPayload {
  question: string;
  category: string;
  subCategory?: string;
  role: string;
  roles?: string[];
  interviewTypes?: string[];
  difficulty: "Easy" | "Intermediate" | "Advanced" | "Expert";
  tags?: string[];
  skills?: string[];
  criteria: string;
  whyThisQuestion: string;
  timeTargetMin: number;
  timeTargetMax: number;
  expectedConcepts: string[];
  acceptableConcepts: string[];
  commonMistakes: string[];
  referenceAnswer: string;
  hints: string[];
  followUpTemplates: string[];
  rubric: {
    structure: number;
    relevance: number;
    clarity: number;
    delivery: number;
    evidence: number;
    methodology?: string;
  };
}

/**
 * Validate generated question before exposing to user
 */
export async function validateGeneratedQuestion(
  q: Partial<GeneratedQuestionPayload>,
  targetRole: string,
  targetDifficulty: string
): Promise<QuestionValidationResult> {
  const reasons: string[] = [];
  let score = 100;

  // 1. Text presence and length
  if (!q.question || q.question.trim().length < 15) {
    return { isValid: false, qualityScore: 0, reasons: ["Question text is too short or missing."] };
  }

  // 2. Question mark check
  if (!q.question.includes("?")) {
    score -= 10;
    reasons.push("Question did not end with a question mark.");
  }

  // 3. Expected concepts completeness
  if (!Array.isArray(q.expectedConcepts) || q.expectedConcepts.length < 2) {
    score -= 20;
    reasons.push("Lacks sufficient expected concepts for structured evaluation.");
  }

  // 4. Reference answer check
  if (!q.referenceAnswer || q.referenceAnswer.length < 30) {
    score -= 20;
    reasons.push("Reference answer is too brief or missing.");
  }

  // 5. Duplicate check against database
  const duplicate = await prisma.interviewQuestion.findFirst({
    where: { question: q.question.trim() },
  });
  if (duplicate) {
    return { isValid: false, qualityScore: 10, reasons: ["Question already exists in question bank."] };
  }

  return {
    isValid: score >= 60,
    qualityScore: Math.max(0, score),
    reasons,
  };
}

/**
 * Generate questions dynamically from a Job Description or Resume
 */
export async function generateDynamicQuestionsFromText(params: {
  userId: string;
  sourceText: string;
  sourceType: "job_description" | "resume" | "custom_role";
  role: string;
  difficulty?: "Easy" | "Intermediate" | "Advanced" | "Expert";
  interviewType?: string;
  count?: number;
}) {
  const count = Math.min(5, Math.max(1, params.count || 3));
  const difficulty = params.difficulty || "Intermediate";

  // Prompt Gemini or fall back to domain heuristic generator
  const generated: GeneratedQuestionPayload[] = [];

  try {
    const aiQuestions = await geminiClient.generateQuestionsFromContext({
      contextText: params.sourceText,
      role: params.role,
      difficulty,
      interviewType: params.interviewType || "Technical",
      count,
    });

    if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
      for (const raw of aiQuestions) {
        const payload: GeneratedQuestionPayload = {
          question: raw.question,
          category: raw.category || "Technical Fundamentals",
          subCategory: raw.subCategory || "Dynamic Domain Analysis",
          role: params.role,
          roles: [params.role, "Software Engineer"],
          interviewTypes: [params.interviewType || "Technical"],
          difficulty,
          tags: raw.tags || ["custom-domain", params.role.toLowerCase().replace(/\s+/g, "-")],
          skills: raw.skills || [params.role],
          criteria: raw.criteria || "Clear conceptual understanding, practical architectural experience, and explicit trade-offs.",
          whyThisQuestion: raw.whyThisQuestion || `Tailored from candidate's ${params.sourceType.replace(/_/g, " ")}.`,
          timeTargetMin: 60,
          timeTargetMax: 90,
          expectedConcepts: raw.expectedConcepts || [
            "Clear technical rationale for chosen patterns",
            "Consideration of scalability and maintenance",
            "Concrete example from past experience"
          ],
          acceptableConcepts: raw.acceptableConcepts || ["Alternative library or framework trade-offs"],
          commonMistakes: raw.commonMistakes || ["Vague assertions without technical specifics"],
          referenceAnswer: raw.referenceAnswer || "A complete response addresses technical constraints, architectural choices, and lessons learned.",
          hints: raw.hints || [
            "Think about why you or the team selected this approach.",
            "Discuss the primary challenge encountered."
          ],
          followUpTemplates: raw.followUpTemplates || [
            "What would you do differently if rebuilding this today?",
            "How did you validate performance under peak load?"
          ],
          rubric: {
            structure: 25,
            relevance: 30,
            clarity: 20,
            delivery: 15,
            evidence: 10,
            methodology: "TECHNICAL_DESIGN",
          },
        };

        const validation = await validateGeneratedQuestion(payload, params.role, difficulty);
        if (validation.isValid) {
          generated.push(payload);
        }
      }
    }
  } catch (err) {
    console.log("▲ Dynamic AI question generation note:", (err as any)?.message || err);
  }

  // If AI generation yielded fewer questions than requested, use rule-based fallback
  if (generated.length < count) {
    const textLower = params.sourceText.toLowerCase();

    if (textLower.includes("graphql") || textLower.includes("rest") || textLower.includes("api")) {
      generated.push({
        question: `When building services for ${params.role}, how do you evaluate whether to expose a RESTful API versus GraphQL for frontend consumers?`,
        category: "Product & Architecture",
        subCategory: "API Design",
        role: params.role,
        roles: [params.role, "Full Stack Developer", "Backend Developer"],
        interviewTypes: ["Technical", "System Design"],
        difficulty,
        tags: ["api", "rest", "graphql", "architecture"],
        skills: ["API Design", "Network Optimization"],
        criteria: "Addresses over-fetching/under-fetching, caching simplicity (HTTP vs client cache), schema governance, and team ergonomics.",
        whyThisQuestion: "Derived from API design and service communication responsibilities.",
        timeTargetMin: 60,
        timeTargetMax: 90,
        expectedConcepts: [
          "REST uses standard HTTP methods and status codes with straightforward CDN and browser caching",
          "GraphQL solves over-fetching and under-fetching by allowing client-specified query payloads",
          "GraphQL introduces complexity in query depth limiting, N+1 database queries, and response caching"
        ],
        acceptableConcepts: [
          "DataLoader pattern for batching",
          "Persisted queries for security and caching"
        ],
        commonMistakes: [
          "Claiming GraphQL is always faster than REST",
          "Ignoring the complexity of server-side caching in GraphQL"
        ],
        referenceAnswer: "REST leverages standard HTTP caching and is simpler to operate with robust CDN support. GraphQL solves over-fetching and allows clients to fetch complex nested data in a single request, but adds server complexity like DataLoader batching, schema evolution governance, and complex caching strategies.",
        hints: [
          "Consider caching, client flexibility, and network overhead.",
          "Think about who consumes the API (internal mobile apps vs third-party partners)."
        ],
        followUpTemplates: [
          "How do you resolve N+1 query execution bottlenecks in GraphQL resolvers?",
          "How do you secure GraphQL endpoints against maliciously nested or recursive queries?"
        ],
        rubric: {
          structure: 25,
          relevance: 25,
          clarity: 25,
          delivery: 15,
          evidence: 10,
          methodology: "TECHNICAL_DESIGN",
        },
      });
    }

    if (generated.length < count) {
      generated.push({
        question: `In your work as a ${params.role}, tell me about a time you encountered a critical production incident. What was your diagnosis methodology?`,
        category: "Project Discussion",
        subCategory: "Production Debugging",
        role: params.role,
        roles: [params.role, "Software Engineer"],
        interviewTypes: ["Project", "Problem Solving", "Technical"],
        difficulty,
        tags: ["debugging", "incident-response", "observability"],
        skills: ["Root Cause Analysis", "Observability", "Production Systems"],
        criteria: "Systematic elimination of hypotheses, observability tool utilization (logs, APM, metrics), containment, and blameless post-mortem actions.",
        whyThisQuestion: "Evaluates incident composure and structured troubleshooting under pressure.",
        timeTargetMin: 75,
        timeTargetMax: 105,
        expectedConcepts: [
          "Triage and containment: Mitigating customer impact before prolonged debugging (rollback or traffic shedding)",
          "Data-driven diagnosis: Utilizing telemetry, trace IDs, distributed logs, or metrics anomalies",
          "Permanent resolution and blameless post-mortem with preventative monitoring alerts"
        ],
        acceptableConcepts: [
          "Canary deployment verification",
          "Feature flag killswitches"
        ],
        commonMistakes: [
          "Describing panic or guessing code fixes in production without metrics",
          "Blaming a teammate or vendor rather than identifying systemic safeguards"
        ],
        referenceAnswer: "During a severe production degradation, my first priority was containment: rolling back the latest deploy to restore service while saving heap dumps and access logs for analysis. Using our APM traces, I isolated a connection leak caused by an unclosed transaction block. After deploying a verified hotfix to a staging replica, we applied it to production and instituted automated connection pool alerts to prevent recurrence.",
        hints: [
          "Structure your response: Detection -> Containment -> Root Cause -> Prevention.",
          "Highlight specific metrics and observability tools you used."
        ],
        followUpTemplates: [
          "What safeguards or automated tests did you add to ensure that specific failure mode cannot recur?",
          "How did you keep executive and support stakeholders informed during the active outage?"
        ],
        rubric: {
          structure: 30,
          relevance: 25,
          clarity: 20,
          delivery: 15,
          evidence: 10,
          methodology: "STAR",
        },
      });
    }
  }

  // Save validated generated questions to DB for user
  const savedRecords = [];
  for (const q of generated) {
    const rec = await prisma.interviewQuestion.create({
      data: {
        userId: params.userId,
        category: q.category,
        subCategory: q.subCategory,
        role: q.role,
        roles: JSON.stringify(q.roles || [q.role]),
        interviewTypes: JSON.stringify(q.interviewTypes || ["Technical"]),
        difficulty: q.difficulty,
        tags: JSON.stringify(q.tags || []),
        skills: JSON.stringify(q.skills || []),
        question: q.question,
        criteria: q.criteria,
        whyThisQuestion: q.whyThisQuestion,
        timeTargetMin: q.timeTargetMin,
        timeTargetMax: q.timeTargetMax,
        expectedConcepts: JSON.stringify(q.expectedConcepts),
        acceptableConcepts: JSON.stringify(q.acceptableConcepts),
        commonMistakes: JSON.stringify(q.commonMistakes),
        referenceAnswer: q.referenceAnswer,
        rubric: JSON.stringify(q.rubric),
        followUpTemplates: JSON.stringify(q.followUpTemplates),
        hints: JSON.stringify(q.hints),
        isCustom: true,
        source: params.sourceType === "job_description" ? "ai_jd" : params.sourceType === "resume" ? "ai_resume" : "user",
        sourceType: params.sourceType === "job_description" ? "JOB_DESCRIPTION" : params.sourceType === "resume" ? "RESUME" : "STANDARD",
      },
    });
    savedRecords.push(rec);
  }

  return savedRecords;
}

/**
 * Generate questions strictly grounded in actual resume facts (Sections 6-11)
 * Without hallucinating unmentioned technologies.
 */
export async function generateResumeGroundedQuestions(params: {
  userId: string;
  role: string;
  difficulty?: "Easy" | "Intermediate" | "Advanced" | "Expert";
  count?: number;
}) {
  const difficulty = params.difficulty || "Intermediate";
  const count = Math.min(4, Math.max(1, params.count || 2));

  // 1. Fetch latest active resume profile
  const resume = await prisma.resumeProfile.findFirst({
    where: { userId: params.userId },
    orderBy: { createdAt: "desc" },
    include: { document: true },
  });

  if (!resume) {
    return [];
  }

  const projects: Array<{ name: string; description: string; technologies: string[] }> = JSON.parse(
    resume.projects || "[]"
  );
  const skills: string[] = JSON.parse(resume.skills || "[]");
  const experience: Array<{ role: string; organization: string; details: string[] }> = JSON.parse(
    resume.experience || "[]"
  );

  const generatedQuestions = [];

  // Generate for actual projects
  for (const proj of projects.slice(0, count)) {
    if (!proj.name || proj.name === "Unavailable") continue;

    const techList = proj.technologies && proj.technologies.length > 0 ? proj.technologies.join(", ") : "its core stack";
    const qText = `In your resume, you built "${proj.name}" using ${techList}. Can you walk me through the system architecture, how the components communicate, and what the hardest technical challenge was?`;

    // Avoid duplicate
    const existing = await prisma.interviewQuestion.findFirst({
      where: { userId: params.userId, question: qText },
    });

    if (!existing) {
      const created = await prisma.interviewQuestion.create({
        data: {
          userId: params.userId,
          category: "Project Discussion",
          subCategory: proj.name,
          role: params.role,
          roles: JSON.stringify([params.role, "Software Engineer"]),
          interviewTypes: JSON.stringify(["Project", "Technical"]),
          difficulty,
          tags: JSON.stringify(["resume", "project", proj.name.toLowerCase().replace(/\s+/g, "-")]),
          skills: JSON.stringify(proj.technologies.length > 0 ? proj.technologies : [params.role]),
          question: qText,
          criteria: `Clear explanation of ${proj.name} architecture, concrete personal technical contribution, and handling of technical constraints.`,
          whyThisQuestion: `Grounded in your resume project "${proj.name}". Evaluates real-world system building and engineering depth.`,
          timeTargetMin: 90,
          timeTargetMax: 120,
          expectedConcepts: JSON.stringify([
            `High-level data flow and component topology of ${proj.name}`,
            `Rationale for choosing ${techList}`,
            "Specific engineering bottleneck (performance, concurrency, state, or persistence) and resolution",
          ]),
          acceptableConcepts: JSON.stringify([
            "Alternative architectural patterns evaluated",
            "Lessons learned or design decisions that would be refactored",
          ]),
          commonMistakes: JSON.stringify([
            "Giving only high-level marketing overview without architectural mechanics",
            "Failing to articulate personal hands-on code contribution vs team scope",
          ]),
          referenceAnswer: `A strong answer outlines ${proj.name}'s architecture from client request to data store, explains the trade-offs of using ${techList}, describes a concrete technical barrier (such as latency, data synchronization, or auth flow), and explains how it was measured and resolved.`,
          hints: JSON.stringify([
            "Structure: Problem -> Architecture -> Personal Contribution -> Hardest Challenge.",
            `Be specific about where and why ${techList} was used.`,
          ]),
          followUpTemplates: JSON.stringify([
            `If ${proj.name} scaled to 100x the concurrent user load, what part of the architecture would bottleneck first?`,
            "What automated testing or deployment strategy did you implement for this project?",
          ]),
          rubric: JSON.stringify({
            structure: 25,
            relevance: 25,
            clarity: 25,
            delivery: 15,
            evidence: 10,
            methodology: "PROJECT_ARCHITECTURE",
          }),
          source: "resume",
          sourceType: "RESUME",
          sourceDocumentId: resume.documentId,
          sourceCitation: `${resume.document?.filename || "Resume.pdf"} — Projects`,
          page: 1,
          section: "Projects",
          isCustom: true,
        },
      });
      generatedQuestions.push(created);
    }
  }

  // Generate for actual experience or skill if needed
  if (generatedQuestions.length < count && experience.length > 0) {
    const exp = experience[0];
    if (exp.role && exp.organization) {
      const qText = `At ${exp.organization} as a ${exp.role}, what was the most complex technical initiative you spearheaded, and how did you measure its engineering outcome?`;
      const existing = await prisma.interviewQuestion.findFirst({
        where: { userId: params.userId, question: qText },
      });
      if (!existing) {
        const created = await prisma.interviewQuestion.create({
          data: {
            userId: params.userId,
            category: "Executive Leadership",
            subCategory: exp.organization,
            role: params.role,
            roles: JSON.stringify([params.role]),
            interviewTypes: JSON.stringify(["Behavioral", "Project"]),
            difficulty,
            tags: JSON.stringify(["resume", "experience", exp.organization.toLowerCase()]),
            skills: JSON.stringify(skills.slice(0, 3)),
            question: qText,
            criteria: "Concrete business or engineering problem statement, quantified impact, technical ownership, and stakeholder collaboration.",
            whyThisQuestion: `Grounded in your work history at ${exp.organization}.`,
            timeTargetMin: 90,
            timeTargetMax: 120,
            expectedConcepts: JSON.stringify([
              `Context of the project at ${exp.organization}`,
              "Personal engineering contribution and technical decision-making",
              "Measurable outcome (performance gain, reliability increase, or user delivery)",
            ]),
            acceptableConcepts: JSON.stringify(["Cross-functional coordination and peer code reviews"]),
            commonMistakes: JSON.stringify(["Passive language without clear personal ownership"]),
            referenceAnswer: `A compelling answer follows STAR: Situation at ${exp.organization}, the specific architectural Task, the personal engineering Action taken, and the measurable Result achieved.`,
            hints: JSON.stringify(["Use the STAR methodology: Situation, Task, Action, Result."]),
            followUpTemplates: JSON.stringify([
              "What technical compromise or trade-off did you have to negotiate with teammates during this initiative?",
            ]),
            rubric: JSON.stringify({
              structure: 30,
              relevance: 25,
              clarity: 20,
              delivery: 15,
              evidence: 10,
              methodology: "STAR",
            }),
            source: "resume",
            sourceType: "RESUME",
            sourceDocumentId: resume.documentId,
            sourceCitation: `${resume.document?.filename || "Resume.pdf"} — Experience`,
            page: 1,
            section: "Experience",
            isCustom: true,
          },
        });
        generatedQuestions.push(created);
      }
    }
  }

  return generatedQuestions;
}

/**
 * Generate questions grounded in uploaded Study Materials (Books, Notes, PDFs)
 * Retaining exact page number and section citations (Sections 15-21, 36-37)
 */
export async function generateStudyMaterialGroundedQuestions(params: {
  userId: string;
  role: string;
  difficulty?: "Easy" | "Intermediate" | "Advanced" | "Expert";
  count?: number;
}) {
  const difficulty = params.difficulty || "Intermediate";
  const count = Math.min(4, Math.max(1, params.count || 2));

  // Find active study materials
  const studyDocs = await prisma.userDocument.findMany({
    where: {
      userId: params.userId,
      sourceType: "STUDY_MATERIAL",
      status: "READY",
      isSelectedForInterview: true,
    },
    include: {
      chunks: {
        take: 10,
        orderBy: { page: "asc" },
      },
    },
  });

  if (studyDocs.length === 0) return [];

  const generatedQuestions = [];

  for (const doc of studyDocs) {
    if (generatedQuestions.length >= count) break;

    // Pick chunks with substantive content
    const viableChunks = doc.chunks.filter((c) => c.text && c.text.length >= 120);
    for (const chunk of viableChunks) {
      if (generatedQuestions.length >= count) break;

      const sectionName = chunk.section || "General";
      const citation = `${doc.filename} — Page ${chunk.page}${sectionName !== "General" ? ` (${sectionName})` : ""}`;

      // Check if question already generated from this chunk
      const existing = await prisma.interviewQuestion.findFirst({
        where: { userId: params.userId, sourceChunkId: chunk.id },
      });
      if (existing) continue;

      // Create a conceptual / application question based on chunk section and text
      let qText = "";
      let category = "Technical Fundamentals";

      const sectionLower = sectionName.toLowerCase();
      if (sectionLower.includes("normaliz") || sectionLower.includes("dbms") || sectionLower.includes("database") || sectionLower.includes("sql")) {
        qText = `Based on your study notes in ${doc.filename}, explain the core principles of database normalization and why 3NF or BCNF is typically targeted in relational design.`;
        category = "Technical Fundamentals";
      } else if (sectionLower.includes("network") || sectionLower.includes("tcp") || sectionLower.includes("http")) {
        qText = `According to your study materials in ${doc.filename}, how does TCP achieve reliable, ordered transmission over an unreliable IP layer, and what is the trade-off with UDP?`;
        category = "Technical Fundamentals";
      } else if (sectionLower.includes("os") || sectionLower.includes("operating") || sectionLower.includes("thread") || sectionLower.includes("concurrency")) {
        qText = `From your study materials in ${doc.filename}, what is the distinction between process-level and thread-level concurrency, and how are race conditions prevented?`;
        category = "Technical Fundamentals";
      } else if (sectionLower.includes("system design") || sectionLower.includes("scaling") || sectionLower.includes("cache")) {
        qText = `In ${doc.filename}, discuss the primary trade-offs between cache-aside and write-through caching strategies when scaling distributed reads.`;
        category = "Product & Architecture";
      } else {
        const cleanHeading = sectionName !== "General" ? sectionName : doc.title;
        qText = `Based on your uploaded material "${doc.filename}" covering ${cleanHeading}, how would you explain the core concepts and trade-offs of this topic in an engineering interview?`;
      }

      const created = await prisma.interviewQuestion.create({
        data: {
          userId: params.userId,
          category,
          subCategory: sectionName,
          role: params.role,
          roles: JSON.stringify([params.role, "Software Engineer"]),
          interviewTypes: JSON.stringify(["Technical", "Problem Solving"]),
          difficulty,
          tags: JSON.stringify(["study-material", doc.type, sectionName.toLowerCase().replace(/\s+/g, "-")]),
          skills: JSON.stringify([sectionName, params.role]),
          question: qText,
          criteria: `Demonstrates conceptual grasp of ${sectionName}, accurate mechanics, and source-grounded reasoning from ${doc.filename}.`,
          whyThisQuestion: `Derived directly from your study material: ${citation}.`,
          timeTargetMin: 75,
          timeTargetMax: 100,
          expectedConcepts: JSON.stringify([
            `Core definitions and structural mechanics of ${sectionName}`,
            "Practical trade-offs and edge cases discussed in the text",
            "Clear technical application in engineering scenarios",
          ]),
          acceptableConcepts: JSON.stringify([
            "Alternative industry terminology or complementary frameworks",
          ]),
          commonMistakes: JSON.stringify([
            "Vague high-level definitions without structural reasoning",
            "Confusing complementary concepts",
          ]),
          referenceAnswer: `A thorough response explains the underlying mechanics presented in ${doc.filename}, compares valid trade-offs, and illustrates with an applied example.`,
          hints: JSON.stringify([
            `Recall the key definitions from ${citation}.`,
            "Explain both the mechanism and the reason for using it.",
          ]),
          followUpTemplates: JSON.stringify([
            "How does this concept behave when system throughput or data scale increases significantly?",
            "Can you give an example where applying this pattern would be an anti-pattern?",
          ]),
          rubric: JSON.stringify({
            structure: 25,
            relevance: 30,
            clarity: 25,
            delivery: 10,
            evidence: 10,
            methodology: "TECHNICAL_CONCEPTS",
          }),
          source: "study_material",
          sourceType: "STUDY_MATERIAL",
          sourceDocumentId: doc.id,
          sourceChunkId: chunk.id,
          sourceCitation: citation,
          page: chunk.page,
          section: chunk.section,
          isCustom: true,
        },
      });

      generatedQuestions.push(created);
    }
  }

  return generatedQuestions;
}

