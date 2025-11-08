import { normalizeSkills, extractSkillsFromText } from './normalization';
import { RealMarketAnalysisEngine } from './market-analysis';

// Market demand and industry weights are now loaded dynamically
// via RealMarketAnalysisEngine from /api/market-data

export interface GapAnalysisInput {
  userSkills: string[];
  userCoursework?: string[];
  userExperience?: Array<{ type: string; duration: string; description: string }>;
  resumeText?: string;
  roleRequirements: Array<{ skill: string; weight: number; priority: 'required' | 'preferred' }>;
  roleCategory: string;
  jdText: string;
  jdTitle: string;
  dictionary: Set<string>;
  isStudent?: boolean;
  yearLevel?: string;
}

export interface SkillGap {
  skill: string;
  weight: number;
  priority: 'required' | 'preferred';
  marketDemand: number;
  gapSeverity: 'critical' | 'important' | 'beneficial';
  timeToLearn: string;
  learningPath: string[];
  resources: Array<{ title: string; url: string; type: string; difficulty: string }>;
  careerImpact: string;
}

export interface GapAnalysisResult {
  overallReadiness: number;
  criticalGaps: SkillGap[];
  importantGaps: SkillGap[];
  beneficialGaps: SkillGap[];
  strengths: string[];
  quickWins: SkillGap[];
  longTermGoals: SkillGap[];
  industryInsights: {
    marketPosition: string;
    competitiveAdvantage: string[];
    trendingSkills: string[];
    salaryImpact: string;
  };
  learningRecommendations: {
    immediate: string[];
    nextMonth: string[];
    nextQuarter: string[];
  };
  confidenceScore: number;
}

export function analyzeSkillGaps(input: GapAnalysisInput): GapAnalysisResult {
  const userSkillSet = new Set(normalizeSkills([
    ...input.userSkills,
    ...(input.userCoursework || [])
  ]));
  
  // Extract additional skills from resume if provided
  let resumeSkills: string[] = [];
  if (input.resumeText) {
    resumeSkills = extractSkillsFromText(input.resumeText, input.dictionary);
    resumeSkills.forEach(skill => userSkillSet.add(skill));
  }
  
  // Extract skills from job description
  const jdSkills = extractSkillsFromText(input.jdText, input.dictionary);
  
  // Initialize market analysis engine with provided market data or load dynamically
  const marketEngine = new RealMarketAnalysisEngine(input.marketData);
  
  // Calculate gaps
  const skillGaps = calculateSkillGaps(input, userSkillSet, jdSkills, marketEngine);
  
  // Categorize gaps by severity
  const criticalGaps = skillGaps.filter(g => g.gapSeverity === 'critical');
  const importantGaps = skillGaps.filter(g => g.gapSeverity === 'important');
  const beneficialGaps = skillGaps.filter(g => g.gapSeverity === 'beneficial');
  
  // Calculate overall readiness
  const overallReadiness = calculateReadiness(input.roleRequirements, userSkillSet);
  
  // Identify strengths
  const strengths = identifyStrengths(input.roleRequirements, userSkillSet, input.roleCategory);
  
  // Prioritize learning
  const quickWins = identifyQuickWins(skillGaps);
  const longTermGoals = identifyLongTermGoals(skillGaps);
  
  // Generate industry insights
  const industryInsights = generateIndustryInsights(input.roleCategory, userSkillSet, jdSkills, marketEngine);
  
  // Create learning recommendations
  const learningRecommendations = generateLearningRecommendations(
    criticalGaps, 
    importantGaps, 
    input.isStudent,
    input.yearLevel
  );
  
  // Calculate confidence in analysis
  const confidenceScore = calculateConfidenceScore(input, skillGaps.length);
  
  return {
    overallReadiness,
    criticalGaps,
    importantGaps,
    beneficialGaps,
    strengths,
    quickWins,
    longTermGoals,
    industryInsights,
    learningRecommendations,
    confidenceScore,
  };
}

function calculateSkillGaps(
  input: GapAnalysisInput,
  userSkills: Set<string>,
  jdSkills: string[],
  marketEngine: RealMarketAnalysisEngine
): SkillGap[] {
  const gaps: SkillGap[] = [];
  // Industry weights are now dynamic - can be calculated from market data if needed
  const industryWeight = 1.0; // Default, can be made dynamic based on market data
  
  // Analyze role requirements
  for (const req of input.roleRequirements) {
    if (!userSkills.has(req.skill)) {
      const marketDemand = marketEngine.getMarketDemand(req.skill);
      const weightedDemand = marketDemand * industryWeight;
      
      gaps.push({
        skill: req.skill,
        weight: req.weight,
        priority: req.priority,
        marketDemand: weightedDemand,
        gapSeverity: calculateGapSeverity(req, weightedDemand),
        timeToLearn: estimateTimeToLearn(req.skill, req.weight),
        learningPath: generateLearningPath(req.skill, input.isStudent),
        resources: [], // Will be populated by resource engine
        careerImpact: calculateCareerImpact(req.skill, weightedDemand, input.roleCategory),
      });
    }
  }
  
  // Analyze additional JD skills
  for (const skill of jdSkills) {
    if (!userSkills.has(skill) && !gaps.find(g => g.skill === skill)) {
      const marketDemand = marketEngine.getMarketDemand(skill);
      if (marketDemand > 1000) { // Only include skills with significant demand
        gaps.push({
          skill,
          weight: 1,
          priority: 'preferred',
          marketDemand: marketDemand * industryWeight,
          gapSeverity: 'beneficial',
          timeToLearn: estimateTimeToLearn(skill, 1),
          learningPath: generateLearningPath(skill, input.isStudent),
          resources: [],
          careerImpact: calculateCareerImpact(skill, marketDemand, input.roleCategory),
        });
      }
    }
  }
  
  // Sort by impact (priority + market demand)
  return gaps.sort((a, b) => {
    const aScore = (a.priority === 'required' ? 2 : 1) * a.weight * Math.log(a.marketDemand + 1);
    const bScore = (b.priority === 'required' ? 2 : 1) * b.weight * Math.log(b.marketDemand + 1);
    return bScore - aScore;
  });
}

function calculateGapSeverity(
  req: { priority: string; weight: number },
  marketDemand: number
): 'critical' | 'important' | 'beneficial' {
  if (req.priority === 'required' && req.weight === 2) return 'critical';
  if (req.priority === 'required' || marketDemand > 10000) return 'important';
  return 'beneficial';
}

function estimateTimeToLearn(skill: string, weight: number): string {
  const baseTime = getBaseTimeToLearn(skill);
  const multiplier = weight === 2 ? 1.5 : 1.0;
  const weeks = Math.ceil(baseTime * multiplier);
  
  if (weeks <= 2) return '1-2 weeks';
  if (weeks <= 4) return '3-4 weeks';
  if (weeks <= 8) return '1-2 months';
  if (weeks <= 12) return '2-3 months';
  return '3+ months';
}

function getBaseTimeToLearn(skill: string): number {
  // Base learning time in weeks for intern-level proficiency
  const timeMap: Record<string, number> = {
    'html': 1,
    'css': 2,
    'javascript': 4,
    'python': 3,
    'git': 1,
    'sql': 3,
    'react': 4,
    'excel': 2,
    'data visualization': 3,
    'machine learning': 8,
    'docker': 3,
    'linux': 4,
    'c++': 8,
    'unity': 6,
    'ros': 12,
    'statistics': 6,
  };
  
  return timeMap[skill.toLowerCase()] || 4; // Default to 4 weeks
}

function generateLearningPath(skill: string, isStudent: boolean = true): string[] {
  const paths: Record<string, string[]> = {
    'python': [
      'Learn Python syntax basics',
      'Practice with coding exercises',
      'Build a simple project',
      'Explore relevant libraries'
    ],
    'machine learning': [
      'Study math fundamentals (statistics, linear algebra)',
      'Learn Python and data libraries (pandas, numpy)',
      'Complete ML course (Coursera/edX)',
      'Build ML project from scratch'
    ],
    'react': [
      'Master HTML, CSS, JavaScript first',
      'Learn React fundamentals',
      'Build component-based project',
      'Add state management and routing'
    ],
    'sql': [
      'Learn basic query syntax',
      'Practice with sample databases',
      'Study joins and advanced queries',
      'Apply to real data project'
    ],
    'docker': [
      'Understand containerization concepts',
      'Learn basic Docker commands',
      'Create Dockerfile for simple app',
      'Practice with docker-compose'
    ],
  };
  
  return paths[skill.toLowerCase()] || [
    `Study ${skill} fundamentals`,
    `Practice with tutorials and exercises`,
    `Build a project using ${skill}`,
    `Apply knowledge in real scenario`
  ];
}

function calculateCareerImpact(skill: string, marketDemand: number, roleCategory: string): string {
  if (marketDemand > 20000) return 'High impact - Opens many opportunities';
  if (marketDemand > 10000) return 'Medium-high impact - Valuable skill in market';
  if (marketDemand > 5000) return 'Medium impact - Good addition to skillset';
  if (marketDemand > 1000) return 'Low-medium impact - Useful for specialization';
  return 'Low impact - Nice to have skill';
}

function calculateReadiness(
  requirements: Array<{ skill: string; priority: string; weight: number }>,
  userSkills: Set<string>
): number {
  const requiredSkills = requirements.filter(r => r.priority === 'required');
  const metRequired = requiredSkills.filter(r => userSkills.has(r.skill)).length;
  
  if (requiredSkills.length === 0) return 100;
  return Math.round((metRequired / requiredSkills.length) * 100);
}

function identifyStrengths(
  requirements: Array<{ skill: string; priority: string; weight: number }>,
  userSkills: Set<string>,
  roleCategory: string
): string[] {
  const strengths: string[] = [];
  const metRequired = requirements.filter(r => 
    r.priority === 'required' && userSkills.has(r.skill)
  ).length;
  const totalRequired = requirements.filter(r => r.priority === 'required').length;
  
  if (metRequired >= totalRequired * 0.7) {
    strengths.push('Strong foundation in core required skills');
  }
  
  // Check for high-value skills
  const highValueSkills = ['python', 'javascript', 'sql', 'git'];
  const hasHighValue = highValueSkills.filter(s => userSkills.has(s));
  if (hasHighValue.length >= 2) {
    strengths.push(`Excellent foundation with ${hasHighValue.join(', ')}`);
  }
  
  // Industry-specific strengths
  if (roleCategory === 'AI/ML' && userSkills.has('python') && userSkills.has('statistics')) {
    strengths.push('Perfect programming foundation for AI/ML career');
  }
  
  if (roleCategory === 'Frontend' && userSkills.has('html') && userSkills.has('css') && userSkills.has('javascript')) {
    strengths.push('Complete web development foundation');
  }
  
  return strengths;
}

function identifyQuickWins(gaps: SkillGap[]): SkillGap[] {
  return gaps.filter(gap => {
    const isQuickToLearn = ['1-2 weeks', '3-4 weeks'].includes(gap.timeToLearn);
    const hasImpact = gap.marketDemand > 5000 || gap.priority === 'required';
    return isQuickToLearn && hasImpact;
  }).slice(0, 3);
}

function identifyLongTermGoals(gaps: SkillGap[]): SkillGap[] {
  return gaps.filter(gap => 
    gap.timeToLearn.includes('months') && 
    (gap.gapSeverity === 'critical' || gap.marketDemand > 15000)
  ).slice(0, 3);
}

function generateIndustryInsights(
  roleCategory: string,
  userSkills: Set<string>,
  jdSkills: string[],
  marketEngine: RealMarketAnalysisEngine
): {
  marketPosition: string;
  competitiveAdvantage: string[];
  trendingSkills: string[];
  salaryImpact: string;
} {
  const marketPosition = getMarketPosition(roleCategory, userSkills, marketEngine);
  const competitiveAdvantage = getCompetitiveAdvantage(userSkills, roleCategory);
  const trendingSkills = getTrendingSkills(roleCategory);
  const salaryImpact = getSalaryImpact(userSkills, roleCategory);
  
  return {
    marketPosition,
    competitiveAdvantage,
    trendingSkills,
    salaryImpact,
  };
}

function getMarketPosition(roleCategory: string, userSkills: Set<string>, marketEngine: RealMarketAnalysisEngine): string {
  const categoryInsights: Record<string, (engine: RealMarketAnalysisEngine) => string> = {
    'AI/ML': (engine) => {
      const mlDemand = engine.getMarketDemand('machine learning');
      return `AI/ML has ${mlDemand.toLocaleString()} job mentions. High growth but competitive field.`;
    },
    'Data': (engine) => {
      const dataDemand = engine.getMarketDemand('data analysis');
      return `Data Analysis has ${dataDemand.toLocaleString()} mentions. Strong, accessible entry path.`;
    },
    'Backend': (engine) => {
      const javaDemand = engine.getMarketDemand('java');
      return `Backend development has consistent demand with ${javaDemand.toLocaleString()} Java mentions.`;
    },
    'Frontend': () => 'Frontend has moderate visibility but high actual demand in market.',
    'DevOps': (engine) => {
      const awsDemand = engine.getMarketDemand('aws');
      return `DevOps is fastest-growing with ${awsDemand.toLocaleString()} AWS mentions.`;
    },
    'Robotics': (engine) => {
      const cppDemand = engine.getMarketDemand('c++');
      return `Robotics has highest demand (${cppDemand.toLocaleString()} C++ mentions) but specialized.`;
    },
    'Game Dev': () => 'Game development is niche but passion-driven market.',
  };
  
  const insightFn = categoryInsights[roleCategory];
  return insightFn ? insightFn(marketEngine) : 'Market analysis not available for this category.';
}

function getCompetitiveAdvantage(userSkills: Set<string>, roleCategory: string): string[] {
  const advantages: string[] = [];
  
  // Universal advantages
  if (userSkills.has('python')) advantages.push('Python proficiency (22K+ job mentions)');
  if (userSkills.has('git')) advantages.push('Version control experience');
  if (userSkills.has('sql')) advantages.push('Data skills (18K+ mentions)');
  
  // Category-specific advantages
  const categoryAdvantages: Record<string, Record<string, string>> = {
    'AI/ML': {
      'statistics': 'Statistical foundation for ML',
      'pandas': 'Data manipulation expertise',
      'jupyter notebooks': 'ML workflow proficiency'
    },
    'Frontend': {
      'react': 'Modern framework expertise',
      'typescript': 'Professional development skills',
      'figma': 'Design collaboration skills'
    },
    'DevOps': {
      'docker': 'Containerization knowledge',
      'aws': 'Cloud platform expertise',
      'linux': 'System administration skills'
    }
  };
  
  const catAdvantages = categoryAdvantages[roleCategory] || {};
  for (const [skill, desc] of Object.entries(catAdvantages)) {
    if (userSkills.has(skill)) advantages.push(desc);
  }
  
  return advantages;
}

function getTrendingSkills(roleCategory: string): string[] {
  const trending: Record<string, string[]> = {
    'AI/ML': ['Large Language Models', 'MLOps', 'Computer Vision', 'PyTorch'],
    'Data': ['dbt', 'Snowflake', 'Apache Spark', 'Data Engineering'],
    'Backend': ['Microservices', 'GraphQL', 'Serverless', 'Kubernetes'],
    'Frontend': ['Next.js', 'Tailwind CSS', 'React Native', 'TypeScript'],
    'DevOps': ['Infrastructure as Code', 'GitOps', 'Service Mesh', 'Observability'],
    'Robotics': ['ROS 2', 'Autonomous Navigation', 'SLAM', 'Edge Computing'],
    'Game Dev': ['Unreal Engine 5', 'VR/AR', 'Procedural Generation', 'Multiplayer']
  };
  
  return trending[roleCategory] || [];
}

function getSalaryImpact(userSkills: Set<string>, roleCategory: string): string {
  const hasHighValueSkills = ['python', 'aws', 'machine learning', 'react'].some(s => userSkills.has(s));
  const skillCount = userSkills.size;
  
  if (hasHighValueSkills && skillCount >= 8) return 'High salary potential - Strong skill portfolio';
  if (hasHighValueSkills && skillCount >= 5) return 'Medium-high salary potential - Good foundation';
  if (skillCount >= 5) return 'Medium salary potential - Solid skill base';
  return 'Entry-level salary range - Focus on core skills first';
}

function generateLearningRecommendations(
  criticalGaps: SkillGap[],
  importantGaps: SkillGap[],
  isStudent: boolean = true,
  yearLevel?: string
): {
  immediate: string[];
  nextMonth: string[];
  nextQuarter: string[];
} {
  const immediate: string[] = [];
  const nextMonth: string[] = [];
  const nextQuarter: string[] = [];
  
  // Immediate (1-2 weeks) - Critical gaps that are quick to learn
  const quickCritical = criticalGaps.filter(g => 
    g.timeToLearn === '1-2 weeks' || g.timeToLearn === '3-4 weeks'
  );
  quickCritical.slice(0, 2).forEach(gap => {
    immediate.push(`Learn ${gap.skill} - ${gap.careerImpact}`);
  });
  
  // If no quick critical gaps, add high-impact basics
  if (immediate.length === 0) {
    if (criticalGaps.length > 0) {
      immediate.push(`Start learning ${criticalGaps[0].skill} - highest priority skill`);
    }
    immediate.push('Review job requirements and create study plan');
  }
  
  // Next month - Remaining critical gaps + important quick wins
  criticalGaps.slice(0, 3).forEach(gap => {
    if (!immediate.some(item => item.includes(gap.skill))) {
      nextMonth.push(`Master ${gap.skill} - essential for role readiness`);
    }
  });
  
  // Next quarter - Important gaps and advanced skills
  importantGaps.slice(0, 3).forEach(gap => {
    nextQuarter.push(`Develop ${gap.skill} - ${gap.careerImpact.toLowerCase()}`);
  });
  
  // Student-specific recommendations
  if (isStudent) {
    if (yearLevel === 'Freshman' || yearLevel === 'Sophomore') {
      nextQuarter.push('Build 2-3 portfolio projects showcasing your skills');
      nextQuarter.push('Apply for internships and gain practical experience');
    } else {
      nextMonth.push('Network with professionals in your target industry');
      nextQuarter.push('Prepare for technical interviews and coding challenges');
    }
  }
  
  return { immediate, nextMonth, nextQuarter };
}

function calculateConfidenceScore(input: GapAnalysisInput, gapsFound: number): number {
  let confidence = 70; // Base confidence
  
  // More data = higher confidence
  if (input.resumeText) confidence += 15;
  if (input.userCoursework && input.userCoursework.length > 0) confidence += 10;
  if (input.userExperience && input.userExperience.length > 0) confidence += 10;
  
  // Job description quality
  if (input.jdText.length > 500) confidence += 5;
  if (input.jdText.length > 1000) confidence += 5;
  
  // Skill coverage in our data
  if (gapsFound > 0 && gapsFound < 20) confidence += 5; // Reasonable number of gaps
  
  return Math.min(95, confidence); // Cap at 95%
}

// MARKET_DEMAND and INDUSTRY_WEIGHTS are now loaded dynamically via RealMarketAnalysisEngine