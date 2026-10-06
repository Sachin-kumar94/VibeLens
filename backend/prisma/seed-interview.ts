import { PrismaClient } from "@prisma/client";
import { SYSTEM_QUESTION_BANK } from "../src/services/interview/interviewQuestionBank.js";

const prisma = new PrismaClient();

export async function seedInterviewQuestions() {
  console.log("▲ Starting comprehensive interview question bank seed...");

  let createdCount = 0;
  let updatedCount = 0;

  for (const q of SYSTEM_QUESTION_BANK) {
    // Check if question already exists by exact text
    const existing = await prisma.interviewQuestion.findFirst({
      where: {
        question: q.question,
        isCustom: false,
      },
    });

    const questionData = {
      category: q.category,
      subCategory: q.subCategory || null,
      role: q.role,
      roles: JSON.stringify(q.roles || [q.role]),
      interviewTypes: JSON.stringify(q.interviewTypes || ["Technical"]),
      difficulty: q.difficulty,
      tags: JSON.stringify(q.tags || []),
      skills: JSON.stringify(q.skills || []),
      question: q.question,
      criteria: q.criteria,
      whyThisQuestion: q.whyThisQuestion || null,
      timeTargetMin: q.timeTargetMin || 60,
      timeTargetMax: q.timeTargetMax || 90,
      expectedConcepts: JSON.stringify(q.expectedConcepts || []),
      acceptableConcepts: JSON.stringify(q.acceptableConcepts || []),
      commonMistakes: JSON.stringify(q.commonMistakes || []),
      referenceAnswer: q.referenceAnswer || null,
      rubric: JSON.stringify(q.rubric),
      followUpTemplates: JSON.stringify(q.followUpTemplates || []),
      hints: JSON.stringify(q.hints || []),
      isCustom: false,
      source: "system",
    };

    if (existing) {
      await prisma.interviewQuestion.update({
        where: { id: existing.id },
        data: questionData,
      });
      updatedCount++;
    } else {
      await prisma.interviewQuestion.create({
        data: questionData,
      });
      createdCount++;
    }
  }

  console.log(`✓ Interview questions seed complete! Created: ${createdCount}, Updated: ${updatedCount}, Total in Bank: ${SYSTEM_QUESTION_BANK.length}`);
}

async function main() {
  try {
    await seedInterviewQuestions();
  } catch (error) {
    console.error("Error seeding interview questions:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed-interview.ts") || process.argv[1]?.endsWith("seed-interview.js")) {
  main();
}
