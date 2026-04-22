// Curated skill taxonomy for matching. Lowercase canonical form.
export const SKILL_TAXONOMY: Record<string, string[]> = {
  // Programming languages
  languages: [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "bash",
    "perl", "dart", "objective-c",
  ],
  frontend: [
    "react", "next.js", "vue", "angular", "svelte", "redux", "tailwind",
    "html", "css", "sass", "webpack", "vite", "jquery", "bootstrap",
    "material-ui", "chakra ui", "figma",
  ],
  backend: [
    "node.js", "express", "nestjs", "fastapi", "django", "flask", "spring",
    "spring boot", "rails", "laravel", "graphql", "rest api", "grpc",
    "microservices", "websockets",
  ],
  databases: [
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "dynamodb",
    "elasticsearch", "cassandra", "firebase", "supabase",
  ],
  cloud: [
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd", "lambda",
    "ec2", "s3", "cloudflare",
  ],
  data: [
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
    "spark", "hadoop", "kafka", "airflow", "tableau", "power bi", "excel",
    "jupyter", "matplotlib", "seaborn", "nlp", "machine learning",
    "deep learning", "computer vision", "data analysis", "statistics",
    "etl", "data modeling",
  ],
  tools: [
    "git", "github", "gitlab", "jira", "confluence", "slack", "linux",
    "agile", "scrum", "kanban", "tdd", "unit testing", "jest", "cypress",
    "playwright", "selenium",
  ],
  soft: [
    "leadership", "communication", "teamwork", "problem solving",
    "collaboration", "mentoring", "project management", "stakeholder management",
  ],
};

export const ALL_SKILLS: string[] = Array.from(
  new Set(Object.values(SKILL_TAXONOMY).flat()),
).sort((a, b) => b.length - a.length);

export const ACTION_VERBS = new Set([
  "achieved", "architected", "automated", "built", "collaborated",
  "created", "delivered", "designed", "developed", "directed",
  "engineered", "established", "executed", "implemented", "improved",
  "increased", "initiated", "launched", "led", "managed", "mentored",
  "migrated", "optimized", "orchestrated", "organized", "owned",
  "pioneered", "produced", "reduced", "refactored", "researched",
  "scaled", "shipped", "spearheaded", "streamlined", "transformed",
]);

export const WEAK_PHRASES = [
  "responsible for", "duties included", "worked on", "helped with",
  "assisted in", "in charge of", "tasked with", "involved in",
];

export const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to",
  "for", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "can", "this",
  "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
  "what", "which", "who", "whom", "their", "our", "your", "my", "me",
  "us", "them", "him", "her", "his", "its", "if", "then", "than", "so",
  "no", "not", "yes", "all", "any", "some", "such", "only", "also",
  "very", "more", "most", "other", "into", "about", "over", "under",
  "after", "before", "while", "during", "between", "etc", "e.g", "i.e",
  "job", "role", "position", "candidate", "company", "team", "work",
  "experience", "skills", "ability", "able", "strong", "good", "great",
  "excellent", "knowledge", "understanding", "familiar", "preferred",
  "required", "must", "plus", "bonus", "year", "years", "month", "months",
]);