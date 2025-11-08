import { normalizeSkills, extractSkillsFromText } from './normalization';
import { MLAnalysisEngine } from './ml-engine';
import { RealMarketAnalysisEngine } from './market-analysis';

export interface ScoringInput {
  userSkills: string[];
  roleRequirements: Array<{ skill: string; weight: number; priority: string }>;
  jdText: string;
  jdTitle: string;
  dictionary: Set<string>;
  resumeProvided?: boolean;
  resumeText?: string;
  roleCategory?: string;
  marketData?: { marketData?: Record<string, number>; skillCombinations?: Record<string, string[]>; emergingTech?: string[] };
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
  marketAnalysis?: {
    explanations: Array<{
      skill: string;
      reason: string;
      marketDemand: number;
      priority: string;
    }>;
    skillGaps: {
      total: number;
      critical: number;
      learningPath: string;
    };
  };
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

  // Enhanced alignment scoring using ML engine if resume is provided
  let alignment = 0;
  let mlAnalysis = null;
  let alignmentHits = 0;
  let allRequiredTokens = new Set<string>();
  let jdSkills: string[] = [];
  
  if (input.resumeProvided && input.resumeText) {
    // Use ML engine for better alignment scoring
    try {
      const allSkills = Array.from(input.dictionary || []);
      if (allSkills.length === 0) {
        throw new Error('Dictionary is empty');
      }
      const mlEngine = new MLAnalysisEngine(allSkills);
      mlAnalysis = mlEngine.analyzeResumeJobMatch(
        input.resumeText || '',
        input.jdText || '',
        input.roleRequirements || []
      );
      alignment = mlAnalysis.alignmentScore;
      // Extract jdSkills for later use (if ML engine succeeded)
      jdSkills = extractSkillsFromText(input.jdText || '', input.dictionary);
      const jdSkillSet = new Set(jdSkills);
      allRequiredTokens = new Set([...requiredSkills.map(r => r.skill), ...jdSkills]);
      alignmentHits = Array.from(allRequiredTokens).filter(
        token => userSkillSet.has(token)
      ).length;
    } catch (mlError) {
      console.error('ML engine error, falling back to simple matching:', mlError);
      // Fallback to simple keyword matching if ML engine fails
      jdSkills = extractSkillsFromText(input.jdText || '', input.dictionary);
      const jdSkillSet = new Set(jdSkills);
      allRequiredTokens = new Set([...requiredSkills.map(r => r.skill), ...jdSkills]);
      alignmentHits = Array.from(allRequiredTokens).filter(
        token => userSkillSet.has(token)
      ).length;
      alignment = allRequiredTokens.size > 0
        ? Math.round((100 * alignmentHits) / allRequiredTokens.size)
        : 0;
    }
  } else {
    // Fallback to simple keyword matching
    jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
    const jdSkillSet = new Set(jdSkills);
    allRequiredTokens = new Set([...requiredSkills.map(r => r.skill), ...jdSkills]);

    alignmentHits = Array.from(allRequiredTokens).filter(
      token => userSkillSet.has(token)
    ).length;

    alignment = allRequiredTokens.size > 0
      ? Math.round((100 * alignmentHits) / allRequiredTokens.size)
      : 0;
  }

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
    const hasKeywords = (jdSkills || []).some(s => resume.includes(s)) ? 20 : 0;

    ats = hasHeaders + hasBullets + hasDates + hasActionVerbs + hasKeywords;

    // More dynamic impact scoring based on actual resume content
    const internships = (resume.match(/intern/gi) || []).length;
    const projectsWithMetrics = (resume.match(/\d+%|\d+x|\d+\s*(users|views|requests|queries)/gi) || []).length;
    const quantBullets = (resume.match(/\d+/g) || []).length;
    
    // Count technical achievements and project mentions
    const projectMentions = (resume.match(/\b(project|built|developed|created|designed|implemented)\b/gi) || []).length;
    const techAchievements = (resume.match(/\b(improved|optimized|reduced|increased|scaled|deployed)\b/gi) || []).length;
    
    // Calculate impact with more granular scoring
    const internshipScore = Math.min(30, internships * 10);
    const metricsScore = Math.min(25, projectsWithMetrics * 5);
    const quantScore = Math.min(15, Math.floor(quantBullets / 5));
    const projectScore = Math.min(15, Math.floor(projectMentions / 2));
    const achievementScore = Math.min(15, Math.floor(techAchievements / 2));
    
    impact = Math.min(100, internshipScore + metricsScore + quantScore + projectScore + achievementScore);

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
      mlAnalysis: mlAnalysis ? {
        keywordMatches: mlAnalysis.keywordMatches,
        missingKeywords: mlAnalysis.missingKeywords,
        skillRelevanceScores: mlAnalysis.skillRelevanceScores,
        recommendations: mlAnalysis.recommendations
      } : null,
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
  if (allRequiredTokens.size > 0 && alignmentHits >= allRequiredTokens.size * 0.4) { // More generous for interns
    strengths.push('Skills align well with this internship opportunity');
  }
  if (userSkillSet.has('python') || userSkillSet.has('javascript')) {
    strengths.push('Strong programming foundation with versatile languages');
  }
  if (userSkillSet.has('git')) {
    strengths.push('Version control experience - highly valued by employers');
  }

  // Enhanced gap analysis with market prioritization
  let missingSkills = input.roleRequirements
    .filter(r => !userSkillSet.has(r.skill));

  // Use real market analysis to prioritize skills and generate technical improvements
  // Market data will be loaded dynamically or passed from API
  const marketEngine = new RealMarketAnalysisEngine(input.marketData);
  const prioritizedGaps = marketEngine.prioritizeSkillGaps(missingSkills);
  
  // Generate technical improvements based on real market data
  const roleCategory = input.roleCategory || 'general';
  const improvements = marketEngine.generateTechnicalImprovements(
    missingSkills,
    userSkillSet,
    roleCategory,
    readiness,
    alignment
  );
  
  // Generate market analysis explanations
  const marketAnalysis = marketEngine.generateMarketAnalysisExplanations(
    missingSkills,
    userSkillSet,
    roleCategory,
    prioritizedGaps
  );
  
  // Add resume-specific improvements if applicable
  if (input.resumeProvided && ats < 60) {
    improvements.push('Optimize resume with relevant keywords and clear formatting');
  }
  if (impact < 30) {
    improvements.push('Add personal projects or coursework examples to demonstrate skills');
  } else if (impact < 60) {
    improvements.push('Quantify your project achievements (e.g., "built app with 5 features")');
  }
  
  missingSkills = prioritizedGaps.sort((a, b) => {
    if (a.priority === 'required' && b.priority !== 'required') return -1;
    if (a.priority !== 'required' && b.priority === 'required') return 1;
    return b.marketPriority - a.marketPriority;
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
    marketAnalysis,
  };
}
