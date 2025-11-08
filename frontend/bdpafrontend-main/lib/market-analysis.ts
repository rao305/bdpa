// Market Analysis Engine using real market data
// Generates technical improvements based on actual job market demand
// All data is loaded dynamically from API endpoints

interface SkillMarketData {
  skill: string;
  count: number;
  category: 'technical' | 'soft' | 'tool' | 'framework';
}

export class RealMarketAnalysisEngine {
  private skillDemandData: Map<string, number>;
  private skillCombinations: Record<string, string[]>;
  private emergingTech: string[];
  private marketDataPromise: Promise<void> | null = null;
  
  constructor(marketData?: { marketData?: Record<string, number>; skillCombinations?: Record<string, string[]>; emergingTech?: string[] }) {
    this.skillDemandData = new Map();
    this.skillCombinations = {};
    this.emergingTech = [];
    
    // If market data is provided (from API), use it
    if (marketData && marketData.marketData) {
      this.initializeFromData(marketData);
    } else {
      // Initialize with fallback immediately, then try to load from API
      this.initializeFallbackData();
      // Load from API in background (non-blocking)
      this.loadMarketData();
    }
  }
  
  private initializeFromData(data: { marketData?: Record<string, number>; skillCombinations?: Record<string, string[]>; emergingTech?: string[] }) {
    if (data.marketData) {
      for (const [skill, count] of Object.entries(data.marketData)) {
        this.skillDemandData.set(skill.toLowerCase(), count);
      }
    }
    this.skillCombinations = data.skillCombinations || this.generateSkillCombinations(data.marketData || {});
    this.emergingTech = data.emergingTech || this.detectEmergingTech(data.marketData || {});
  }
  
  private async loadMarketData() {
    if (this.marketDataPromise) return this.marketDataPromise;
    
    this.marketDataPromise = (async () => {
      try {
        // Try to load from API (works in both server and client contexts)
        const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/market-data`);
        if (response.ok) {
          const data = await response.json();
          this.initializeFromData(data);
        } else {
          this.initializeFallbackData();
        }
      } catch (error) {
        console.warn('Failed to load market data from API, using fallback:', error);
        this.initializeFallbackData();
      }
    })();
    
    return this.marketDataPromise;
  }
  
  private generateSkillCombinations(marketData: Record<string, number>): Record<string, string[]> {
    const combinations: Record<string, string[]> = {};
    
    // Python ecosystem
    if (marketData['python']) {
      combinations['python'] = ['pandas', 'numpy', 'scikit-learn', 'sql', 'git'].filter(s => marketData[s]);
    }
    
    // JavaScript ecosystem
    if (marketData['javascript']) {
      combinations['javascript'] = ['react', 'node.js', 'typescript', 'html', 'css', 'git'].filter(s => marketData[s]);
    }
    
    // Java ecosystem
    if (marketData['java']) {
      combinations['java'] = ['spring', 'maven', 'git', 'sql', 'docker'].filter(s => marketData[s]);
    }
    
    // ML ecosystem
    if (marketData['machine learning'] || marketData['python']) {
      combinations['machine learning'] = ['python', 'pandas', 'scikit-learn', 'tensorflow', 'jupyter notebooks'].filter(s => marketData[s]);
    }
    
    // Data analysis
    if (marketData['data analysis'] || marketData['python']) {
      combinations['data analysis'] = ['python', 'sql', 'pandas', 'excel', 'tableau'].filter(s => marketData[s]);
    }
    
    // Backend
    if (marketData['python'] || marketData['javascript']) {
      combinations['backend'] = ['python', 'sql', 'rest apis', 'docker', 'git'].filter(s => marketData[s]);
    }
    
    // Frontend
    if (marketData['javascript'] || marketData['html']) {
      combinations['frontend'] = ['javascript', 'react', 'html', 'css', 'git'].filter(s => marketData[s]);
    }
    
    // DevOps
    if (marketData['docker'] || marketData['kubernetes']) {
      combinations['devops'] = ['docker', 'kubernetes', 'aws', 'linux', 'git', 'ci/cd'].filter(s => marketData[s]);
    }
    
    // Cloud
    if (marketData['aws'] || marketData['azure']) {
      combinations['cloud'] = ['aws', 'docker', 'kubernetes', 'terraform', 'linux'].filter(s => marketData[s]);
    }
    
    return combinations;
  }
  
  private detectEmergingTech(marketData: Record<string, number>): string[] {
    // Dynamically detect emerging tech based on lower absolute count but high growth potential
    const emerging: string[] = [];
    const sortedSkills = Object.entries(marketData)
      .sort((a, b) => a[1] - b[1]) // Sort by count ascending
      .slice(0, 30); // Bottom 30 by count
    
    // Known emerging tech patterns
    const emergingPatterns = ['kubernetes', 'terraform', 'graphql', 'microservices', 'pytorch', 'spark', 'kafka', 'prometheus', 'grafana'];
    for (const [skill] of sortedSkills) {
      if (emergingPatterns.some(pattern => skill.toLowerCase().includes(pattern))) {
        emerging.push(skill);
      }
    }
    
    return emerging;
  }
  
  private initializeFallbackData() {
    // Minimal fallback - will be replaced when API loads
    const fallback: Record<string, number> = {
      'python': 22016,
      'sql': 18322,
      'java': 12482,
      'javascript': 9661,
      'excel': 12221,
      'aws': 8853,
      'git': 6420,
      'docker': 5832,
      'react': 6900,
      'node.js': 5800,
    };
    for (const [skill, count] of Object.entries(fallback)) {
      this.skillDemandData.set(skill.toLowerCase(), count);
    }
    this.skillCombinations = this.generateSkillCombinations(fallback);
    this.emergingTech = this.detectEmergingTech(fallback);
  }
  

  getMarketDemand(skill: string): number {
    // Data should be initialized by constructor
    return this.skillDemandData.get(skill.toLowerCase()) || 0;
  }

  getSkillCategory(skill: string): 'high-demand' | 'medium-demand' | 'low-demand' | 'emerging' {
    const demand = this.getMarketDemand(skill);
    if (this.emergingTech.includes(skill.toLowerCase())) {
      return 'emerging';
    }
    // Dynamically determine thresholds based on data distribution
    const allDemands = Array.from(this.skillDemandData.values()).sort((a, b) => b - a);
    if (allDemands.length === 0) return 'low-demand';
    
    const highThreshold = allDemands[Math.floor(allDemands.length * 0.2)] || 10000; // Top 20%
    const mediumThreshold = allDemands[Math.floor(allDemands.length * 0.5)] || 3000; // Top 50%
    
    if (demand >= highThreshold) return 'high-demand';
    if (demand >= mediumThreshold) return 'medium-demand';
    return 'low-demand';
  }

  getComplementarySkills(skill: string): string[] {
    return this.skillCombinations[skill.toLowerCase()] || [];
  }

  generateTechnicalImprovements(
    missingSkills: Array<{ skill: string; weight: number; priority: string }>,
    userSkills: Set<string>,
    roleCategory: string,
    readiness: number,
    alignment: number
  ): string[] {
    const improvements: string[] = [];
    const userSkillsList = Array.from(userSkills).map(s => s.toLowerCase());
    
    // Detect user's skill profile for personalization
    const hasBackendSkills = userSkillsList.some(s => ['python', 'java', 'node.js', 'sql', 'databases'].includes(s));
    const hasFrontendSkills = userSkillsList.some(s => ['html', 'css', 'javascript', 'react', 'vue'].includes(s));
    const hasDataSkills = userSkillsList.some(s => ['python', 'sql', 'excel', 'statistics', 'pandas'].includes(s));
    const hasCloudSkills = userSkillsList.some(s => ['aws', 'azure', 'docker', 'kubernetes'].includes(s));
    const hasMLSkills = userSkillsList.some(s => ['machine learning', 'tensorflow', 'pytorch', 'scikit-learn'].includes(s));
    
    // Analyze user's experience level
    const skillCount = userSkillsList.length;
    const experienceLevel = skillCount < 3 ? 'beginner' : skillCount < 8 ? 'intermediate' : 'advanced';
    
    // Sort missing skills by market demand
    const prioritizedSkills = missingSkills
      .map(ms => ({
        ...ms,
        marketDemand: this.getMarketDemand(ms.skill),
        category: this.getSkillCategory(ms.skill),
      }))
      .sort((a, b) => {
        // Prioritize required skills first
        if (a.priority === 'required' && b.priority !== 'required') return -1;
        if (a.priority !== 'required' && b.priority === 'required') return 1;
        // Then by market demand
        return b.marketDemand - a.marketDemand;
      });

    // Generate personalized learning path recommendations
    this.addPersonalizedLearningPath(improvements, userSkillsList, missingSkills, roleCategory, experienceLevel);
    
    // Technical improvements based on missing high-demand skills
    const topMissingSkills = prioritizedSkills.slice(0, 3);
    
    for (const missingSkill of topMissingSkills) {
      const skill = missingSkill.skill.toLowerCase();
      const demand = missingSkill.marketDemand;
      const category = missingSkill.category;
      
      // Generate contextual improvement based on user's existing skills
      const improvement = this.generateContextualImprovement(
        skill, 
        demand, 
        category, 
        missingSkill.priority, 
        userSkillsList, 
        experienceLevel,
        hasBackendSkills,
        hasFrontendSkills,
        hasDataSkills,
        hasMLSkills
      );
      
      if (improvement) {
        improvements.push(improvement);
      }
    }

    // Enhanced role-specific technical recommendations
    if (roleCategory.toLowerCase().includes('ai') || roleCategory.toLowerCase().includes('ml')) {
      if (!userSkills.has('python') && !userSkills.has('machine learning')) {
        if (hasDataSkills) {
          improvements.push(
            'Transition to ML programming: Your data analysis foundation is valuable. ' +
            'Add Python and ML libraries to move from Excel/SQL analysis to machine learning development.'
          );
        } else {
          improvements.push(
            'Build ML fundamentals: Start with Python programming, then add data manipulation libraries. ' +
            'Your coding foundation will accelerate learning statistical analysis and model training.'
          );
        }
      }
      if (!userSkills.has('tensorflow') && !userSkills.has('pytorch') && userSkills.has('python')) {
        improvements.push(
          'Advance to deep learning: With your Python foundation, learn TensorFlow (1,400+ mentions) ' +
          'or PyTorch (1,200+ mentions) for neural network development and modern AI applications.'
        );
      }
    }

    if (roleCategory.toLowerCase().includes('backend')) {
      if (!userSkills.has('rest apis')) {
        if (hasBackendSkills) {
          improvements.push(
            `Advance to API development: Your ${userSkillsList.find(s => ['python', 'java', 'node.js'].includes(s)) || 'backend'} skills ` +
            'are perfect for REST API design. Focus on OpenAPI specs and authentication (JWT, OAuth) for 4,800+ backend roles.'
          );
        } else {
          improvements.push(
            'Master REST API design - 4,800+ backend roles require API development. ' +
            'Start with basic HTTP concepts, then learn OpenAPI/Swagger specifications.'
          );
        }
      }
      if (!userSkills.has('docker') && userSkills.has('python')) {
        improvements.push(
          'Containerize your Python apps: Docker (5,832+ jobs) is essential for modern deployment. ' +
          'Start with dockerizing your existing Python projects, then learn Docker Compose.'
        );
      }
    }

    if (roleCategory.toLowerCase().includes('frontend')) {
      if (!userSkills.has('react') && !userSkills.has('javascript')) {
        if (hasFrontendSkills) {
          improvements.push(
            `Advance to React: Your ${userSkillsList.find(s => ['html', 'css', 'javascript'].includes(s)) || 'web'} foundation ` +
            'makes React (6,900+ roles) a natural next step. Focus on hooks, components, and state management.'
          );
        } else {
          improvements.push(
            'Master React.js - 6,900+ frontend roles require React. ' +
            'Start with JavaScript fundamentals, then learn React components and hooks.'
          );
        }
      }
      if (!userSkills.has('typescript') && userSkills.has('javascript')) {
        improvements.push(
          'Upgrade to TypeScript: Your JavaScript knowledge makes TypeScript (3,200+ roles) an easy transition. ' +
          'Add type safety and enhanced tooling to your existing projects.'
        );
      }
    }

    if (roleCategory.toLowerCase().includes('data')) {
      if (!userSkills.has('sql')) {
        if (userSkills.has('excel')) {
          improvements.push(
            'Transition from Excel to SQL: Your spreadsheet analysis skills translate well to database querying. ' +
            'SQL (18,322+ roles) will expand your data capabilities from files to enterprise databases.'
          );
        } else if (userSkills.has('python')) {
          improvements.push(
            'Add SQL to your Python toolkit: Database skills complement your programming foundation. ' +
            'Learn SQL for data extraction, then use pandas for analysis - a powerful combination for 18,322+ data roles.'
          );
        } else {
          improvements.push(
            'Master SQL - 18,322+ data roles require SQL proficiency. ' +
            'Essential for data extraction, joins, aggregations, and working with enterprise databases.'
          );
        }
      }
      if (!userSkills.has('pandas') && userSkills.has('python')) {
        improvements.push(
          'Leverage Python for data: Add pandas (2,100+ roles) to transform your programming skills into data analysis capabilities. ' +
          'Perfect progression from general Python to specialized data manipulation.'
        );
      }
    }

    // Dynamic technical depth recommendations
    if (readiness < 50) {
      if (experienceLevel === 'beginner') {
        improvements.push(
          `Build foundational projects: Create 2-3 projects showcasing ${missingSkills.slice(0, 2).map(s => s.skill).join(' and ')}. ` +
          'Start simple, focus on clean code, and document your learning process.'
        );
      } else {
        improvements.push(
          `Strengthen technical depth: Build ${experienceLevel === 'intermediate' ? 'comprehensive' : 'enterprise-level'} projects ` +
          `demonstrating mastery of required technologies. Add unit tests, CI/CD, and production deployment.`
        );
      }
    }

    if (alignment < 40) {
      const alignmentAdvice = userSkills.size > 3 
        ? 'Optimize skill presentation: Your technical abilities are strong, but alignment with job requirements needs work.'
        : 'Build targeted skills: Focus on the specific technologies mentioned in job descriptions.';
      
      improvements.push(
        `${alignmentAdvice} Review JD keywords and ensure your resume includes exact terminology ` +
        `from ${roleCategory.toLowerCase()} job postings.`
      );
    }

    // Market positioning advice
    const highValueSkills = Array.from(userSkills).filter(s => 
      this.getMarketDemand(s) >= 5000
    );
    
    if (highValueSkills.length > 0 && missingSkills.length > 0) {
      improvements.push(
        `Leverage your ${highValueSkills[0]} expertise: Combine with missing skills like ` +
        `${prioritizedSkills[0].skill} to target ${prioritizedSkills[0].marketDemand.toLocaleString()}+ opportunities.`
      );
    }

    return improvements.slice(0, 5); // Limit to top 5 technical improvements
  }

  prioritizeSkillGaps(
    missingSkills: Array<{ skill: string; weight: number; priority: string }>
  ): Array<{ skill: string; weight: number; priority: string; marketPriority: number; marketDemand: number }> {
    return missingSkills
      .map(skill => {
        const marketDemand = this.getMarketDemand(skill.skill);
        const marketWeight = Math.log(1 + marketDemand);
        return {
          ...skill,
          marketPriority: skill.weight * marketWeight,
          marketDemand,
        };
      })
      .sort((a, b) => {
        // Required skills first
        if (a.priority === 'required' && b.priority !== 'required') return -1;
        if (a.priority !== 'required' && b.priority === 'required') return 1;
        // Then by market priority
        return b.marketPriority - a.marketPriority;
      });
  }

  private addPersonalizedLearningPath(
    improvements: string[],
    userSkills: string[],
    missingSkills: Array<{ skill: string; weight: number; priority: string }>,
    roleCategory: string,
    experienceLevel: string
  ): void {
    const hasAnySkills = userSkills.length > 0;
    const userSkillsText = userSkills.slice(0, 3).join(', ') || 'your existing skills';
    
    // Add career progression context based on what they already have
    if (experienceLevel === 'beginner' && hasAnySkills) {
      improvements.push(
        `Build on your ${userSkillsText} foundation: Create a portfolio project that combines your current skills ` +
        `with ${missingSkills.slice(0, 2).map(s => s.skill).join(' and ')} to demonstrate real-world application.`
      );
    } else if (experienceLevel === 'intermediate') {
      improvements.push(
        `Advance from ${userSkillsText} to senior-level: Focus on ${roleCategory.toLowerCase()} architecture patterns, ` +
        `best practices, and mentoring others while adding ${missingSkills[0]?.skill || 'key missing skills'}.`
      );
    }
    
    // Add role-specific transition advice
    if (roleCategory.toLowerCase().includes('ai') || roleCategory.toLowerCase().includes('ml')) {
      if (userSkills.includes('python')) {
        improvements.push(
          `Leverage your Python expertise for ML: Your programming foundation positions you well for data science. ` +
          `Next, add ${missingSkills.slice(0, 2).map(s => s.skill).join(' and ')} to become ML-ready.`
        );
      } else if (userSkills.includes('excel') || userSkills.includes('statistics')) {
        improvements.push(
          `Transition from analytics to ML: Your data analysis background is valuable. ` +
          `Add Python programming and ML libraries to expand into machine learning roles.`
        );
      }
    }
  }

  private generateContextualImprovement(
    skill: string,
    demand: number,
    category: string,
    priority: string,
    userSkills: string[],
    experienceLevel: string,
    hasBackendSkills: boolean,
    hasFrontendSkills: boolean,
    hasDataSkills: boolean,
    hasMLSkills: boolean
  ): string | null {
    const complementarySkills = this.getComplementarySkills(skill);
    const userHasComplementary = complementarySkills.some(s => userSkills.includes(s.toLowerCase()));
    
    // Generate different messages based on user context
    if (priority === 'required') {
      if (skill === 'statistics' && hasDataSkills) {
        return `Master statistics - essential for ${demand.toLocaleString()}+ ML roles. Your data background with ` +
               `${userSkills.find(s => ['python', 'excel', 'sql'].includes(s)) || 'existing tools'} provides a great foundation for statistical analysis.`;
      }
      
      if (skill === 'pandas' && userSkills.includes('python')) {
        return `Learn pandas data manipulation - required skill that pairs perfectly with your Python knowledge. ` +
               `Build projects analyzing real datasets to demonstrate proficiency for ${demand.toLocaleString()}+ opportunities.`;
      }
      
      if (skill === 'numpy' && (userSkills.includes('python') || userSkills.includes('pandas'))) {
        return `Master NumPy for numerical computing - foundation for all Python data work. ` +
               `Your existing Python skills make this a natural next step for ML roles.`;
      }
      
      if (userHasComplementary) {
        return `Develop ${skill} - required skill that builds on your ${complementarySkills.find(s => userSkills.includes(s.toLowerCase())) || userSkills[0]} experience. ` +
               `${demand.toLocaleString()}+ roles seek this combination.`;
      }
      
      // Default required skill message with context
      if (demand >= 10000) {
        return `Master ${skill} - critical skill with ${demand.toLocaleString()}+ job mentions. ` +
               `Focus on practical projects to demonstrate ${skill} proficiency alongside your ${userSkills[0] || 'existing'} skills.`;
      } else if (demand >= 3000) {
        return `Learn ${skill} - required for this role with ${demand.toLocaleString()}+ market opportunities. ` +
               `Consider combining with ${complementarySkills[0] || 'related tools'} for stronger positioning.`;
      } else {
        return `Acquire ${skill} - required skill. Build ${experienceLevel === 'beginner' ? 'simple' : 'comprehensive'} projects ` +
               `demonstrating ${skill} proficiency to strengthen your profile.`;
      }
    } else if (category === 'emerging') {
      return `Explore ${skill} - emerging technology with growing demand. ` +
             `Your ${experienceLevel} background positions you well for early adoption opportunities.`;
    } else if (demand >= 5000) {
      return `Develop ${skill} proficiency - ${demand.toLocaleString()}+ job postings require this. ` +
             `Combines well with your existing ${userSkills.slice(0, 2).join(' and ') || 'skill set'}.`;
    }
    
    return null;
  }

  generateMarketAnalysisExplanations(
    missingSkills: Array<{ skill: string; weight: number; priority: string }>,
    userSkills: Set<string>,
    roleCategory: string,
    prioritizedGaps: Array<{ skill: string; weight: number; priority: string; marketPriority: number; marketDemand: number }>,
    jdText?: string,
    jdTitle?: string
  ) {
    const userSkillsList = Array.from(userSkills).map(s => s.toLowerCase());
    const explanations: Array<{ skill: string; reason: string; marketDemand: number; priority: string }> = [];
    
    // Extract specific tasks and requirements from job description
    const jdTasks = this.extractTasksFromJD(jdText || '');
    const jdKeywords = this.extractRelevantKeywords(jdText || '', roleCategory);
    
    // Generate explanations for top missing skills
    const topMissing = prioritizedGaps.slice(0, 5);
    
    for (const missing of topMissing) {
      const skill = missing.skill.toLowerCase();
      const demand = missing.marketDemand;
      const priority = missing.priority;
      
      let reason = '';
      
      // Find specific tasks in JD that require this skill
      const relevantTasks = this.findRelevantTasksForSkill(skill, jdTasks, jdText || '');
      const specificUseCase = this.getSpecificUseCase(skill, jdText || '', roleCategory);
      
      // Generate specific explanations based on skill and context
      if (skill === 'statistics') {
        if (userSkillsList.includes('python') || userSkillsList.includes('excel')) {
          const pythonOrExcel = userSkillsList.find(s => ['python', 'excel'].includes(s));
          const useCasePart = specificUseCase ? `Specifically for this role, you'll need statistics to ${specificUseCase}.` : "You'll need statistics for hypothesis testing, probability distributions, and validating model performance.";
          const tasksPart = relevantTasks ? `For example, this job requires you to ${relevantTasks}.` : '';
          reason = `Statistics is essential for ${demand.toLocaleString()}+ ML/data roles. Your existing ${pythonOrExcel} foundation makes learning statistical concepts more practical. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `In this role, you'll use statistics to ${specificUseCase}.` : "It's fundamental for understanding data patterns, making predictions, and validating analysis results.";
          const tasksPart = relevantTasks ? `Specifically, you'll need it to ${relevantTasks}.` : "Without statistics, you can't properly interpret data or build reliable models.";
          reason = `Statistics is required for ${demand.toLocaleString()}+ data science positions. ${useCasePart} ${tasksPart}`;
        }
      } else if (skill === 'pandas') {
        if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `In this role, you'll use pandas to ${specificUseCase}.` : 'It handles data cleaning, transformation, and analysis - essential for preparing datasets before machine learning.';
          const tasksPart = relevantTasks ? `For instance, this job description mentions tasks like ${relevantTasks}, which pandas handles efficiently.` : '';
          reason = `Pandas is the industry standard for data manipulation in Python, required by ${demand.toLocaleString()}+ roles. Since you already know Python, pandas is your natural next step. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This role specifically requires pandas for ${specificUseCase}.` : "It handles data cleaning, filtering, grouping, and reshaping - tasks that are 80% of any data science project.";
          reason = `Pandas is Python's primary data manipulation library, needed for ${demand.toLocaleString()}+ data roles. ${useCasePart} Learning pandas without Python first would be very difficult.`;
        }
      } else if (skill === 'numpy') {
        if (userSkillsList.includes('python') || userSkillsList.includes('pandas')) {
          const existingSkill = userSkillsList.includes('pandas') ? 'pandas' : 'Python';
          const useCasePart = specificUseCase ? `In this position, NumPy will be used for ${specificUseCase}.` : 'NumPy handles arrays, linear algebra, and numerical operations that ML libraries depend on.';
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which NumPy excels at.` : '';
          reason = `NumPy provides the mathematical foundation for all Python data work, powering ${demand.toLocaleString()}+ scientific computing roles. Your ${existingSkill} knowledge makes this a logical next step. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This role needs NumPy for ${specificUseCase}.` : 'It provides efficient array operations and mathematical functions.';
          reason = `NumPy is the mathematical backbone of Python data science, essential for ${demand.toLocaleString()}+ technical roles. ${useCasePart} Most ML libraries (scikit-learn, TensorFlow) are built on NumPy, making it unavoidable for serious data work.`;
        }
      } else if (skill === 'sql') {
        if (userSkillsList.includes('excel')) {
          const useCasePart = specificUseCase ? `In this role, you'll use SQL to ${specificUseCase}.` : 'Most real-world data lives in databases, not files.';
          const tasksPart = relevantTasks ? `The job description mentions ${relevantTasks}, which requires SQL queries.` : '';
          reason = `SQL expands your data analysis from spreadsheets to enterprise databases, opening ${demand.toLocaleString()}+ opportunities. Your Excel skills with formulas and data manipulation translate well to SQL queries. ${useCasePart} ${tasksPart}`;
        } else if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `This position requires SQL to ${specificUseCase}, while Python processes the results.` : "While Python processes data, SQL gets the data from where it's stored.";
          const tasksPart = relevantTasks ? `For example, you'll need SQL to ${relevantTasks}.` : '';
          reason = `SQL complements your Python programming by handling data extraction from databases, needed for ${demand.toLocaleString()}+ roles. ${useCasePart} This combination is powerful for end-to-end data workflows. ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `In this role, SQL is needed to ${specificUseCase}.` : 'Every company stores data in databases, and SQL is how you access, filter, join, and analyze that data.';
          const tasksPart = relevantTasks ? `The job specifically requires ${relevantTasks}, which SQL handles.` : '';
          reason = `SQL is the universal language for working with databases, required by ${demand.toLocaleString()}+ positions across all tech roles. ${useCasePart} ${tasksPart}`;
        }
      } else if (skill === 'machine learning basics' || skill === 'machine learning') {
        if (userSkillsList.includes('python') && userSkillsList.includes('statistics')) {
          const useCasePart = specificUseCase ? `This role specifically requires ML to ${specificUseCase}.` : 'ML combines programming and statistics to build predictive models.';
          const tasksPart = relevantTasks ? `You'll be expected to ${relevantTasks}, which requires ML knowledge.` : '';
          reason = `With your Python and statistics foundation, machine learning is your natural career progression into ${demand.toLocaleString()}+ AI roles. ${useCasePart} Your existing skills make learning algorithms and model training much easier. ${tasksPart}`;
        } else if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `In this position, you'll use ML to ${specificUseCase}.` : "However, you'll also need statistics knowledge to understand how algorithms work and validate model performance.";
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which ML enables.` : '';
          reason = `Machine learning leverages your Python skills for building predictive models, opening ${demand.toLocaleString()}+ AI opportunities. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This role needs ML for ${specificUseCase}.` : 'It requires both programming (usually Python) and statistics to build models that learn from data.';
          const tasksPart = relevantTasks ? `Specifically, you'll need ML to ${relevantTasks}.` : 'This field is growing rapidly but requires strong technical foundations.';
          reason = `Machine learning is driving ${demand.toLocaleString()}+ job opportunities in AI. ${useCasePart} ${tasksPart}`;
        }
      } else if (skill === 'javascript') {
        if (userSkillsList.includes('html') || userSkillsList.includes('css')) {
          const useCasePart = specificUseCase ? `In this role, JavaScript will be used to ${specificUseCase}.` : 'Modern web development is impossible without all three.';
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which JavaScript handles.` : '';
          reason = `JavaScript completes your web development foundation, enabling ${demand.toLocaleString()}+ frontend roles. Your HTML/CSS skills handle structure and styling; JavaScript adds interactivity. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This position needs JavaScript for ${specificUseCase}.` : "It runs in browsers and servers (Node.js), making it versatile for full-stack development.";
          const tasksPart = relevantTasks ? `You'll use it to ${relevantTasks}.` : '';
          reason = `JavaScript powers ${demand.toLocaleString()}+ web development positions and is essential for interactive websites. ${useCasePart} ${tasksPart}`;
        }
      } else if (skill === 'react' || skill === 'react.js') {
        if (userSkillsList.includes('javascript')) {
          const useCasePart = specificUseCase ? `This role requires React to ${specificUseCase}.` : "It's the most popular UI framework, used by Facebook, Netflix, and countless companies.";
          const tasksPart = relevantTasks ? `For example, you'll use React to ${relevantTasks}.` : '';
          reason = `React builds on your JavaScript knowledge to create modern user interfaces, needed for ${demand.toLocaleString()}+ frontend roles. ${useCasePart} Your JavaScript foundation makes React a natural progression. ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This position needs React for ${specificUseCase}.` : 'However, React requires solid JavaScript fundamentals first.';
          reason = `React is the leading framework for building user interfaces, powering ${demand.toLocaleString()}+ frontend positions. ${useCasePart} Learning React without JavaScript would be like learning calculus without algebra.`;
        }
      } else if (skill === 'jupyter notebooks' || skill === 'jupyter') {
        if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `In this role, you'll use Jupyter to ${specificUseCase}.` : "Since you know Python, Jupyter is the natural tool for interactive data exploration, model development, and sharing your analysis.";
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which Jupyter excels at.` : 'It combines code, visualizations, and documentation in one place - essential for ML workflows.';
          reason = `Jupyter Notebooks are the standard environment for data science and ML work, required by ${demand.toLocaleString()}+ roles. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This role needs Jupyter for ${specificUseCase}.` : "It's the industry standard for interactive data analysis, model prototyping, and sharing research.";
          const tasksPart = relevantTasks ? `You'll use it to ${relevantTasks}.` : '';
          reason = `Jupyter Notebooks are required for ${demand.toLocaleString()}+ data science and ML positions. ${useCasePart} Most ML teams use Jupyter for experimentation and collaboration. ${tasksPart}`;
        }
      } else if (skill === 'scikit-learn' || skill === 'sklearn') {
        if (userSkillsList.includes('python') && userSkillsList.includes('pandas')) {
          const useCasePart = specificUseCase ? `In this position, you'll use scikit-learn to ${specificUseCase}.` : "With your Python and pandas foundation, scikit-learn is the next logical step for building and training ML models.";
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which scikit-learn handles.` : 'It provides ready-to-use algorithms for classification, regression, clustering, and more.';
          reason = `Scikit-learn is the most popular ML library in Python, required by ${demand.toLocaleString()}+ ML roles. ${useCasePart} ${tasksPart}`;
        } else if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `This role needs scikit-learn to ${specificUseCase}.` : "It's Python's primary ML library, providing algorithms for supervised and unsupervised learning.";
          const tasksPart = relevantTasks ? `You'll use it to ${relevantTasks}.` : '';
          reason = `Scikit-learn is essential for ${demand.toLocaleString()}+ machine learning positions. ${useCasePart} You'll need pandas first for data preparation, then scikit-learn for model training. ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This position requires scikit-learn for ${specificUseCase}.` : "It's the industry standard Python library for machine learning algorithms.";
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}.` : '';
          reason = `Scikit-learn is required for ${demand.toLocaleString()}+ ML roles. ${useCasePart} You'll need Python and pandas as prerequisites. ${tasksPart}`;
        }
      } else if (skill === 'data visualization') {
        if (userSkillsList.includes('python')) {
          const useCasePart = specificUseCase ? `In this role, you'll create visualizations to ${specificUseCase}.` : "With Python, you can use libraries like matplotlib and seaborn to turn data into insights.";
          const tasksPart = relevantTasks ? `The job requires ${relevantTasks}, which visualization enables.` : 'Visualizations help communicate findings to stakeholders and identify patterns in data.';
          reason = `Data visualization is crucial for ${demand.toLocaleString()}+ data roles. ${useCasePart} ${tasksPart}`;
        } else {
          const useCasePart = specificUseCase ? `This role needs visualization to ${specificUseCase}.` : 'It helps communicate data insights effectively to both technical and non-technical audiences.';
          const tasksPart = relevantTasks ? `You'll create visualizations for ${relevantTasks}.` : 'Tools like matplotlib, seaborn, or Tableau are commonly used.';
          reason = `Data visualization enhances your profile for ${demand.toLocaleString()}+ opportunities. ${useCasePart} ${tasksPart}`;
        }
      } else {
        // Enhanced generic explanation with JD context
        const complementarySkills = this.getComplementarySkills(skill);
        const userHasComplementary = complementarySkills.some(s => userSkillsList.includes(s.toLowerCase()));
        
        if (priority === 'required') {
          if (userHasComplementary) {
            const complementarySkill = complementarySkills.find(s => userSkillsList.includes(s.toLowerCase()));
            const useCasePart = specificUseCase ? `Specifically, you'll use ${skill} to ${specificUseCase}.` : `Your existing ${complementarySkill} experience provides a good foundation for learning ${skill}.`;
            const tasksPart = relevantTasks ? `The job description mentions ${relevantTasks}, which requires ${skill}.` : 'These skills often work together in real projects.';
            reason = `${skill} is required for this role and appears in ${demand.toLocaleString()}+ job postings. ${useCasePart} ${tasksPart}`;
          } else {
            const useCasePart = specificUseCase ? `In this role, you'll use ${skill} to ${specificUseCase}.` : 'This skill is essential for performing core job responsibilities and is non-negotiable for most employers in this role.';
            const tasksPart = relevantTasks ? `Specifically, you'll need it to ${relevantTasks}.` : '';
            reason = `${skill} is a required skill for this position, appearing in ${demand.toLocaleString()}+ job listings in the ${roleCategory} field. ${useCasePart} ${tasksPart}`;
          }
        } else {
          const useCasePart = specificUseCase ? `While not always required, this role would benefit from ${skill} to ${specificUseCase}.` : 'While not always required, having this skill significantly improves your competitiveness and may qualify you for higher-level positions or specialized projects.';
          const tasksPart = relevantTasks ? `It would help with ${relevantTasks}.` : '';
          reason = `${skill} enhances your profile for ${demand.toLocaleString()}+ opportunities in ${roleCategory}. ${useCasePart} ${tasksPart}`;
        }
      }
      
      explanations.push({
        skill: missing.skill,
        reason,
        marketDemand: demand,
        priority
      });
    }
    
    // Generate learning path recommendation
    const critical = prioritizedGaps.filter(g => g.priority === 'required').length;
    const total = prioritizedGaps.length;
    
    let learningPath = '';
    if (roleCategory.toLowerCase().includes('ai') || roleCategory.toLowerCase().includes('ml')) {
      if (userSkillsList.includes('python')) {
        learningPath = 'Build on your Python foundation: Learn statistics and pandas for data manipulation, then dive into machine learning algorithms and libraries like scikit-learn.';
      } else if (userSkillsList.includes('excel') || userSkillsList.includes('statistics')) {
        learningPath = 'Transition from analysis to programming: Start with Python fundamentals, then add data libraries (pandas, numpy) to complement your analytical background.';
      } else {
        learningPath = 'Start with fundamentals: Learn Python programming first, then statistics, followed by data manipulation (pandas/numpy), and finally machine learning concepts.';
      }
    } else if (roleCategory.toLowerCase().includes('data')) {
      if (userSkillsList.includes('python')) {
        learningPath = 'Specialize your Python skills: Focus on data-specific libraries (pandas for manipulation, matplotlib for visualization) and SQL for database access.';
      } else if (userSkillsList.includes('excel')) {
        learningPath = 'Expand beyond spreadsheets: Learn SQL for database queries, then Python with pandas for more powerful data manipulation and automation.';
      } else {
        learningPath = 'Build data fundamentals: Start with SQL for data extraction, learn Excel/Python for analysis, then advance to specialized data tools and visualization.';
      }
    } else if (roleCategory.toLowerCase().includes('frontend')) {
      if (userSkillsList.includes('html') && userSkillsList.includes('css')) {
        learningPath = 'Complete the web trinity: Add JavaScript for interactivity, then learn React for modern component-based development.';
      } else {
        learningPath = 'Master web fundamentals: Start with HTML for structure, CSS for styling, JavaScript for behavior, then frameworks like React.';
      }
    } else {
      learningPath = `Focus on the ${critical} required skills first, then add preferred skills to strengthen your profile for ${roleCategory.toLowerCase()} roles.`;
    }
    
    return {
      explanations,
      skillGaps: {
        total,
        critical,
        learningPath
      }
    };
  }

  // Extract specific tasks from job description
  private extractTasksFromJD(jdText: string): string[] {
    if (!jdText) return [];
    
    const tasks: string[] = [];
    const lowerText = jdText.toLowerCase();
    
    // Look for bullet points or numbered lists
    const bulletPattern = /[•\-\*]\s*([^•\n]+)/gi;
    const numberedPattern = /\d+[\.\)]\s*([^\d\n]+)/gi;
    
    let match;
    while ((match = bulletPattern.exec(jdText)) !== null) {
      const task = match[1].trim();
      if (task.length > 10 && task.length < 200) {
        tasks.push(task);
      }
    }
    
    while ((match = numberedPattern.exec(jdText)) !== null) {
      const task = match[1].trim();
      if (task.length > 10 && task.length < 200) {
        tasks.push(task);
      }
    }
    
    // Look for "you'll" or "you will" patterns
    const youWillPattern = /you'?ll\s+([^.!?]+)/gi;
    while ((match = youWillPattern.exec(lowerText)) !== null) {
      const task = match[1].trim();
      if (task.length > 10 && task.length < 200) {
        tasks.push(task);
      }
    }
    
    return tasks.slice(0, 10); // Limit to top 10 tasks
  }

  // Extract relevant keywords from JD
  private extractRelevantKeywords(jdText: string, roleCategory: string): string[] {
    if (!jdText) return [];
    
    const keywords: string[] = [];
    const lowerText = jdText.toLowerCase();
    
    // Common action verbs in job descriptions
    const actionVerbs = ['build', 'develop', 'create', 'design', 'implement', 'analyze', 'optimize', 'improve', 'maintain', 'deploy', 'test', 'debug', 'collaborate', 'work with'];
    
    for (const verb of actionVerbs) {
      const pattern = new RegExp(`${verb}\\s+([^.!?,\\n]+)`, 'gi');
      let match;
      while ((match = pattern.exec(lowerText)) !== null && keywords.length < 15) {
        const phrase = match[1].trim();
        if (phrase.length > 5 && phrase.length < 100) {
          keywords.push(phrase);
        }
      }
    }
    
    return keywords;
  }

  // Find tasks relevant to a specific skill
  private findRelevantTasksForSkill(skill: string, tasks: string[], jdText: string): string | null {
    if (!jdText || tasks.length === 0) return null;
    
    const skillLower = skill.toLowerCase();
    const skillWords = skillLower.split(/\s+/);
    const lowerText = jdText.toLowerCase();
    
    // Find tasks that mention the skill or related terms
    const relevantTasks = tasks.filter(task => {
      const taskLower = task.toLowerCase();
      return skillWords.some(word => taskLower.includes(word)) ||
             this.isSkillRelatedToTask(skill, task);
    });
    
    if (relevantTasks.length > 0) {
      // Return the most relevant task (first one found)
      const task = relevantTasks[0];
      // Clean up the task text
      return task.length > 100 ? task.substring(0, 100) + '...' : task;
    }
    
    // If no direct match, look for context around the skill in JD
    const skillPattern = new RegExp(`([^.!?]{0,50}${skillWords[0]}[^.!?]{0,50})`, 'i');
    const contextMatch = skillPattern.exec(lowerText);
    if (contextMatch) {
      return contextMatch[1].trim();
    }
    
    return null;
  }

  // Check if a skill is related to a task
  private isSkillRelatedToTask(skill: string, task: string): boolean {
    const skillLower = skill.toLowerCase();
    const taskLower = task.toLowerCase();
    
    // Skill-task relationships
    const relationships: Record<string, string[]> = {
      'machine learning': ['model', 'predict', 'algorithm', 'train', 'dataset', 'ml', 'ai'],
      'statistics': ['analyze', 'data', 'probability', 'hypothesis', 'test', 'distribution'],
      'sql': ['database', 'query', 'data', 'extract', 'join', 'table'],
      'pandas': ['data', 'clean', 'transform', 'dataframe', 'dataset', 'analysis'],
      'python': ['code', 'script', 'program', 'develop', 'build', 'automate'],
      'jupyter': ['notebook', 'experiment', 'analysis', 'prototype', 'explore'],
      'scikit-learn': ['model', 'train', 'algorithm', 'classify', 'regress', 'ml'],
      'data visualization': ['visualize', 'chart', 'graph', 'plot', 'dashboard', 'report']
    };
    
    for (const [key, relatedTerms] of Object.entries(relationships)) {
      if (skillLower.includes(key) || key.includes(skillLower)) {
        return relatedTerms.some(term => taskLower.includes(term));
      }
    }
    
    return false;
  }

  // Get specific use case for a skill from job description
  private getSpecificUseCase(skill: string, jdText: string, roleCategory: string): string | null {
    if (!jdText) return null;
    
    const skillLower = skill.toLowerCase();
    const lowerText = jdText.toLowerCase();
    const skillWords = skillLower.split(/\s+/);
    
    // Look for patterns like "use [skill] to [action]" or "[skill] for [purpose]"
    const useCasePatterns = [
      new RegExp(`use\\s+${skillWords[0]}\\s+to\\s+([^.!?]+)`, 'i'),
      new RegExp(`${skillWords[0]}\\s+for\\s+([^.!?]+)`, 'i'),
      new RegExp(`with\\s+${skillWords[0]}[,\\s]+([^.!?]+)`, 'i'),
      new RegExp(`using\\s+${skillWords[0]}[,\\s]+([^.!?]+)`, 'i')
    ];
    
    for (const pattern of useCasePatterns) {
      const match = pattern.exec(lowerText);
      if (match && match[1]) {
        const useCase = match[1].trim();
        if (useCase.length > 10 && useCase.length < 150) {
          return useCase;
        }
      }
    }
    
    // Look for role-specific use cases
    const roleUseCases: Record<string, Record<string, string>> = {
      'ai/ml': {
        'machine learning': 'build and train predictive models',
        'statistics': 'validate model performance and interpret results',
        'python': 'develop ML algorithms and data pipelines',
        'pandas': 'clean and preprocess datasets for model training',
        'jupyter notebooks': 'prototype models and share analysis',
        'scikit-learn': 'implement classification and regression models',
        'sql': 'extract training data from databases',
        'data visualization': 'visualize model performance and data insights'
      },
      'data': {
        'sql': 'query databases and extract data for analysis',
        'python': 'analyze datasets and automate reporting',
        'pandas': 'manipulate and clean data for analysis',
        'excel': 'create reports and dashboards',
        'data visualization': 'create charts and dashboards to communicate insights',
        'statistics': 'perform statistical analysis and hypothesis testing'
      }
    };
    
    const categoryLower = roleCategory.toLowerCase();
    for (const [category, useCases] of Object.entries(roleUseCases)) {
      if (categoryLower.includes(category) || categoryLower.includes(category.replace('/', ''))) {
        for (const [skillKey, useCase] of Object.entries(useCases)) {
          if (skillLower.includes(skillKey) || skillKey.includes(skillLower)) {
            return useCase;
          }
        }
      }
    }
    
    return null;
  }
}

