import { prisma } from "../prisma.service.js";
import {
  generateResumeGroundedQuestions,
  generateStudyMaterialGroundedQuestions,
} from "./questionGenerator.js";

export interface QuestionFilterCriteria {
  role?: string;
  interviewType?: string;
  category?: string;
  difficulty?: string;
  skills?: string[];
  search?: string;
  excludeQuestionIds?: string[];
  customOnly?: boolean;
  userId?: string;
  sourceType?: string;
  limit?: number;
}

export interface QuestionSelectionOptions {
  sessionId?: string;
  userId: string;
  role: string;
  interviewType: string;
  category?: string;
  difficulty?: string;
  questionCount: number;
  questionSources?: string[]; // ["RESUME", "JOB_DESCRIPTION", "STUDY_MATERIAL", "STANDARD", "CUSTOM"]
  excludeQuestionIds?: string[];
}

/**
 * Filter questions from Prisma database using priority matching
 */
export async function queryFilteredQuestions(criteria: QuestionFilterCriteria) {
  const where: any = {
    OR: [
      { isCustom: false },
      ...(criteria.userId ? [{ isCustom: true, userId: criteria.userId }] : []),
    ],
  };

  if (criteria.customOnly && criteria.userId) {
    where.OR = [{ isCustom: true, userId: criteria.userId }];
  }

  // Exclude already asked questions
  if (criteria.excludeQuestionIds && criteria.excludeQuestionIds.length > 0) {
    where.id = { notIn: criteria.excludeQuestionIds };
  }

  // Category filter
  if (criteria.category && criteria.category !== "All") {
    where.category = criteria.category;
  }

  // Difficulty filter
  if (criteria.difficulty && criteria.difficulty !== "All" && criteria.difficulty !== "Mixed") {
    where.difficulty = criteria.difficulty;
  }

  // Source type filter
  if (criteria.sourceType) {
    where.sourceType = criteria.sourceType;
  }

  // Search filter
  if (criteria.search) {
    where.question = { contains: criteria.search };
  }

  const allQuestions = await prisma.interviewQuestion.findMany({
    where,
    orderBy: [{ category: "asc" }, { difficulty: "asc" }],
  });

  // Filter in memory for role and interviewType JSON arrays or exact string matches
  const targetRole =
    criteria.role && criteria.role !== "All" && criteria.role !== "General"
      ? criteria.role
      : null;
  const targetType =
    criteria.interviewType &&
    criteria.interviewType !== "All" &&
    criteria.interviewType !== "Custom"
      ? criteria.interviewType
      : null;

  return allQuestions.filter((q) => {
    // 1. Role match
    if (targetRole) {
      let roleMatches =
        q.role === targetRole ||
        q.role === "General" ||
        q.role === "Software Engineer";
      if (!roleMatches && q.roles) {
        try {
          const rolesArr: string[] = JSON.parse(q.roles);
          if (
            Array.isArray(rolesArr) &&
            (rolesArr.includes(targetRole) || rolesArr.includes("All"))
          ) {
            roleMatches = true;
          }
        } catch (e) {}
      }
      if (!roleMatches) return false;
    }

    // 2. Interview Type match
    if (targetType) {
      let typeMatches = q.category.toLowerCase().includes(targetType.toLowerCase());
      if (q.interviewTypes) {
        try {
          const typesArr: string[] = JSON.parse(q.interviewTypes);
          if (
            Array.isArray(typesArr) &&
            typesArr.some((t) => t.toLowerCase() === targetType.toLowerCase())
          ) {
            typeMatches = true;
          }
        } catch (e) {}
      }
      if (
        !typeMatches &&
        targetType === "Technical" &&
        (q.category === "Technical Fundamentals" ||
          q.category === "System Design" ||
          q.category === "Product & Architecture")
      ) {
        typeMatches = true;
      }
      if (
        !typeMatches &&
        targetType === "Behavioral" &&
        (q.category === "Behavioral Resilience" ||
          q.category === "Executive Leadership" ||
          q.category === "Communication")
      ) {
        typeMatches = true;
      }
      if (!typeMatches && targetType === "HR" && q.category === "HR / General") {
        typeMatches = true;
      }
      if (!typeMatches && targetType === "Project" && q.category === "Project Discussion") {
        typeMatches = true;
      }
      if (!typeMatches) return false;
    }

    // 3. Skill match
    if (criteria.skills && criteria.skills.length > 0 && q.skills) {
      try {
        const skillsArr: string[] = JSON.parse(q.skills);
        const hasSkillOverlap = criteria.skills.some((s) =>
          skillsArr.some((qs) => qs.toLowerCase().includes(s.toLowerCase()))
        );
        if (!hasSkillOverlap) return false;
      } catch (e) {}
    }

    return true;
  });
}

/**
 * Select a balanced sequence of questions for an interview practice session
 * Incorporating Resume, Job Description, Study Materials, and Standard Bank according to user configuration (Sections 22-23, 166).
 */
export async function selectSessionQuestions(options: QuestionSelectionOptions) {
  const activeSources = options.questionSources && options.questionSources.length > 0
    ? options.questionSources
    : ["STANDARD", "RESUME", "STUDY_MATERIAL", "JOB_DESCRIPTION"];

  const difficulty = (options.difficulty || "Intermediate") as any;

  // 1. Proactively generate resume questions if Resume is an active source
  if (activeSources.includes("RESUME")) {
    try {
      await generateResumeGroundedQuestions({
        userId: options.userId,
        role: options.role,
        difficulty,
        count: 2,
      });
    } catch (e) {
      console.warn("Resume question pre-generation notice:", e);
    }
  }

  // 2. Proactively generate study material questions if Study Material is an active source
  if (activeSources.includes("STUDY_MATERIAL")) {
    try {
      await generateStudyMaterialGroundedQuestions({
        userId: options.userId,
        role: options.role,
        difficulty,
        count: 2,
      });
    } catch (e) {
      console.warn("Study material question pre-generation notice:", e);
    }
  }

  // 3. Query all eligible questions for this user
  const eligible = await queryFilteredQuestions({
    userId: options.userId,
    role: options.role,
    interviewType: options.interviewType,
    category: options.category,
    difficulty: options.difficulty,
    excludeQuestionIds: options.excludeQuestionIds,
  });

  // 4. Partition by source type
  const resumePool: any[] = [];
  const studyPool: any[] = [];
  const jdPool: any[] = [];
  const standardPool: any[] = [];
  const customPool: any[] = [];

  for (const q of eligible) {
    const sType = q.sourceType || (q.isCustom ? "CUSTOM" : "STANDARD");
    if (sType === "RESUME") resumePool.push(q);
    else if (sType === "STUDY_MATERIAL") studyPool.push(q);
    else if (sType === "JOB_DESCRIPTION") jdPool.push(q);
    else if (sType === "CUSTOM") customPool.push(q);
    else standardPool.push(q);
  }

  const selected: any[] = [];
  const selectedIds = new Set<string>();

  const pickFromPool = (pool: any[], maxCount: number) => {
    for (const q of pool) {
      if (selected.length >= options.questionCount) break;
      if (maxCount <= 0) break;
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
        maxCount--;
      }
    }
  };

  // Target proportional allocation based on active sources
  const totalSlots = options.questionCount;
  const activeCount = activeSources.length;
  const slotsPerSource = Math.max(1, Math.floor(totalSlots / activeCount));

  // Prioritize active sources in sequence: Resume -> JD -> Study -> Standard
  if (activeSources.includes("RESUME") && resumePool.length > 0) {
    pickFromPool(resumePool, slotsPerSource);
  }
  if (activeSources.includes("JOB_DESCRIPTION") && jdPool.length > 0) {
    pickFromPool(jdPool, slotsPerSource);
  }
  if (activeSources.includes("STUDY_MATERIAL") && studyPool.length > 0) {
    pickFromPool(studyPool, slotsPerSource);
  }
  if (activeSources.includes("STANDARD") && standardPool.length > 0) {
    pickFromPool(standardPool, slotsPerSource);
  }
  if (activeSources.includes("CUSTOM") && customPool.length > 0) {
    pickFromPool(customPool, slotsPerSource);
  }

  // Fill any remaining slots from eligible pool
  if (selected.length < options.questionCount) {
    for (const q of eligible) {
      if (selected.length >= options.questionCount) break;
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
      }
    }
  }

  // If still below questionCount, fallback to standard pool
  if (selected.length < options.questionCount) {
    const fallback = await prisma.interviewQuestion.findMany({
      where: {
        isCustom: false,
        id: { notIn: Array.from(selectedIds) },
      },
      take: options.questionCount - selected.length,
    });
    for (const q of fallback) {
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
      }
    }
  }

  return selected.map((q) => {
    let parsedRubric = {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
    };
    try {
      parsedRubric = JSON.parse(q.rubric);
    } catch (e) {}

    let expectedConcepts: string[] = [];
    let acceptableConcepts: string[] = [];
    let commonMistakes: string[] = [];
    let hints: string[] = [];
    let followUpTemplates: string[] = [];
    let tags: string[] = [];
    let skills: string[] = [];

    try { if (q.expectedConcepts) expectedConcepts = JSON.parse(q.expectedConcepts); } catch (e) {}
    try { if (q.acceptableConcepts) acceptableConcepts = JSON.parse(q.acceptableConcepts); } catch (e) {}
    try { if (q.commonMistakes) commonMistakes = JSON.parse(q.commonMistakes); } catch (e) {}
    try { if (q.hints) hints = JSON.parse(q.hints); } catch (e) {}
    try { if (q.followUpTemplates) followUpTemplates = JSON.parse(q.followUpTemplates); } catch (e) {}
    try { if (q.tags) tags = JSON.parse(q.tags); } catch (e) {}
    try { if (q.skills) skills = JSON.parse(q.skills); } catch (e) {}

    return {
      ...q,
      sourceType: q.sourceType || (q.isCustom ? "CUSTOM" : "STANDARD"),
      sourceCitation: q.sourceCitation || (q.source === "system" ? "Standard Question Bank" : undefined),
      rubric: parsedRubric,
      expectedConcepts,
      acceptableConcepts,
      commonMistakes,
      hints,
      followUpTemplates,
      tags,
      skills,
    };
  });
}
