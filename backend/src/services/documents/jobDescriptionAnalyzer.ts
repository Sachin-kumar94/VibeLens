/**
 * Job Description Analyzer
 * Extracts Role, Skills, Requirements, Responsibilities, Tools, Experience, Domain, Keywords.
 * Computes overlap with Resume to prioritize role-aligned interview areas (Sections 13 & 14).
 */

export interface ParsedJobDescription {
  role?: string;
  company?: string;
  experienceLevel?: string;
  domain?: string;
  skills: string[];
  tools: string[];
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
}

export class JobDescriptionAnalyzer {
  /**
   * Analyze raw JD text or uploaded document
   */
  static analyze(rawText: string): ParsedJobDescription {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const role = this.extractRole(lines, rawText);
    const company = this.extractCompany(lines, rawText);
    const experienceLevel = this.extractExperienceLevel(rawText);
    const domain = this.detectDomain(rawText);
    const { skills, tools } = this.extractSkillsAndTools(rawText);
    const requirements = this.extractBulletSection(lines, /requirements|qualifications|what we('re| are) looking for|must have/i);
    const responsibilities = this.extractBulletSection(lines, /responsibilities|what you('ll| will) do|role overview|day to day/i);
    const keywords = Array.from(new Set([...skills, ...tools, ...(role ? [role] : [])]));

    return {
      role: role || undefined,
      company: company || undefined,
      experienceLevel: experienceLevel || undefined,
      domain: domain || undefined,
      skills,
      tools,
      requirements,
      responsibilities,
      keywords,
    };
  }

  /**
   * Prioritize skills by intersecting Resume skills and JD requirements (Section 14)
   */
  static prioritizeSkills(
    resumeSkills: string[],
    jdSkills: string[]
  ): {
    overlappingSkills: string[];
    jdTargetSkills: string[];
    resumeUniqueSkills: string[];
  } {
    const norm = (s: string) => s.toLowerCase().trim();
    const resumeSet = new Set(resumeSkills.map(norm));
    const jdSet = new Set(jdSkills.map(norm));

    const overlapping: string[] = [];
    const jdOnly: string[] = [];
    const resumeOnly: string[] = [];

    for (const s of jdSkills) {
      if (resumeSet.has(norm(s))) {
        overlapping.push(s);
      } else {
        jdOnly.push(s);
      }
    }

    for (const s of resumeSkills) {
      if (!jdSet.has(norm(s))) {
        resumeOnly.push(s);
      }
    }

    return {
      overlappingSkills: overlapping,
      jdTargetSkills: jdOnly,
      resumeUniqueSkills: resumeOnly,
    };
  }

  private static extractRole(lines: string[], fullText: string): string | null {
    // Check first 3 lines for a role title e.g. "Senior Frontend Engineer"
    const commonRoles = [
      "Software Engineer", "Frontend Developer", "Frontend Engineer",
      "Backend Developer", "Backend Engineer", "Full Stack Developer", "Full Stack Engineer",
      "Data Engineer", "DevOps Engineer", "Cloud Engineer", "System Architect",
      "Product Manager", "Machine Learning Engineer", "Engineering Manager"
    ];

    for (const r of commonRoles) {
      if (new RegExp(`\\b${r}\\b`, "i").test(fullText)) {
        return r;
      }
    }

    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (/engineer|developer|architect|manager|lead|specialist/i.test(line) && line.length < 50) {
        return line.replace(/^job\s+title:?\s*/i, "").trim();
      }
    }
    return null;
  }

  private static extractCompany(lines: string[], _fullText: string): string | null {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (/company:?\s*(.+)/i.test(line)) {
        const m = line.match(/company:?\s*(.+)/i);
        return m ? m[1].trim() : null;
      }
    }
    return null;
  }

  private static extractExperienceLevel(text: string): string | null {
    const match = text.match(/\b(\d+)\+?\s*(?:to\s*(\d+))?\s*(?:years?|yrs?)(?:\s+of)?\s+experience\b/i);
    if (match) {
      return match[0];
    }
    if (/senior/i.test(text)) return "Senior (5+ years)";
    if (/junior|entry[\s-]level|intern/i.test(text)) return "Junior / Entry Level (0-2 years)";
    if (/mid[\s-]level/i.test(text)) return "Mid-Level (2-5 years)";
    return null;
  }

  private static detectDomain(text: string): string | null {
    if (/fintech|banking|payments/i.test(text)) return "FinTech / Financial Services";
    if (/healthcare|healthtech|biotech/i.test(text)) return "Healthcare / Life Sciences";
    if (/e-commerce|retail|marketplace/i.test(text)) return "E-Commerce / Marketplace";
    if (/ai|machine learning|computer vision|nlp/i.test(text)) return "Artificial Intelligence / ML";
    if (/saas|b2b/i.test(text)) return "Enterprise SaaS";
    return "Technology";
  }

  private static extractSkillsAndTools(text: string): { skills: string[]; tools: string[] } {
    const techBank = [
      "JavaScript", "TypeScript", "React", "React Native", "Vue", "Angular", "Node.js", "Express",
      "Python", "FastAPI", "Django", "Java", "Spring Boot", "C++", "C#", "Go", "Rust",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Elasticsearch",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Git", "GraphQL", "REST",
      "System Design", "Microservices", "Kafka", "RabbitMQ", "HTML", "CSS", "TailwindCSS"
    ];

    const detected = new Set<string>();
    for (const tech of techBank) {
      if (new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
        detected.add(tech);
      }
    }

    const all = Array.from(detected);
    const tools = all.filter((s) => ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "Terraform", "CI/CD"].includes(s));
    const skills = all.filter((s) => !tools.includes(s));

    return { skills, tools };
  }

  private static extractBulletSection(lines: string[], headerRegex: RegExp): string[] {
    const results: string[] = [];
    let inside = false;

    for (const line of lines) {
      if (headerRegex.test(line)) {
        inside = true;
        continue;
      }

      if (inside) {
        // Exit if we hit another header
        if (/^[A-Z0-9\s\-_–—]+:?$/.test(line) && line.length < 40 && !line.startsWith("•") && !line.startsWith("-")) {
          break;
        }
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          results.push(line.replace(/^[•\-*\s]+/, "").trim());
        } else if (line.length > 20) {
          results.push(line);
        }
      }
    }

    return results.slice(0, 10);
  }
}
