import { ALL_SKILLS, ACTION_VERBS, WEAK_PHRASES, STOPWORDS } from "./skills";

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number; // 0-1
  score: number; // 0-100
  reason: string;
  evidence: string[];
}

export interface SectionEval {
  name: string;
  present: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  excerpt?: string;
}

export interface KeywordAnalysis {
  matched: { keyword: string; count: number }[];
  missing: string[];
  density: number; // matched-keyword tokens / total tokens %
  totalJdKeywords: number;
}

export interface SkillGap {
  present: string[];
  missing: string[];
  recommended: { skill: string; importance: number }[];
}

export interface ExperienceAnalysis {
  actionVerbCount: number;
  measurableAchievements: { text: string; metric: string }[];
  weakStatements: string[];
  rewriteSuggestions: { weak: string; rewrite: string }[];
}

export interface FormatCheck {
  warnings: string[];
  passes: string[];
}

export interface AnalysisResult {
  overallScore: number;
  components: ScoreComponent[];
  keywords: KeywordAnalysis;
  skillGap: SkillGap;
  sections: SectionEval[];
  experience: ExperienceAnalysis;
  format: FormatCheck;
  improvements: { area: string; advice: string; example?: string }[];
  meta: {
    wordCount: number;
    bullets: number;
    avgWordsPerBullet: number;
  };
}

const SECTION_HEADERS: Record<string, RegExp> = {
  contact: /(\bemail\b|\bphone\b|@|linkedin|github|portfolio)/i,
  summary: /\b(summary|objective|profile|about\s*me)\b/i,
  education: /\b(education|academic|qualifications?|degree|university|college|b\.?\s?tech|b\.?\s?sc|m\.?\s?sc|bachelor|master|phd)\b/i,
  skills: /\b(skills|technical\s*skills|technologies|tech\s*stack|competenc)/i,
  experience: /\b(experience|employment|work\s*history|professional\s*experience|career)\b/i,
  projects: /\b(projects?|portfolio|personal\s*projects?)\b/i,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function findSkills(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const found = new Set<string>();
  for (const skill of ALL_SKILLS) {
    // Word-boundary-ish match (handles c++, c#, node.js)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(lower)) found.add(skill);
  }
  return Array.from(found);
}

function extractJdKeywords(jd: string): { word: string; weight: number }[] {
  if (!jd.trim()) return [];
  const tokens = tokenize(jd);
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

  // Boost skill-taxonomy hits
  const skills = findSkills(jd);
  for (const s of skills) freq.set(s, (freq.get(s) ?? 0) + 5);

  // Multi-word skills as well
  const result: { word: string; weight: number }[] = [];
  const seen = new Set<string>();
  for (const s of skills) {
    if (!seen.has(s)) {
      result.push({ word: s, weight: (freq.get(s) ?? 1) + 5 });
      seen.add(s);
    }
  }
  for (const [word, w] of freq.entries()) {
    if (seen.has(word)) continue;
    if (word.length < 3) continue;
    if (w < 2) continue;
    result.push({ word, weight: w });
    seen.add(word);
  }
  return result.sort((a, b) => b.weight - a.weight).slice(0, 40);
}

function detectSections(text: string): Record<string, { present: boolean; excerpt: string }> {
  const lines = text.split(/\n+/);
  const result: Record<string, { present: boolean; excerpt: string }> = {};
  for (const [key, re] of Object.entries(SECTION_HEADERS)) {
    const idx = lines.findIndex((l) => re.test(l));
    if (idx >= 0) {
      result[key] = {
        present: true,
        excerpt: lines.slice(idx, idx + 4).join(" ").slice(0, 220),
      };
    } else {
      result[key] = { present: false, excerpt: "" };
    }
  }
  return result;
}

function evalContact(text: string): SectionEval {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLinkedin = /linkedin\.com\/in\//i.test(text);
  const hasGithub = /github\.com\//i.test(text);
  let score = 0;
  if (hasEmail) score += 30; else issues.push("Email address not detected");
  if (hasPhone) score += 25; else issues.push("Phone number not detected");
  if (hasLinkedin) score += 25; else suggestions.push("Add a LinkedIn profile URL (linkedin.com/in/...)");
  if (hasGithub) score += 20; else suggestions.push("Add a GitHub or portfolio link to showcase work");
  if (!hasEmail) suggestions.push("Add a professional email at the top of your resume");
  return { name: "Contact Information", present: hasEmail || hasPhone, score, issues, suggestions };
}

function evalSummary(text: string, sections: Record<string, { present: boolean; excerpt: string }>): SectionEval {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const present = sections.summary.present;
  if (!present) {
    return {
      name: "Summary / Objective",
      present: false,
      score: 30,
      issues: ["No summary or objective section detected"],
      suggestions: [
        "Add a 2–3 line professional summary near the top describing your role, years of experience, and core strengths.",
      ],
    };
  }
  const excerpt = sections.summary.excerpt;
  const wordCount = excerpt.split(/\s+/).length;
  let score = 60;
  if (wordCount > 20) score += 20;
  if (wordCount > 60) { score -= 10; issues.push("Summary is too long — keep it under 60 words"); }
  if (!/\d/.test(excerpt)) {
    issues.push("Summary lacks quantifiable detail (years of experience, scale)");
    suggestions.push("Mention years of experience and one signature achievement with numbers.");
  } else score += 20;
  return { name: "Summary / Objective", present: true, score: Math.min(100, score), issues, suggestions, excerpt };
}

function evalEducation(sections: Record<string, { present: boolean; excerpt: string }>): SectionEval {
  const present = sections.education.present;
  return {
    name: "Education",
    present,
    score: present ? 90 : 20,
    issues: present ? [] : ["No education section detected"],
    suggestions: present ? [] : ["Add an Education section with degree, institution, and graduation year."],
    excerpt: sections.education.excerpt,
  };
}

function evalSkillsSection(text: string, sections: Record<string, { present: boolean; excerpt: string }>): SectionEval {
  const present = sections.skills.present;
  const skills = findSkills(text);
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  if (!present) {
    issues.push("No dedicated Skills section detected");
    suggestions.push("Add a clear 'Skills' section grouping technologies (e.g. Languages, Frameworks, Tools).");
    score = Math.min(50, skills.length * 4);
  } else {
    score = 60 + Math.min(40, skills.length * 2);
  }
  if (skills.length < 6) {
    issues.push(`Only ${skills.length} recognised skills found — list more relevant technologies.`);
  }
  return { name: "Skills Section", present, score, issues, suggestions, excerpt: sections.skills.excerpt };
}

function evalExperience(text: string, sections: Record<string, { present: boolean; excerpt: string }>): SectionEval {
  const present = sections.experience.present;
  const bullets = text.split(/\n+/).filter((l) => /^\s*[•\-*]/.test(l));
  const hasNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  if (!present) {
    issues.push("No experience section detected");
    suggestions.push("Add a Work Experience section with company, role, dates, and bullet achievements.");
    return { name: "Experience", present: false, score: 25, issues, suggestions };
  }
  score = 50;
  if (bullets.length >= 5) score += 20; else issues.push("Use more bullet points to break up experience descriptions.");
  if (hasNumbers >= 2) score += 30;
  else {
    issues.push("Few quantified achievements (numbers, %, $).");
    suggestions.push("Quantify impact: 'Reduced latency by 35%', 'Led team of 6', 'Saved $40k/year'.");
  }
  return { name: "Experience", present: true, score: Math.min(100, score), issues, suggestions, excerpt: sections.experience.excerpt };
}

function evalProjects(sections: Record<string, { present: boolean; excerpt: string }>): SectionEval {
  const present = sections.projects.present;
  return {
    name: "Projects",
    present,
    score: present ? 85 : 50,
    issues: present ? [] : ["No Projects section detected"],
    suggestions: present
      ? ["For each project include the tech stack and one measurable outcome."]
      : ["Add a Projects section — especially valuable for early-career or side-project signal."],
    excerpt: sections.projects.excerpt,
  };
}

function analyzeExperience(text: string): ExperienceAnalysis {
  const lines = text.split(/\n+/).filter((l) => l.trim().length > 4);
  const bullets = lines.filter((l) => /^\s*[•\-*]/.test(l) || l.length < 220);
  const verbs = new Set<string>();
  for (const b of bullets) {
    const first = b.replace(/^[\s•\-*]+/, "").split(/\s+/)[0]?.toLowerCase() ?? "";
    if (ACTION_VERBS.has(first)) verbs.add(first);
  }
  const measurable = bullets
    .filter((b) => /\b(\d+%|\$\d+|\d+\s*(users|customers|clients|requests|ms|seconds?|hours?|days?|weeks?|months?|years?|x))\b/i.test(b))
    .slice(0, 8)
    .map((text) => {
      const m = text.match(/\b\d+[%xX]?\b[^\n.]*/);
      return { text: text.trim().slice(0, 200), metric: m ? m[0] : "" };
    });

  const weak: string[] = [];
  const rewrites: { weak: string; rewrite: string }[] = [];
  for (const b of bullets) {
    const lower = b.toLowerCase();
    for (const phrase of WEAK_PHRASES) {
      if (lower.includes(phrase)) {
        const trimmed = b.trim().slice(0, 200);
        if (!weak.includes(trimmed)) {
          weak.push(trimmed);
          rewrites.push({
            weak: trimmed,
            rewrite: rewriteWeak(trimmed, phrase),
          });
        }
        break;
      }
    }
  }

  return {
    actionVerbCount: verbs.size,
    measurableAchievements: measurable,
    weakStatements: weak.slice(0, 6),
    rewriteSuggestions: rewrites.slice(0, 6),
  };
}

function rewriteWeak(line: string, phrase: string): string {
  const after = line.toLowerCase().split(phrase)[1]?.trim() ?? "the project";
  const cleaned = after.replace(/^(the|a|an)\s+/, "").slice(0, 80) || "key initiatives";
  return `Delivered ${cleaned}, improving [metric] by [X]% in [timeframe].`;
}

function checkFormat(text: string, fileWarnings: string[]): FormatCheck {
  const warnings = [...fileWarnings];
  const passes: string[] = [];

  // Tabs / multi-column heuristic
  const tabHeavy = (text.match(/\t/g) ?? []).length > 30;
  if (tabHeavy) warnings.push("Heavy tab usage detected — likely a multi-column layout that ATS parsers may misread.");
  else passes.push("No multi-column layout artifacts detected.");

  // Special chars / glyphs
  const oddGlyphs = (text.match(/[\uE000-\uF8FF]/g) ?? []).length;
  if (oddGlyphs > 0) warnings.push("Private-use unicode glyphs found — these are usually icons that ATS cannot read.");

  // Section headers
  const sectionsFound = Object.entries(SECTION_HEADERS).filter(([, re]) => re.test(text)).length;
  if (sectionsFound >= 4) passes.push(`${sectionsFound}/6 standard section headings detected.`);
  else warnings.push(`Only ${sectionsFound}/6 standard section headings detected — use clearer headings (Experience, Skills, Education, Projects).`);

  // Length
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 200) warnings.push(`Resume is very short (${words} words) — ATS may flag it as insufficient.`);
  else if (words > 1200) warnings.push(`Resume is very long (${words} words) — aim for 400–900 words.`);
  else passes.push(`Length is healthy (${words} words).`);

  return { warnings, passes };
}

export interface AnalyzeInput {
  text: string;
  jd: string;
  fileWarnings: string[];
}

export function analyze({ text, jd, fileWarnings }: AnalyzeInput): AnalysisResult {
  const sections = detectSections(text);
  const resumeSkills = findSkills(text);
  const jdKeywords = extractJdKeywords(jd);
  const resumeTokens = tokenize(text);
  const resumeTokenSet = new Set(resumeTokens);

  // Keyword match
  const matched: { keyword: string; count: number }[] = [];
  const missingKw: string[] = [];
  let matchedWeight = 0;
  let totalWeight = 0;
  for (const k of jdKeywords) {
    totalWeight += k.weight;
    if (resumeTokenSet.has(k.word) || text.toLowerCase().includes(k.word)) {
      const count = resumeTokens.filter((t) => t === k.word).length || 1;
      matched.push({ keyword: k.word, count });
      matchedWeight += k.weight;
    } else {
      missingKw.push(k.word);
    }
  }
  const keywordScore = jdKeywords.length === 0
    ? 70 // no JD provided — neutral
    : Math.round((matchedWeight / Math.max(1, totalWeight)) * 100);

  const totalTokens = resumeTokens.length || 1;
  const matchedTokenCount = matched.reduce((s, m) => s + m.count, 0);
  const density = Math.round((matchedTokenCount / totalTokens) * 1000) / 10;

  // Skill gap
  let jdSkills = findSkills(jd);
  if (jdSkills.length === 0 && jd.trim().length === 0) jdSkills = [];
  const presentSkills = resumeSkills.filter((s) => jdSkills.length === 0 || jdSkills.includes(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));
  const recommended = missingSkills.map((s, i) => ({
    skill: s,
    importance: Math.max(1, Math.round(10 - i * 0.7)),
  }));

  // Sections
  const sectionEvals: SectionEval[] = [
    evalContact(text),
    evalSummary(text, sections),
    evalEducation(sections),
    evalSkillsSection(text, sections),
    evalExperience(text, sections),
    evalProjects(sections),
  ];

  // Experience analysis
  const experience = analyzeExperience(text);

  // Format
  const format = checkFormat(text, fileWarnings);

  // Component scores
  const structureScore = Math.round(
    (sectionEvals.filter((s) => s.present).length / 6) * 70 +
      Math.max(0, 30 - format.warnings.length * 8),
  );

  const expSection = sectionEvals.find((s) => s.name === "Experience")!;
  const experienceScore = Math.round(
    (expSection.score * 0.5) +
      Math.min(30, experience.actionVerbCount * 4) +
      Math.min(20, experience.measurableAchievements.length * 5),
  );

  const skillsScore = jdSkills.length === 0
    ? Math.min(100, 40 + resumeSkills.length * 4)
    : Math.round((presentSkills.length / Math.max(1, jdSkills.length)) * 100);

  const totalWords = resumeTokens.length;
  const bullets = text.split(/\n+/).filter((l) => /^\s*[•\-*]/.test(l)).length;
  const avgWordsPerBullet = bullets ? Math.round(totalWords / bullets) : 0;
  let readability = 70;
  if (avgWordsPerBullet > 0 && avgWordsPerBullet < 25) readability += 20;
  if (experience.weakStatements.length === 0) readability += 10;
  readability -= Math.min(40, experience.weakStatements.length * 8);
  readability = Math.max(0, Math.min(100, readability));

  const components: ScoreComponent[] = [
    {
      key: "keywords",
      label: "Keyword Match",
      weight: 0.3,
      score: keywordScore,
      reason: jdKeywords.length === 0
        ? "No job description provided — paste a JD for a calibrated keyword match."
        : `Matched ${matched.length} of ${jdKeywords.length} JD keywords (weighted by JD frequency).`,
      evidence: matched.slice(0, 8).map((m) => `${m.keyword} (×${m.count})`),
    },
    {
      key: "structure",
      label: "Structure & Formatting",
      weight: 0.2,
      score: structureScore,
      reason: `${sectionEvals.filter((s) => s.present).length}/6 standard sections present, ${format.warnings.length} formatting warning(s).`,
      evidence: sectionEvals.filter((s) => s.present).map((s) => s.name),
    },
    {
      key: "experience",
      label: "Experience Relevance",
      weight: 0.2,
      score: Math.min(100, experienceScore),
      reason: `${experience.actionVerbCount} unique action verbs, ${experience.measurableAchievements.length} quantified achievements.`,
      evidence: experience.measurableAchievements.slice(0, 3).map((a) => a.text),
    },
    {
      key: "skills",
      label: "Skills Coverage",
      weight: 0.2,
      score: skillsScore,
      reason: jdSkills.length === 0
        ? `${resumeSkills.length} recognised skills detected in resume.`
        : `${presentSkills.length}/${jdSkills.length} JD skills present in resume.`,
      evidence: resumeSkills.slice(0, 10),
    },
    {
      key: "readability",
      label: "Readability & Clarity",
      weight: 0.1,
      score: readability,
      reason: `${bullets} bullet points, avg ${avgWordsPerBullet} words/bullet, ${experience.weakStatements.length} weak phrasing instance(s).`,
      evidence: bullets > 0 ? [`${bullets} bullets`, `avg ${avgWordsPerBullet} words/bullet`] : ["No bullet structure detected"],
    },
  ];

  const overallScore = Math.round(
    components.reduce((sum, c) => sum + c.score * c.weight, 0),
  );

  // Improvements
  const improvements: { area: string; advice: string; example?: string }[] = [];
  if (missingKw.length > 0)
    improvements.push({
      area: "Keywords",
      advice: `Naturally incorporate these JD keywords: ${missingKw.slice(0, 8).join(", ")}.`,
    });
  if (missingSkills.length > 0)
    improvements.push({
      area: "Skills",
      advice: `Add or learn these required skills: ${missingSkills.slice(0, 6).join(", ")}.`,
    });
  for (const r of experience.rewriteSuggestions.slice(0, 3))
    improvements.push({ area: "Experience phrasing", advice: `Rewrite: "${r.weak}"`, example: r.rewrite });
  for (const sec of sectionEvals)
    for (const s of sec.suggestions) improvements.push({ area: sec.name, advice: s });

  return {
    overallScore,
    components,
    keywords: {
      matched,
      missing: missingKw.slice(0, 30),
      density,
      totalJdKeywords: jdKeywords.length,
    },
    skillGap: { present: presentSkills, missing: missingSkills, recommended },
    sections: sectionEvals,
    experience,
    format,
    improvements,
    meta: { wordCount: totalWords, bullets, avgWordsPerBullet },
  };
}