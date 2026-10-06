/**
 * Resume Analyzer
 * Generates normalized profile structures for resume knowledge-base and interview personalization.
 * Adheres strictly to Section 7 & 10: does not invent missing information.
 */

import { ResumeParser, StructuredResumeData } from "./resumeParser.js";

export interface NormalizedResumeProfile {
  profile: {
    name: string | "Unavailable";
    summary: string | "Unavailable";
  };
  education: Array<{
    institution: string;
    degree: string | "Unavailable";
    field: string | "Unavailable";
    dates: string | "Unavailable";
  }>;
  experience: Array<{
    organization: string;
    role: string;
    dates: string | "Unavailable";
    responsibilities: string[];
  }>;
  internships: Array<{
    organization: string;
    role: string;
    dates: string | "Unavailable";
    responsibilities: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    description: string;
    responsibilities: string[];
  }>;
  skills: string[];
  technologies: string[];
  certifications: string[];
  achievements: string[];
}

export class ResumeAnalyzer {
  /**
   * Analyzes raw resume text and returns a strictly grounded normalized profile
   */
  static analyze(rawText: string): NormalizedResumeProfile {
    const parsed = ResumeParser.parse(rawText);

    return {
      profile: {
        name: parsed.name || "Unavailable",
        summary: parsed.summary || "Unavailable",
      },
      education: parsed.education.map((e) => ({
        institution: e.institution,
        degree: e.degree || "Unavailable",
        field: e.field || "Unavailable",
        dates: e.dates || "Unavailable",
      })),
      experience: parsed.experience.map((exp) => ({
        organization: exp.organization,
        role: exp.role,
        dates: exp.dates || "Unavailable",
        responsibilities: exp.responsibilities,
      })),
      internships: parsed.internships.map((int) => ({
        organization: int.organization,
        role: int.role,
        dates: int.dates || "Unavailable",
        responsibilities: int.responsibilities,
      })),
      projects: parsed.projects.map((p) => ({
        name: p.name,
        technologies: p.technologies,
        description: p.description || "Project experience documented in resume.",
        responsibilities: p.responsibilities,
      })),
      skills: parsed.skills,
      technologies: parsed.technologies,
      certifications: parsed.certifications,
      achievements: parsed.achievements,
    };
  }

  /**
   * Extracts verifiable factual claims for interview question generation
   */
  static extractVerifiableFacts(profile: NormalizedResumeProfile): {
    projectFacts: Array<{ projectName: string; techs: string[]; details: string[] }>;
    experienceFacts: Array<{ role: string; org: string; highlights: string[] }>;
    declaredSkills: string[];
  } {
    const projectFacts = profile.projects.map((p) => ({
      projectName: p.name,
      techs: p.technologies,
      details: p.responsibilities.length > 0 ? p.responsibilities : [p.description],
    }));

    const experienceFacts = [...profile.experience, ...profile.internships].map((e) => ({
      role: e.role,
      org: e.organization,
      highlights: e.responsibilities,
    }));

    const declaredSkills = Array.from(new Set([...profile.skills, ...profile.technologies]));

    return {
      projectFacts,
      experienceFacts,
      declaredSkills,
    };
  }
}
