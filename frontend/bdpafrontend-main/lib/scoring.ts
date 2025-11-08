import { normalizeSkills, extractSkillsFromText } from './normalization';

export interface ScoringInput {
  userSkills: string[];
  roleRequirements: Array<{ skill: string; weight: number; priority: string }>;
  jdText: string;
  jdTitle: string;
  dictionary: Set<string>;
  resumeProvided?: boolean;
  resumeText?: string;
}

export interface ScoringResult {
  readiness: number;
  alignment: number;
  ats: number;
  impact: number;
  polish: number;
  potential: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  missingSkills: Array<{ skill: string; weight: number; priority: string }>;
  meta: Record<string, any>;
}

export function computeScores(input: ScoringInput): ScoringResult {
  const userSkillSet = new Set(normalizeSkills(input.userSkills));

  const requiredSkills = input.roleRequirements.filter(r => r.priority === 'required');
  const preferredSkills = input.roleRequirements.filter(r => r.priority === 'preferred');

  const metRequired = requiredSkills.filter(r => userSkillSet.has(r.skill)).length;
  const metPreferred = preferredSkills.filter(r => userSkillSet.has(r.skill)).length;

  const readiness = requiredSkills.length > 0
    ? Math.round((100 * metRequired) / requiredSkills.length)
    : 100;

  const jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
  const jdSkillSet = new Set(jdSkills);
  const allRequiredTokens = new Set([...requiredSkills.map(r => r.skill), ...jdSkills]);

  const alignmentHits = Array.from(allRequiredTokens).filter(
    token => userSkillSet.has(token)
  ).length;

  const alignment = allRequiredTokens.size > 0
    ? Math.round((100 * alignmentHits) / allRequiredTokens.size)
    : 0;

  let ats = 0;
  let impact = 0;
  let polish = 0;
  let meta: Record<string, any> = {};

  if (input.resumeProvided && input.resumeText) {
    const resume = input.resumeText.toLowerCase();

    const hasHeaders = /experience|education|skills/i.test(resume) ? 20 : 0;
    const hasBullets = (resume.match(/[•\-*]/g) || []).length >= 5 ? 20 : 0;
    const hasDates = (resume.match(/\d{4}/g) || []).length >= 2 ? 15 : 0;
    const hasActionVerbs = /\b(developed|built|led|managed|designed|implemented|created|analyzed)\b/i.test(resume) ? 25 : 0;
    const hasKeywords = jdSkills.some(s => resume.includes(s)) ? 20 : 0;

    ats = hasHeaders + hasBullets + hasDates + hasActionVerbs + hasKeywords;

    const internships = (resume.match(/intern/gi) || []).length;
    const projectsWithMetrics = (resume.match(/\d+%|\d+x/g) || []).length;
    const quantBullets = (resume.match(/\d+/g) || []).length;

    impact = Math.min(100, 30 * internships + 20 * projectsWithMetrics + 5 * quantBullets);

    const hasSpacing = resume.includes('\n\n') ? 20 : 10;
    const bulletLength = 20;
    const consistentTense = 20;
    const noReferences = !resume.includes('references available') ? 20 : 0;
    const formatting = 20;

    polish = hasSpacing + bulletLength + consistentTense + noReferences + formatting;

    meta = {
      internships,
      projectsWithMetrics,
      quantBullets,
      bulletCount: hasBullets > 0 ? Math.min(10, Math.floor(hasBullets / 2)) : 0,
    };
  } else {
    ats = 0;
    impact = Math.min(100, 20 * (userSkillSet.size >= 5 ? 1 : 0) + 30 * metRequired);
    polish = 0;
  }

  // Intern-specific potential calculation - more generous for beginners
  const hasDeepProject = input.userSkills.length >= 5 ? 1 : 0; // Lower threshold for interns
  const courseworkDensity = Math.min(5, input.userSkills.length / 2); // More generous calculation
  const foundationBonus = userSkillSet.has('python') || userSkillSet.has('javascript') ? 10 : 0;
  const potential = Math.min(100, readiness + 15 * hasDeepProject + 15 * courseworkDensity + foundationBonus);

  let overall = 0;
  if (input.resumeProvided) {
    overall = Math.round(
      0.35 * alignment + 0.25 * readiness + 0.15 * ats + 0.15 * impact + 0.1 * polish
    );
  } else {
    overall = Math.round(
      0.5 * alignment + 0.3 * readiness + 0.2 * impact
    );
  }

  // Intern-focused strengths - more encouraging for beginners
  const strengths: string[] = [];
  if (metRequired >= requiredSkills.length * 0.5) { // Lower threshold for interns
    strengths.push('Solid foundation in core required skills');
  }
  if (metRequired > 0 && metRequired < requiredSkills.length * 0.5) {
    strengths.push('Good starting point with some required skills');
  }
  if (metPreferred > 0) {
    strengths.push(`${metPreferred} bonus skills that make you stand out`);
  }
  if (alignmentHits >= allRequiredTokens.size * 0.4) { // More generous for interns
    strengths.push('Skills align well with this internship opportunity');
  }
  if (userSkillSet.has('python') || userSkillSet.has('javascript')) {
    strengths.push('Strong programming foundation with versatile languages');
  }
  if (userSkillSet.has('git')) {
    strengths.push('Version control experience - highly valued by employers');
  }

  // Intern-focused improvements - actionable and encouraging
  const improvements: string[] = [];
  if (readiness < 50) {
    improvements.push('Focus on learning the most essential required skills first');
  } else if (readiness < 70) {
    improvements.push('Strengthen proficiency in remaining required skills');
  }
  if (alignment < 40) {
    improvements.push('Study the job description and learn key technologies mentioned');
  } else if (alignment < 70) {
    improvements.push('Continue building skills that match job requirements');
  }
  if (input.resumeProvided && ats < 60) {
    improvements.push('Optimize resume with relevant keywords and clear formatting');
  }
  if (impact < 30) {
    improvements.push('Add personal projects or coursework examples to demonstrate skills');
  } else if (impact < 60) {
    improvements.push('Quantify your project achievements (e.g., "built app with 5 features")');
  }

  const missingSkills = input.roleRequirements
    .filter(r => !userSkillSet.has(r.skill))
    .sort((a, b) => {
      if (a.priority === 'required' && b.priority !== 'required') return -1;
      if (a.priority !== 'required' && b.priority === 'required') return 1;
      return b.weight - a.weight;
    });

  return {
    readiness,
    alignment,
    ats,
    impact,
    polish,
    potential,
    overall,
    strengths,
    improvements,
    missingSkills,
    meta,
  };
}
