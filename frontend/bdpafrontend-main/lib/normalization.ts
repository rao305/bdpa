const skillAliases: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  tf: 'tensorflow',
  k8s: 'kubernetes',
  aws: 'amazon web services',
  gcp: 'google cloud platform',
  react: 'react.js',
  node: 'node.js',
  ml: 'machine learning',
  ai: 'artificial intelligence',
  dl: 'deep learning',
  nlp: 'natural language processing',
  cv: 'computer vision',
  sql: 'structured query language',
  nosql: 'nosql databases',
  rest: 'rest apis',
  api: 'apis',
  git: 'version control',
  docker: 'containerization',
  ci: 'continuous integration',
  cd: 'continuous deployment',
  agile: 'agile methodologies',
  scrum: 'scrum framework',
};

const pluralRules: Record<string, string> = {
  apis: 'api',
  databases: 'database',
  frameworks: 'framework',
  libraries: 'library',
  algorithms: 'algorithm',
  models: 'model',
  pipelines: 'pipeline',
  services: 'service',
  applications: 'application',
  systems: 'system',
};

export function normalizeSkill(skill: string): string {
  let normalized = skill.toLowerCase().trim();

  if (skillAliases[normalized]) {
    normalized = skillAliases[normalized];
  }

  for (const [plural, singular] of Object.entries(pluralRules)) {
    if (normalized.endsWith(plural)) {
      normalized = normalized.slice(0, -plural.length) + singular;
    }
  }

  return normalized;
}

export function normalizeSkills(skills: string[]): string[] {
  const normalized = new Set<string>();

  for (const skill of skills) {
    const norm = normalizeSkill(skill);
    if (norm) {
      normalized.add(norm);
    }
  }

  return Array.from(normalized);
}

export function extractSkillsFromText(text: string, dictionary: Set<string>): string[] {
  const words = text.toLowerCase().match(/\b[\w\s.+#-]+\b/g) || [];
  const found = new Set<string>();

  for (const word of words) {
    const normalized = normalizeSkill(word.trim());
    if (dictionary.has(normalized)) {
      found.add(normalized);
    }
  }

  const phrases = text.toLowerCase().match(/[\w\s.+#-]{2,}/g) || [];
  for (const phrase of phrases) {
    const normalized = normalizeSkill(phrase.trim());
    if (dictionary.has(normalized)) {
      found.add(normalized);
    }
  }

  return Array.from(found);
}

export function buildDictionary(roles: any[], resources: any[]): Set<string> {
  const dict = new Set<string>();

  for (const role of roles) {
    for (const req of role.requirements || []) {
      dict.add(normalizeSkill(req.skill));
    }
  }

  for (const resource of resources) {
    dict.add(normalizeSkill(resource.skill));
  }

  return dict;
}
