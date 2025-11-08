import { TECH_SKILLS_DICTIONARY } from './tech-dictionary';

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
    if (norm && norm.length > 0) {
      normalized.add(norm);
    }
  }

  return Array.from(normalized);
}

// Format skill for display (capitalize first letter, preserve rest)
export function formatSkillForDisplay(skill: string): string {
  if (!skill || skill.length === 0) return skill;
  
  // Handle special cases with preserved capitalization
  const specialCases: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'machine learning': 'Machine Learning',
    'deep learning': 'Deep Learning',
    'data science': 'Data Science',
    'artificial intelligence': 'Artificial Intelligence',
    'natural language processing': 'Natural Language Processing',
    'computer vision': 'Computer Vision',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'html': 'HTML',
    'css': 'CSS',
    'api': 'API',
    'rest': 'REST',
    'graphql': 'GraphQL',
    'aws': 'AWS',
    'gcp': 'GCP',
    'azure': 'Azure',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'linux': 'Linux',
    'unix': 'Unix',
    'ios': 'iOS',
    'android': 'Android',
    'ml': 'ML',
    'ai': 'AI',
    'nlp': 'NLP',
    'cv': 'CV',
    'ui': 'UI',
    'ux': 'UX',
    'ci/cd': 'CI/CD',
    'devops': 'DevOps',
  };
  
  const lower = skill.toLowerCase().trim();
  if (specialCases[lower]) {
    return specialCases[lower];
  }
  
  // Handle acronyms (all caps if 2-4 letters)
  if (/^[A-Z]{2,4}$/.test(skill)) {
    return skill.toUpperCase();
  }
  
  // Handle camelCase/PascalCase (preserve as-is)
  if (/^[A-Z][a-z]+([A-Z][a-z]+)+$/.test(skill)) {
    return skill;
  }
  
  // Handle skills with dots, dashes, slashes (preserve structure)
  if (/[.\-/#]/.test(skill)) {
    return skill.split(/[.\-/#]/).map(word => {
      const trimmed = word.trim();
      if (trimmed.length === 0) return word;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }).join(skill.match(/[.\-/#]/)?.[0] || '');
  }
  
  // Default: Capitalize first letter of each word
  return skill.split(' ').map(word => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function extractSkillsFromText(text: string, dictionary: Set<string>): string[] {
  if (!text || text.length === 0) return [];
  
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Strategy 1: Check dictionary skills directly in the text (case-insensitive, whole word)
  for (const skill of dictionary) {
    const skillLower = skill.toLowerCase();
    // Look for whole word matches (not substring matches)
    // Handle multi-word skills and single-word skills differently
    if (skillLower.includes(' ')) {
      // Multi-word skill: look for exact phrase
      const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        found.add(skill);
      }
    } else {
      // Single-word skill: whole word boundary
      const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        found.add(skill);
      }
    }
  }
  
  // Strategy 2: Extract from skills sections (more comprehensive)
  const skillsSectionPatterns = [
    /skills?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /technical\s+skills?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /programming\s+languages?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /technologies?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /tools?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /frameworks?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /libraries?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /proficiencies?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
  ];
  
  for (const pattern of skillsSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const skillsText = match[1];
      // Extract from various separators
      const skillCandidates = skillsText
        .split(/[,:;•\-\n|]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const candidate of skillCandidates) {
        const normalized = normalizeSkill(candidate);
        // Check if normalized version is in dictionary
        if (dictionary.has(normalized)) {
          found.add(normalized);
        } else {
          // Also check if any dictionary skill contains this candidate or vice versa
          for (const dictSkill of dictionary) {
            const dictLower = dictSkill.toLowerCase();
            const candidateLower = normalized.toLowerCase();
            // Fuzzy match: if one contains the other (for variations)
            if (dictLower.includes(candidateLower) && candidateLower.length >= 3) {
              found.add(dictSkill);
            } else if (candidateLower.includes(dictLower) && dictLower.length >= 3) {
              found.add(dictSkill);
            }
          }
        }
      }
    }
  }
  
  // Strategy 3: Extract from experience/project descriptions
  // Look for tech mentions in context (e.g., "built with React", "using Python")
  const techContextPatterns = [
    /\b(?:built|developed|created|designed|implemented|used|utilized|worked with|experience with|proficient in|familiar with)\s+(?:with\s+)?([A-Z][A-Za-z\s.+#-]{2,30})\b/gi,
    /\b(?:using|via|through|with)\s+([A-Z][A-Za-z\s.+#-]{2,30})\b/gi,
  ];
  
  for (const pattern of techContextPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const candidate = match[1].trim();
        const normalized = normalizeSkill(candidate);
        if (dictionary.has(normalized)) {
          found.add(normalized);
        }
      }
    }
  }
  
  // Strategy 4: Extract common tech patterns from entire text
  // Look for common tech stack mentions
  const commonTechPatterns = [
    /\b(react|vue|angular|node|python|java|javascript|typescript|sql|mongodb|postgresql|aws|docker|kubernetes)\b/gi,
  ];
  
  for (const pattern of commonTechPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const candidate = match[0].toLowerCase();
      const normalized = normalizeSkill(candidate);
      if (dictionary.has(normalized)) {
        found.add(normalized);
      }
    }
  }

  return Array.from(found);
}

export function buildDictionary(roles: any[], resources: any[]): Set<string> {
  const dict = new Set<string>();

  // Start with comprehensive tech dictionary
  for (const skill of TECH_SKILLS_DICTIONARY) {
    dict.add(normalizeSkill(skill));
  }

  // Add skills from roles
  for (const role of roles) {
    for (const req of role.requirements || []) {
      dict.add(normalizeSkill(req.skill));
    }
  }

  // Add skills from resources
  for (const resource of resources) {
    dict.add(normalizeSkill(resource.skill));
  }

  return dict;
}
