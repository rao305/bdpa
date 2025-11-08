import { extractSkillsFromText, normalizeSkills } from './normalization';
import { MARKET_DEMAND } from './gap-analysis';

// Benchmark data based on our market analysis for percentile rankings
const SCORE_BENCHMARKS = {
  overall: { p25: 45, p50: 65, p75: 80, p90: 90 },
  ats: { p25: 40, p50: 60, p75: 75, p90: 85 },
  alignment: { p25: 35, p50: 55, p75: 75, p90: 88 },
  impact: { p25: 30, p50: 50, p75: 70, p90: 85 },
  polish: { p25: 45, p50: 65, p75: 80, p90: 92 },
  potential: { p25: 50, p50: 70, p75: 85, p90: 95 }
};

export interface DetailedAnalysisInput {
  userSkills: string[];
  userCoursework: string[];
  userExperience: Array<{ type: string; duration: string; description: string }>;
  resumeText?: string;
  roleRequirements: Array<{ skill: string; weight: number; priority: string }>;
  roleCategory: string;
  roleTitle: string;
  jdText: string;
  jdTitle: string;
  dictionary: Set<string>;
  isStudent: boolean;
  yearLevel?: string;
  major?: string;
}

export interface DetailedScores {
  overall: number;
  ats: number;
  alignment: number;
  impact: number;
  polish: number;
  potential: number;
  percentiles: {
    overall: number;
    ats: number;
    alignment: number;
    impact: number;
    polish: number;
    potential: number;
  };
  ranking: 'Below Average' | 'Average' | 'Above Average' | 'Excellent';
}

export interface StrengthsAndWeaknesses {
  strengths: Array<{
    category: string;
    description: string;
    evidence: string[];
    marketValue: 'High' | 'Medium' | 'Low';
  }>;
  improvements: Array<{
    category: string;
    description: string;
    impact: 'Critical' | 'Important' | 'Beneficial';
    timeToAddress: string;
    marketRelevance: number;
  }>;
}

export interface ActionableRecommendations {
  immediate: Array<{
    action: string;
    rationale: string;
    example?: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
  shortTerm: Array<{
    action: string;
    rationale: string;
    timeline: string;
    example?: string;
  }>;
  longTerm: Array<{
    action: string;
    rationale: string;
    timeline: string;
    skillsNeeded?: string[];
  }>;
}

export interface DetailedAnalysisResult {
  scores: DetailedScores;
  strengthsAndWeaknesses: StrengthsAndWeaknesses;
  recommendations: ActionableRecommendations;
  marketInsights: {
    skillDemandAnalysis: Record<string, { current: number; trend: string; priority: number }>;
    competitivePosition: string;
    salaryImpact: string;
    careerTrajectory: string;
  };
  confidenceLevel: number;
}

export function performDetailedAnalysis(input: DetailedAnalysisInput): DetailedAnalysisResult {
  // Calculate enhanced scores
  const scores = calculateDetailedScores(input);
  
  // Identify strengths and weaknesses
  const strengthsAndWeaknesses = analyzeStrengthsAndWeaknesses(input, scores);
  
  // Generate actionable recommendations
  const recommendations = generateActionableRecommendations(input, strengthsAndWeaknesses);
  
  // Analyze market insights
  const marketInsights = analyzeMarketInsights(input, scores);
  
  // Calculate confidence in analysis
  const confidenceLevel = calculateAnalysisConfidence(input);
  
  return {
    scores,
    strengthsAndWeaknesses,
    recommendations,
    marketInsights,
    confidenceLevel,
  };
}

function calculateDetailedScores(input: DetailedAnalysisInput): DetailedScores {
  const userSkillSet = new Set(normalizeSkills([
    ...input.userSkills,
    ...input.userCoursework
  ]));
  
  // Extract skills from resume if available
  let resumeSkills: string[] = [];
  if (input.resumeText) {
    resumeSkills = extractSkillsFromText(input.resumeText, input.dictionary);
    resumeSkills.forEach(skill => userSkillSet.add(skill));
  }
  
  // Extract skills from job description
  const jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
  
  // Calculate role readiness
  const requiredSkills = input.roleRequirements.filter(r => r.priority === 'required');
  const preferredSkills = input.roleRequirements.filter(r => r.priority === 'preferred');
  
  const metRequired = requiredSkills.filter(r => userSkillSet.has(r.skill)).length;
  const metPreferred = preferredSkills.filter(r => userSkillSet.has(r.skill)).length;
  
  const readiness = requiredSkills.length > 0
    ? Math.round((100 * metRequired) / requiredSkills.length)
    : 100;
  
  // Calculate alignment with job description
  const allRequiredTokens = new Set([...input.roleRequirements.map(r => r.skill), ...jdSkills]);
  const alignmentHits = Array.from(allRequiredTokens).filter(
    token => userSkillSet.has(token)
  ).length;
  
  const alignment = allRequiredTokens.size > 0
    ? Math.round((100 * alignmentHits) / allRequiredTokens.size)
    : 0;
  
  // Calculate ATS readiness
  let ats = 0;
  if (input.resumeText) {
    const resume = input.resumeText.toLowerCase();
    
    // Enhanced ATS scoring
    const hasHeaders = /experience|education|skills|projects/i.test(resume) ? 20 : 0;
    const hasBullets = (resume.match(/[•\-*]/g) || []).length >= 5 ? 15 : 0;
    const hasDates = (resume.match(/\d{4}/g) || []).length >= 2 ? 15 : 0;
    const hasActionVerbs = /\b(developed|built|led|managed|designed|implemented|created|analyzed|optimized|collaborated)\b/i.test(resume) ? 20 : 0;
    const hasKeywords = jdSkills.some(s => resume.includes(s.toLowerCase())) ? 15 : 0;
    const hasQuantifiableResults = (resume.match(/\d+%|\d+x|\d+ users|\d+ projects/g) || []).length >= 2 ? 15 : 0;
    
    ats = hasHeaders + hasBullets + hasDates + hasActionVerbs + hasKeywords + hasQuantifiableResults;
  } else {
    // For manual profiles, base ATS on skill organization
    ats = Math.min(85, userSkillSet.size * 8 + metRequired * 10);
  }
  
  // Calculate impact score
  let impact = 0;
  if (input.resumeText) {
    const resume = input.resumeText.toLowerCase();
    const internships = (resume.match(/intern/gi) || []).length;
    const projects = (resume.match(/project/gi) || []).length;
    const leadership = (resume.match(/lead|manage|coordinate|organize/gi) || []).length;
    const quantifiableResults = (resume.match(/\d+%|\d+x|\d+ users|\d+ projects/g) || []).length;
    
    impact = Math.min(100, 25 * internships + 15 * projects + 20 * leadership + 10 * quantifiableResults);
  } else {
    // For manual profiles, base on experience and skills
    const experienceScore = input.userExperience.length * 20;
    const skillDepth = userSkillSet.size >= 8 ? 30 : userSkillSet.size * 3;
    const courseworkScore = input.userCoursework.length * 5;
    
    impact = Math.min(100, experienceScore + skillDepth + courseworkScore);
  }
  
  // Calculate polish score
  let polish = 0;
  if (input.resumeText) {
    const resume = input.resumeText;
    
    // Content quality indicators
    const hasProperFormatting = resume.includes('\n\n') ? 20 : 10;
    const appropriateLength = resume.length > 500 && resume.length < 3000 ? 20 : 10;
    const consistentTense = 15; // Simplified for now
    const noTypos = !/(teh|recieve|seperate|occured)/i.test(resume) ? 15 : 5;
    const professionalTone = !/\b(awesome|cool|stuff|things|lots of)\b/i.test(resume) ? 15 : 5;
    const contactInfo = /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/.test(resume) ? 15 : 0;
    
    polish = hasProperFormatting + appropriateLength + consistentTense + noTypos + professionalTone + contactInfo;
  } else {
    // For manual profiles, estimate based on completeness
    const completeness = (input.userSkills.length > 0 ? 25 : 0) +
                        (input.userCoursework.length > 0 ? 25 : 0) +
                        (input.userExperience.length > 0 ? 25 : 0) +
                        (input.yearLevel ? 25 : 0);
    polish = completeness;
  }
  
  // Calculate potential score
  const hasStrongFoundation = ['python', 'javascript', 'java', 'sql'].some(s => userSkillSet.has(s)) ? 20 : 0;
  const diverseSkills = userSkillSet.size >= 6 ? 15 : userSkillSet.size * 2.5;
  const relevantCoursework = input.userCoursework.filter(course => 
    /computer science|programming|software|data|machine learning|algorithms/i.test(course)
  ).length * 10;
  const practicalExperience = input.userExperience.filter(exp => 
    /intern|project|development|programming/i.test(exp.type)
  ).length * 15;
  const studentBonus = input.isStudent ? 15 : 0;
  
  const potential = Math.min(100, hasStrongFoundation + diverseSkills + relevantCoursework + practicalExperience + studentBonus);
  
  // Calculate overall score
  const overall = input.resumeText 
    ? Math.round(0.3 * alignment + 0.25 * readiness + 0.15 * ats + 0.15 * impact + 0.15 * potential)
    : Math.round(0.4 * alignment + 0.35 * readiness + 0.25 * potential);
  
  // Calculate percentiles
  const percentiles = {
    overall: calculatePercentile(overall, SCORE_BENCHMARKS.overall),
    ats: calculatePercentile(ats, SCORE_BENCHMARKS.ats),
    alignment: calculatePercentile(alignment, SCORE_BENCHMARKS.alignment),
    impact: calculatePercentile(impact, SCORE_BENCHMARKS.impact),
    polish: calculatePercentile(polish, SCORE_BENCHMARKS.polish),
    potential: calculatePercentile(potential, SCORE_BENCHMARKS.potential),
  };
  
  // Determine ranking
  const ranking = overall >= 85 ? 'Excellent' :
                 overall >= 75 ? 'Above Average' :
                 overall >= 55 ? 'Average' : 'Below Average';
  
  return {
    overall,
    ats,
    alignment,
    impact,
    polish,
    potential,
    percentiles,
    ranking,
  };
}

function calculatePercentile(score: number, benchmarks: { p25: number; p50: number; p75: number; p90: number }): number {
  if (score >= benchmarks.p90) return 90;
  if (score >= benchmarks.p75) return 75;
  if (score >= benchmarks.p50) return 50;
  if (score >= benchmarks.p25) return 25;
  return 10;
}

function analyzeStrengthsAndWeaknesses(
  input: DetailedAnalysisInput,
  scores: DetailedScores
): StrengthsAndWeaknesses {
  const userSkillSet = new Set(normalizeSkills([...input.userSkills, ...input.userCoursework]));
  const jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
  
  const strengths: StrengthsAndWeaknesses['strengths'] = [];
  const improvements: StrengthsAndWeaknesses['improvements'] = [];
  
  // Identify technical strengths
  const strongTechnicalSkills = input.roleRequirements
    .filter(req => userSkillSet.has(req.skill) && req.weight === 2)
    .map(req => req.skill);
  
  if (strongTechnicalSkills.length >= 2) {
    strengths.push({
      category: 'Technical Skills',
      description: `Strong technical skills in ${strongTechnicalSkills.join(', ')}.`,
      evidence: strongTechnicalSkills.map(skill => `Proficiency in ${skill}`),
      marketValue: getMarketValue(strongTechnicalSkills),
    });
  }
  
  // Software development experience
  const hasDevExperience = input.userExperience.some(exp => 
    /software|development|programming|engineering/i.test(exp.description || exp.type)
  );
  
  if (hasDevExperience) {
    strengths.push({
      category: 'Professional Experience',
      description: 'Experience with software development principles and practices.',
      evidence: input.userExperience
        .filter(exp => /software|development|programming|engineering/i.test(exp.description || exp.type))
        .map(exp => `${exp.type}: ${exp.description || 'Software development experience'}`),
      marketValue: 'High',
    });
  }
  
  // Project complexity
  if (input.resumeText && /complex.*project|large.*project|team.*project/i.test(input.resumeText)) {
    strengths.push({
      category: 'Project Management',
      description: 'Demonstrated ability to work on complex projects and deliver results.',
      evidence: ['Experience with complex project delivery'],
      marketValue: 'High',
    });
  }
  
  // Identify improvement areas
  const missingCriticalSkills = input.roleRequirements
    .filter(req => !userSkillSet.has(req.skill) && req.priority === 'required')
    .map(req => req.skill);
  
  if (missingCriticalSkills.length > 0) {
    improvements.push({
      category: 'Critical Skills Gap',
      description: `Missing essential skills: ${missingCriticalSkills.join(', ')}`,
      impact: 'Critical',
      timeToAddress: '2-6 months',
      marketRelevance: missingCriticalSkills.reduce((sum, skill) => 
        sum + (MARKET_DEMAND[skill] || 0), 0
      ),
    });
  }
  
  // Industry-specific gaps
  const roleSpecificGaps = analyzeRoleSpecificGaps(input.roleCategory, userSkillSet, jdSkills);
  improvements.push(...roleSpecificGaps);
  
  // Team collaboration gap
  const hasTeamExperience = input.resumeText ? 
    /team|collaborate|group|pair/i.test(input.resumeText) :
    input.userExperience.some(exp => /team|collaborate/i.test(exp.description || ''));
  
  if (!hasTeamExperience) {
    improvements.push({
      category: 'Collaboration Skills',
      description: 'Limited mention of collaborative team projects or code reviews.',
      impact: 'Important',
      timeToAddress: '1-3 months',
      marketRelevance: 85424, // Communication skill demand
    });
  }
  
  return { strengths, improvements };
}

function getMarketValue(skills: string[]): 'High' | 'Medium' | 'Low' {
  const totalDemand = skills.reduce((sum, skill) => sum + (MARKET_DEMAND[skill] || 0), 0);
  if (totalDemand > 50000) return 'High';
  if (totalDemand > 10000) return 'Medium';
  return 'Low';
}

function analyzeRoleSpecificGaps(
  roleCategory: string,
  userSkills: Set<string>,
  jdSkills: string[]
): StrengthsAndWeaknesses['improvements'] {
  const gaps: StrengthsAndWeaknesses['improvements'] = [];
  
  // Role-specific analysis
  switch (roleCategory) {
    case 'AI/ML':
      if (!userSkills.has('machine learning') && !userSkills.has('statistics')) {
        gaps.push({
          category: 'AI/ML Foundation',
          description: 'No explicit mention of machine learning or statistical background.',
          impact: 'Critical',
          timeToAddress: '3-6 months',
          marketRelevance: MARKET_DEMAND['machine learning'] || 0,
        });
      }
      break;
      
    case 'Data':
      if (!userSkills.has('excel') && !userSkills.has('sql')) {
        gaps.push({
          category: 'Data Analysis Tools',
          description: 'Missing fundamental data analysis tools like Excel or SQL.',
          impact: 'Critical',
          timeToAddress: '1-2 months',
          marketRelevance: (MARKET_DEMAND['excel'] || 0) + (MARKET_DEMAND['sql'] || 0),
        });
      }
      break;
      
    case 'Frontend':
      const frontendBasics = ['html', 'css', 'javascript'];
      const missingBasics = frontendBasics.filter(skill => !userSkills.has(skill));
      if (missingBasics.length > 0) {
        gaps.push({
          category: 'Frontend Fundamentals',
          description: `Missing core frontend technologies: ${missingBasics.join(', ')}.`,
          impact: 'Critical',
          timeToAddress: '2-4 months',
          marketRelevance: MARKET_DEMAND['javascript'] || 0,
        });
      }
      break;
      
    case 'Robotics':
      if (!userSkills.has('python') && !userSkills.has('c++')) {
        gaps.push({
          category: 'Robotics Programming',
          description: 'Missing core robotics programming languages (Python/C++).',
          impact: 'Critical',
          timeToAddress: '3-6 months',
          marketRelevance: (MARKET_DEMAND['python'] || 0) + (MARKET_DEMAND['c++'] || 0),
        });
      }
      break;
  }
  
  return gaps;
}

function generateActionableRecommendations(
  input: DetailedAnalysisInput,
  analysis: StrengthsAndWeaknesses
): ActionableRecommendations {
  const immediate: ActionableRecommendations['immediate'] = [];
  const shortTerm: ActionableRecommendations['shortTerm'] = [];
  const longTerm: ActionableRecommendations['longTerm'] = [];
  
  // Immediate recommendations (1-2 weeks)
  const criticalImprovements = analysis.improvements.filter(imp => imp.impact === 'Critical');
  
  if (input.resumeText && input.resumeText.length < 500) {
    immediate.push({
      action: 'Expand resume content to better showcase your experience',
      rationale: 'Current resume appears too brief to effectively demonstrate qualifications',
      example: 'Add 2-3 bullet points per experience with specific achievements and technologies used',
      impact: 'High',
    });
  }
  
  if (!input.userSkills.includes('git') && !input.userSkills.includes('version control')) {
    immediate.push({
      action: 'Highlight any experience with version control systems like Git',
      rationale: "Version control is a fundamental requirement for all development roles",
      example: "Add bullet: 'Utilized Git for version control and collaborative development'",
      impact: 'High',
    });
  }
  
  // Role-specific immediate actions
  immediate.push(...generateRoleSpecificRecommendations(input.roleCategory, input.roleTitle));
  
  // Short-term recommendations (1-4 weeks)
  if (analysis.improvements.some(imp => imp.category === 'Collaboration Skills')) {
    shortTerm.push({
      action: 'Add a bullet point under current internship experience to emphasize collaboration',
      rationale: 'Employers value candidates who can work effectively in team environments',
      timeline: '1-2 weeks',
      example: "Add: 'Collaborated with cross-functional teams to integrate AI solutions into existing systems'",
    });
  }
  
  criticalImprovements.forEach(improvement => {
    if (improvement.category.includes('Skills')) {
      shortTerm.push({
        action: `Include relevant coursework or projects related to ${improvement.description.toLowerCase()}`,
        rationale: `This addresses a critical gap: ${improvement.description}`,
        timeline: improvement.timeToAddress,
      });
    }
  });
  
  // Long-term recommendations (1-6 months)
  if (input.isStudent) {
    longTerm.push({
      action: 'Develop a portfolio of projects demonstrating your technical abilities',
      rationale: 'Portfolio projects provide concrete evidence of your skills and problem-solving ability',
      timeline: '2-4 months',
      skillsNeeded: criticalImprovements.map(imp => imp.description).slice(0, 3),
    });
  }
  
  longTerm.push({
    action: 'Gain practical experience through internships, co-ops, or open-source contributions',
    rationale: 'Real-world experience significantly strengthens your candidacy for technical roles',
    timeline: '3-6 months',
    skillsNeeded: ['Professional development', 'Team collaboration', 'Industry best practices'],
  });
  
  return { immediate, shortTerm, longTerm };
}

function generateRoleSpecificRecommendations(category: string, title: string): ActionableRecommendations['immediate'] {
  const recommendations: ActionableRecommendations['immediate'] = [];
  
  switch (category) {
    case 'AI/ML':
      recommendations.push({
        action: 'Include any relevant coursework or projects related to machine learning, data science, or statistics',
        rationale: 'AI/ML roles require demonstrated understanding of statistical and ML concepts',
        example: "Add coursework: 'Machine Learning Fundamentals, Statistics, Data Structures'",
        impact: 'High',
      });
      break;
      
    case 'Data':
      recommendations.push({
        action: 'Emphasize any experience with data analysis tools like Excel, SQL, or Python',
        rationale: 'Data analyst roles require proficiency with data manipulation and analysis tools',
        example: "Highlight: 'Analyzed datasets using Excel pivot tables and statistical functions'",
        impact: 'High',
      });
      break;
      
    case 'Frontend':
      recommendations.push({
        action: 'Showcase any web development projects or experience with HTML, CSS, and JavaScript',
        rationale: 'Frontend roles require demonstrable experience with core web technologies',
        example: "Add project: 'Built responsive personal website using HTML, CSS, and JavaScript'",
        impact: 'High',
      });
      break;
      
    case 'Robotics':
      if (title.toLowerCase().includes('aerospace') || title.toLowerCase().includes('aviation')) {
        recommendations.push({
          action: 'Include any relevant coursework or projects related to aerospace, embedded systems, or robotics',
          rationale: 'Aerospace roles value specialized knowledge in relevant engineering domains',
          example: "Add: 'Coursework in Control Systems, Embedded Programming, and Aerospace Engineering'",
          impact: 'High',
        });
      }
      break;
  }
  
  return recommendations;
}

function analyzeMarketInsights(input: DetailedAnalysisInput, scores: DetailedScores): DetailedAnalysisResult['marketInsights'] {
  const userSkillSet = new Set(normalizeSkills([...input.userSkills, ...input.userCoursework]));
  const jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
  
  // Analyze skill demand for user's skills and missing skills
  const skillDemandAnalysis: Record<string, { current: number; trend: string; priority: number }> = {};
  
  [...userSkillSet, ...jdSkills].forEach(skill => {
    const demand = MARKET_DEMAND[skill] || 0;
    skillDemandAnalysis[skill] = {
      current: demand,
      trend: demand > 10000 ? 'Rising' : demand > 5000 ? 'Stable' : 'Declining',
      priority: userSkillSet.has(skill) ? 1 : jdSkills.includes(skill) ? 2 : 3,
    };
  });
  
  // Determine competitive position
  const strongSkills = Array.from(userSkillSet).filter(skill => (MARKET_DEMAND[skill] || 0) > 10000);
  const competitivePosition = strongSkills.length >= 3 
    ? `Strong competitive position with ${strongSkills.length} high-demand skills`
    : strongSkills.length >= 1
    ? `Moderate competitive position. Build on ${strongSkills[0]} expertise`
    : 'Developing competitive position. Focus on high-demand skills first';
  
  // Calculate salary impact
  const totalSkillValue = Array.from(userSkillSet).reduce((sum, skill) => sum + (MARKET_DEMAND[skill] || 0), 0);
  const salaryImpact = totalSkillValue > 100000 
    ? 'High salary potential - strong skill portfolio'
    : totalSkillValue > 50000
    ? 'Medium-high salary potential - good foundation'
    : 'Entry-level salary range - focus on core skills';
  
  // Project career trajectory
  const careerTrajectory = input.isStudent
    ? `As a ${input.yearLevel || 'student'}, focus on ${input.roleCategory} fundamentals for ${scores.overall >= 75 ? 'competitive' : 'solid'} entry-level positioning`
    : `Current profile suggests ${scores.overall >= 75 ? 'strong' : 'developing'} candidacy for ${input.roleCategory} roles`;
  
  return {
    skillDemandAnalysis,
    competitivePosition,
    salaryImpact,
    careerTrajectory,
  };
}

function calculateAnalysisConfidence(input: DetailedAnalysisInput): number {
  let confidence = 70; // Base confidence
  
  // Data quality factors
  if (input.resumeText && input.resumeText.length > 500) confidence += 15;
  if (input.userSkills.length >= 5) confidence += 10;
  if (input.userCoursework.length >= 3) confidence += 5;
  if (input.userExperience.length >= 2) confidence += 5;
  if (input.jdText.length > 1000) confidence += 5;
  
  return Math.min(95, confidence);
}

export { SCORE_BENCHMARKS };