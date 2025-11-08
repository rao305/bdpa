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

    // Dynamic polish scoring based on actual resume content
    const hasSpacing = resume.includes('\n\n') ? 20 : (resume.includes('\n') ? 10 : 0);
    const bulletCount = (resume.match(/[•\-*]/g) || []).length;
    const bulletLength = Math.min(20, Math.floor(bulletCount / 3) * 5); // More bullets = better formatting
    const consistentTense = /\b(developed|built|led|managed|designed|implemented|created|analyzed|improved|optimized)\b/i.test(resume) ? 20 : 10;
    const noReferences = !resume.includes('references available') && !resume.includes('reference') ? 20 : 0;
    const hasContactInfo = /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/.test(resume) ? 10 : 0;
    const appropriateLength = resume.length > 500 && resume.length < 3000 ? 10 : (resume.length > 200 ? 5 : 0);
    const formatting = hasSpacing > 0 && bulletLength > 0 ? 10 : 5;

    polish = Math.min(100, hasSpacing + bulletLength + consistentTense + noReferences + hasContactInfo + appropriateLength + formatting);
    
    // Store polish evidence
    meta.polishCalculation = `Spacing (${hasSpacing}) + Bullets (${bulletLength}) + Tense (${consistentTense}) + No References (${noReferences}) + Contact (${hasContactInfo}) + Length (${appropriateLength}) + Formatting (${formatting}) = ${polish}%`;
    meta.polishDetails = `Resume has ${bulletCount} bullet points, ${resume.length} characters, ${hasContactInfo > 0 ? 'contact info' : 'no contact info'}`;
    meta.polishBreakdown = `Formatting quality: Spacing (${hasSpacing}/20), Bullets (${bulletLength}/20), Consistent tense (${consistentTense}/20), No references (${noReferences}/20), Contact info (${hasContactInfo}/10), Length (${appropriateLength}/10), Formatting (${formatting}/10)`;

    // Store detailed evidence for each score
    meta = {
      // Alignment evidence
      alignmentHits,
      allRequiredTokens: allRequiredTokens.size,
      jdSkills: jdSkills.length,
      alignmentCalculation: `(${alignmentHits} matching skills / ${allRequiredTokens.size} required skills) × 100 = ${alignment}%`,
      alignmentBreakdown: `Found ${jdSkills.length} skills in job description. You match ${alignmentHits} out of ${allRequiredTokens.size} required skills.`,
      
      // Readiness evidence
      metRequired,
      requiredSkillsCount: requiredSkills.length,
      readinessCalculation: `(${metRequired} required skills met / ${requiredSkills.length} total required) × 100 = ${readiness}%`,
      readinessBreakdown: `You have ${metRequired} out of ${requiredSkills.length} required skills (${metPreferred} preferred skills).`,
      
      // Impact evidence
      internships,
      projectsWithMetrics,
      quantBullets,
      projectMentions,
      techAchievements,
      impactCalculation: `Internships (${internships} × 10) + Metrics (${projectsWithMetrics} × 5) + Quantified (${Math.floor(quantBullets / 5)} × 5) + Projects (${Math.floor(projectMentions / 2)} × 5) + Achievements (${Math.floor(techAchievements / 2)} × 5) = ${impact}%`,
      impactDetails: `Found ${internships} internships, ${projectsWithMetrics} projects with metrics, ${projectMentions} project mentions, ${techAchievements} technical achievements`,
      impactBreakdown: `Internship score: ${internshipScore}/30, Metrics: ${metricsScore}/25, Quantified bullets: ${quantScore}/15, Projects: ${projectScore}/15, Achievements: ${achievementScore}/15`,
      
      // ATS evidence
      hasHeaders: /experience|education|skills/i.test(input.resumeText || '') ? 20 : 0,
      hasBullets: (input.resumeText?.match(/[•\-*]/g) || []).length >= 5 ? 20 : 0,
      hasDates: (input.resumeText?.match(/\d{4}/g) || []).length >= 2 ? 15 : 0,
      hasActionVerbs: /\b(developed|built|led|managed|designed|implemented|created|analyzed)\b/i.test(input.resumeText || '') ? 25 : 0,
      hasKeywords: (jdSkills || []).some((s: string) => (input.resumeText || '').toLowerCase().includes(s)) ? 20 : 0,
      atsCalculation: `Headers (${/experience|education|skills/i.test(input.resumeText || '') ? 20 : 0}) + Bullets (${(input.resumeText?.match(/[•\-*]/g) || []).length >= 5 ? 20 : 0}) + Dates (${(input.resumeText?.match(/\d{4}/g) || []).length >= 2 ? 15 : 0}) + Action Verbs (${/\b(developed|built|led|managed|designed|implemented|created|analyzed)\b/i.test(input.resumeText || '') ? 25 : 0}) + Keywords (${(jdSkills || []).some((s: string) => (input.resumeText || '').toLowerCase().includes(s)) ? 20 : 0}) = ${ats}%`,
      atsDetails: `Resume has proper sections: ${/experience|education|skills/i.test(input.resumeText || '') ? 'Yes' : 'No'}, Bullet points: ${(input.resumeText?.match(/[•\-*]/g) || []).length >= 5 ? 'Yes' : 'No'}, Dates: ${(input.resumeText?.match(/\d{4}/g) || []).length >= 2 ? 'Yes' : 'No'}, Action verbs: ${/\b(developed|built|led|managed|designed|implemented|created|analyzed)\b/i.test(input.resumeText || '') ? 'Yes' : 'No'}, Keywords: ${(jdSkills || []).some((s: string) => (input.resumeText || '').toLowerCase().includes(s)) ? 'Yes' : 'No'}`,
      atsBreakdown: `Formatting check: Headers (${/experience|education|skills/i.test(input.resumeText || '') ? 20 : 0}/20), Bullets (${(input.resumeText?.match(/[•\-*]/g) || []).length >= 5 ? 20 : 0}/20), Dates (${(input.resumeText?.match(/\d{4}/g) || []).length >= 2 ? 15 : 0}/15), Action Verbs (${/\b(developed|built|led|managed|designed|implemented|created|analyzed)\b/i.test(input.resumeText || '') ? 25 : 0}/25), Keywords (${(jdSkills || []).some((s: string) => (input.resumeText || '').toLowerCase().includes(s)) ? 20 : 0}/20)`,
      
      // Potential evidence (calculated dynamically above)
      hasDeepProject: input.userSkills.length >= 5 ? 1 : (input.userSkills.length >= 3 ? 0.5 : 0),
      courseworkDensity: Math.min(5, Math.max(0, input.userSkills.length / 2)),
      foundationBonus: (userSkillSet.has('python') || userSkillSet.has('javascript')) ? 10 : 
                      (userSkillSet.has('java') || userSkillSet.has('c++') || userSkillSet.has('sql')) ? 5 : 0,
      
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
    
    // Store evidence even without resume
    meta = {
      alignmentHits,
      allRequiredTokens: allRequiredTokens.size,
      jdSkills: jdSkills.length,
      alignmentCalculation: `(${alignmentHits} matching skills / ${allRequiredTokens.size} required skills) × 100 = ${alignment}%`,
      alignmentBreakdown: `Found ${jdSkills.length} skills in job description. You match ${alignmentHits} out of ${allRequiredTokens.size} required skills.`,
      
      metRequired,
      requiredSkillsCount: requiredSkills.length,
      readinessCalculation: `(${metRequired} required skills met / ${requiredSkills.length} total required) × 100 = ${readiness}%`,
      readinessBreakdown: `You have ${metRequired} out of ${requiredSkills.length} required skills (${metPreferred} preferred skills).`,
      
      impactCalculation: `Skills (${userSkillSet.size >= 5 ? 20 : 0}) + Required Skills (${metRequired * 30}) = ${impact}%`,
      impactDetails: `Based on ${userSkillSet.size} skills and ${metRequired} required skills met`,
      impactBreakdown: `No resume provided. Score based on skill count and required skills matching.`,
      
      // Potential will be calculated and updated after potential variable is set
    };
  }

  // Dynamic potential calculation based on actual user data
  const skillCount = input.userSkills.length;
  const hasDeepProject = skillCount >= 5 ? 1 : (skillCount >= 3 ? 0.5 : 0);
  const courseworkDensity = Math.min(5, Math.max(0, skillCount / 2)); // Based on actual skill count
  const foundationBonus = (userSkillSet.has('python') || userSkillSet.has('javascript')) ? 10 : 
                         (userSkillSet.has('java') || userSkillSet.has('c++') || userSkillSet.has('sql')) ? 5 : 0;
  
  // Calculate potential dynamically
  const deepProjectScore = hasDeepProject * 15;
  const courseworkScore = courseworkDensity * 15;
  const potential = Math.min(100, readiness + deepProjectScore + courseworkScore + foundationBonus);
  
  // Update potential evidence in meta (calculated after potential is determined)
  if (Object.keys(meta).length > 0) {
    meta.potentialCalculation = `Readiness (${readiness}) + Deep Project (${deepProjectScore}) + Coursework (${courseworkScore.toFixed(1)}) + Foundation Bonus (${foundationBonus}) = ${potential}%`;
    meta.potentialDetails = `You have ${skillCount} skills, ${hasDeepProject >= 1 ? 'deep project experience' : hasDeepProject >= 0.5 ? 'moderate projects' : 'basic projects'}, ${courseworkDensity.toFixed(1)} coursework density, ${foundationBonus > 0 ? 'strong foundation' : 'developing foundation'}`;
    meta.potentialBreakdown = `Based on ${skillCount} skills, ${hasDeepProject >= 1 ? 'substantial' : hasDeepProject >= 0.5 ? 'moderate' : 'basic'} project work, and ${foundationBonus > 0 ? 'strong' : 'developing'} programming foundation`;
  }

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
    prioritizedGaps,
    input.jdText,
    input.jdTitle
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
