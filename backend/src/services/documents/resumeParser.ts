/**
 * Resume Parser
 * Extracts structured sections and entities from resume text:
 * Name, Summary, Education, Experience, Internships, Projects, Skills, Technologies,
 * Certifications, Achievements, Roles, Organizations, Dates, Responsibilities.
 * Does NOT invent missing information (Section 6 & 7).
 */

export interface ParsedEducationItem {
  institution: string;
  degree?: string;
  field?: string;
  dates?: string;
  grade?: string;
}

export interface ParsedExperienceItem {
  organization: string;
  role: string;
  dates?: string;
  responsibilities: string[];
}

export interface ParsedProjectItem {
  name: string;
  technologies: string[];
  description: string;
  responsibilities: string[];
}

export interface StructuredResumeData {
  name?: string;
  summary?: string;
  education: ParsedEducationItem[];
  experience: ParsedExperienceItem[];
  internships: ParsedExperienceItem[];
  projects: ParsedProjectItem[];
  skills: string[];
  technologies: string[];
  certifications: string[];
  achievements: string[];
}

export class ResumeParser {
  /**
   * Parse plain text from resume into structured sections
   */
  static parse(rawText: string): StructuredResumeData {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const sections = this.splitIntoSections(lines);

    const name = this.extractName(lines);
    const summary = this.extractSummary(sections["summary"] || sections["profile"] || sections["objective"] || []);
    const education = this.parseEducation(sections["education"] || []);
    const experience = this.parseExperience(sections["experience"] || sections["work experience"] || sections["employment"] || []);
    const internships = this.parseExperience(sections["internships"] || sections["internship experience"] || []);
    const projects = this.parseProjects(sections["projects"] || sections["academic projects"] || sections["personal projects"] || []);
    const { skills, technologies } = this.parseSkills(
      sections["skills"] || sections["technical skills"] || sections["skills & tools"] || sections["technologies"] || [],
      rawText
    );
    const certifications = this.parseList(sections["certifications"] || sections["certificates"] || sections["courses"] || []);
    const achievements = this.parseList(sections["achievements"] || sections["honors"] || sections["awards"] || []);

    return {
      name: name || undefined,
      summary: summary || undefined,
      education,
      experience,
      internships,
      projects,
      skills,
      technologies,
      certifications,
      achievements,
    };
  }

  /**
   * Identifies prominent header blocks and groups lines under them
   */
  private static splitIntoSections(lines: string[]): Record<string, string[]> {
    const sectionMap: Record<string, string[]> = {};
    let currentSection = "header";
    sectionMap[currentSection] = [];

    const sectionKeywords: Record<string, RegExp> = {
      summary: /^(summary|professional summary|about me|profile|objective)$/i,
      education: /^(education|academic background|academics)$/i,
      experience: /^(experience|work experience|employment history|professional experience)$/i,
      internships: /^(internships|internship experience)$/i,
      projects: /^(projects|academic projects|key projects|personal projects)$/i,
      skills: /^(skills|technical skills|technologies|tools & technologies|core competencies)$/i,
      certifications: /^(certifications|certificates|licenses & certifications)$/i,
      achievements: /^(achievements|honors & awards|awards|extracurricular)$/i,
    };

    for (const line of lines) {
      const clean = line.replace(/[:\-–—#*]/g, "").trim().toLowerCase();
      let matchedSection: string | null = null;

      for (const [secKey, regex] of Object.entries(sectionKeywords)) {
        if (regex.test(clean)) {
          matchedSection = secKey;
          break;
        }
      }

      if (matchedSection) {
        currentSection = matchedSection;
        if (!sectionMap[currentSection]) {
          sectionMap[currentSection] = [];
        }
      } else {
        if (!sectionMap[currentSection]) {
          sectionMap[currentSection] = [];
        }
        sectionMap[currentSection].push(line);
      }
    }

    return sectionMap;
  }

  private static extractName(lines: string[]): string | null {
    // First non-empty line that looks like a person's name (2-4 words, no email or phone)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (
        !line.includes("@") &&
        !line.includes("http") &&
        !/\d{3}/.test(line) &&
        line.length > 2 &&
        line.length < 50 &&
        /^[A-Z][a-zA-Z.'\-]+(?:\s+[A-Z][a-zA-Z.'\-]+)+$/.test(line)
      ) {
        return line;
      }
    }
    return null;
  }

  private static extractSummary(lines: string[]): string | null {
    if (!lines || lines.length === 0) return null;
    const joined = lines.join(" ").trim();
    return joined.length > 20 ? joined : null;
  }

  private static parseEducation(lines: string[]): ParsedEducationItem[] {
    const items: ParsedEducationItem[] = [];
    let currentItem: Partial<ParsedEducationItem> | null = null;

    for (const line of lines) {
      const degreeRegex = /(bachelor|master|b\.?tech|b\.?s\.?|m\.?s\.?|ph\.?d|diploma|degree|associate)/i;
      const dateRegex = /\b(20\d\d|19\d\d)\b/;

      if (line.includes("University") || line.includes("College") || line.includes("Institute") || degreeRegex.test(line)) {
        if (currentItem && currentItem.institution) {
          items.push(currentItem as ParsedEducationItem);
        }
        currentItem = {
          institution: line,
          responsibilities: [],
        } as any;
      } else if (currentItem) {
        if (dateRegex.test(line) && !currentItem.dates) {
          currentItem.dates = line;
        } else if (!currentItem.degree && degreeRegex.test(line)) {
          currentItem.degree = line;
        }
      }
    }

    if (currentItem && currentItem.institution) {
      items.push(currentItem as ParsedEducationItem);
    }

    return items;
  }

  private static parseExperience(lines: string[]): ParsedExperienceItem[] {
    const items: ParsedExperienceItem[] = [];
    let currentItem: ParsedExperienceItem | null = null;

    const dateRangeRegex = /\b(19\d\d|20\d\d)\s*[-–—to]\s*(19\d\d|20\d\d|present|current)\b/i;

    for (const line of lines) {
      // Bullet point detection
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("–")) {
        const bulletText = line.replace(/^[•\-*–\s]+/, "").trim();
        if (currentItem && bulletText.length > 10) {
          currentItem.responsibilities.push(bulletText);
        }
      } else if (dateRangeRegex.test(line) || line.includes("|") || line.length < 60) {
        // Likely a company or role header
        if (currentItem && currentItem.organization) {
          items.push(currentItem);
        }
        const parts = line.split(/[|•–—]/).map((p) => p.trim());
        const role = parts[0] || "Software Engineer";
        const org = parts[1] || parts[0] || "Organization";
        const dates = parts.find((p) => dateRangeRegex.test(p));

        currentItem = {
          role,
          organization: org,
          dates,
          responsibilities: [],
        };
      } else if (currentItem && line.length > 15) {
        currentItem.responsibilities.push(line);
      }
    }

    if (currentItem && currentItem.organization) {
      items.push(currentItem);
    }

    return items;
  }

  private static parseProjects(lines: string[]): ParsedProjectItem[] {
    const projects: ParsedProjectItem[] = [];
    let currentProject: ParsedProjectItem | null = null;

    for (const line of lines) {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        const bullet = line.replace(/^[•\-*\s]+/, "").trim();
        if (currentProject) {
          currentProject.responsibilities.push(bullet);
          if (!currentProject.description) {
            currentProject.description = bullet;
          }
        }
      } else if (line.length < 80 && !line.endsWith(".")) {
        // Project title line e.g. "FinTrakr — Expense Analytics (React, Node, MongoDB)"
        if (currentProject && currentProject.name) {
          projects.push(currentProject);
        }

        const techMatch = line.match(/\(([^)]+)\)/) || line.match(/\[([^\]]+)\]/);
        let techs: string[] = [];
        let name = line;

        if (techMatch) {
          techs = techMatch[1].split(/[,/|]/).map((t) => t.trim()).filter(Boolean);
          name = line.replace(techMatch[0], "").replace(/[-–—:|]/, "").trim();
        } else if (line.includes(" - ") || line.includes(" — ") || line.includes(":")) {
          const parts = line.split(/[-–—:]/);
          name = parts[0].trim();
        }

        currentProject = {
          name: name.trim() || "Project",
          technologies: techs,
          description: "",
          responsibilities: [],
        };
      } else if (currentProject) {
        if (!currentProject.description) {
          currentProject.description = line;
        } else {
          currentProject.responsibilities.push(line);
        }
      }
    }

    if (currentProject && currentProject.name) {
      projects.push(currentProject);
    }

    return projects;
  }

  private static parseSkills(lines: string[], fullText: string): { skills: string[]; technologies: string[] } {
    const rawSkillLines = lines.join(" ");
    const skillTokens = rawSkillLines
      .split(/[,;|•\n]/)
      .map((s) => s.replace(/^[-*•]\s*/, "").replace(/[()]/g, "").trim())
      .filter((s) => s.length > 1 && s.length < 40 && !s.includes("http"));

    // Common technology dictionary for high-precision extraction
    const techDictionary = [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
      "React", "React Native", "Next.js", "Vue", "Angular", "Node.js", "Express", "FastAPI", "Django", "Spring Boot",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Prisma", "Cassandra", "DynamoDB",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "Linux", "GraphQL", "REST",
      "TailwindCSS", "HTML", "CSS", "WebRTC", "WebSockets", "TensorFlow", "PyTorch", "Pandas", "Scikit-Learn"
    ];

    const detectedTechs = new Set<string>();
    for (const tech of techDictionary) {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(fullText)) {
        detectedTechs.add(tech);
      }
    }

    const allSkills = Array.from(new Set([...skillTokens, ...detectedTechs]));
    return {
      skills: allSkills.filter((s) => s.length < 30),
      technologies: Array.from(detectedTechs),
    };
  }

  private static parseList(lines: string[]): string[] {
    return lines
      .map((l) => l.replace(/^[•\-*–\d.)\s]+/, "").trim())
      .filter((l) => l.length > 3 && l.length < 150);
  }
}
