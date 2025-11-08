import { SkillGap } from './gap-analysis';

export interface LearningResource {
  title: string;
  url: string;
  type: 'course' | 'tutorial' | 'interactive' | 'documentation' | 'video' | 'book' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  cost: 'free' | 'freemium' | 'paid';
  platform: string;
  rating: number;
  description: string;
  prerequisites?: string[];
}

export interface LearningPath {
  skill: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phases: Array<{
    name: string;
    duration: string;
    resources: LearningResource[];
    projects: string[];
    milestones: string[];
  }>;
  careerRelevance: string;
  nextSteps: string[];
}

// Enhanced resource database with detailed metadata
const RESOURCE_DATABASE: Record<string, LearningResource[]> = {
  'python': [
    {
      title: 'Automate the Boring Stuff with Python',
      url: 'https://automatetheboringstuff.com/',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '6-8 weeks',
      cost: 'free',
      platform: 'Online Book',
      rating: 4.8,
      description: 'Learn Python through practical automation projects. Perfect for beginners.',
      prerequisites: []
    },
    {
      title: 'Python for Everybody (Coursera)',
      url: 'https://www.coursera.org/specializations/python',
      type: 'course',
      difficulty: 'beginner',
      duration: '4 months',
      cost: 'freemium',
      platform: 'Coursera',
      rating: 4.7,
      description: 'Comprehensive Python specialization from University of Michigan.',
      prerequisites: []
    },
    {
      title: 'LeetCode Python Track',
      url: 'https://leetcode.com/explore/learn/',
      type: 'practice',
      difficulty: 'intermediate',
      duration: 'Ongoing',
      cost: 'freemium',
      platform: 'LeetCode',
      rating: 4.5,
      description: 'Practice programming problems to improve Python skills.',
      prerequisites: ['Basic Python syntax']
    }
  ],
  
  'machine learning': [
    {
      title: 'Machine Learning Crash Course (Google)',
      url: 'https://developers.google.com/machine-learning/crash-course',
      type: 'course',
      difficulty: 'beginner',
      duration: '15 hours',
      cost: 'free',
      platform: 'Google',
      rating: 4.6,
      description: 'Fast-paced introduction to ML with TensorFlow APIs.',
      prerequisites: ['Python basics', 'Basic statistics']
    },
    {
      title: 'Kaggle Learn - Intro to Machine Learning',
      url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '7 hours',
      cost: 'free',
      platform: 'Kaggle',
      rating: 4.7,
      description: 'Hands-on ML course with real datasets and competitions.',
      prerequisites: ['Python', 'pandas']
    },
    {
      title: 'Fast.ai Practical Deep Learning',
      url: 'https://course.fast.ai/',
      type: 'course',
      difficulty: 'intermediate',
      duration: '12 weeks',
      cost: 'free',
      platform: 'Fast.ai',
      rating: 4.8,
      description: 'Top-down approach to deep learning with practical projects.',
      prerequisites: ['Python', 'Basic ML concepts']
    }
  ],
  
  'javascript': [
    {
      title: 'JavaScript.info',
      url: 'https://javascript.info/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '8-10 weeks',
      cost: 'free',
      platform: 'Online Tutorial',
      rating: 4.9,
      description: 'Comprehensive modern JavaScript tutorial with exercises.',
      prerequisites: ['Basic HTML/CSS']
    },
    {
      title: 'JavaScript30',
      url: 'https://javascript30.com/',
      type: 'interactive',
      difficulty: 'intermediate',
      duration: '30 days',
      cost: 'free',
      platform: 'Wes Bos',
      rating: 4.8,
      description: 'Build 30 projects in 30 days with vanilla JavaScript.',
      prerequisites: ['JavaScript fundamentals']
    },
    {
      title: 'freeCodeCamp JavaScript',
      url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '300 hours',
      cost: 'free',
      platform: 'freeCodeCamp',
      rating: 4.7,
      description: 'Complete JavaScript curriculum with certification.',
      prerequisites: []
    }
  ],
  
  'react': [
    {
      title: 'React Official Tutorial',
      url: 'https://react.dev/learn',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '4-6 weeks',
      cost: 'free',
      platform: 'React.dev',
      rating: 4.8,
      description: 'Official React documentation and interactive tutorials.',
      prerequisites: ['JavaScript', 'HTML/CSS']
    },
    {
      title: 'Scrimba React Course',
      url: 'https://scrimba.com/learn/learnreact',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '12 hours',
      cost: 'freemium',
      platform: 'Scrimba',
      rating: 4.6,
      description: 'Interactive React course with hands-on coding.',
      prerequisites: ['JavaScript fundamentals']
    },
    {
      title: 'React Projects (YouTube - freeCodeCamp)',
      url: 'https://www.youtube.com/watch?v=u6gSSpfsoOQ',
      type: 'video',
      difficulty: 'intermediate',
      duration: '12 hours',
      cost: 'free',
      platform: 'YouTube',
      rating: 4.7,
      description: 'Build real React projects from scratch.',
      prerequisites: ['React basics', 'JavaScript ES6+']
    }
  ],
  
  'sql': [
    {
      title: 'SQLBolt Interactive Lessons',
      url: 'https://sqlbolt.com/',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '2-3 weeks',
      cost: 'free',
      platform: 'SQLBolt',
      rating: 4.7,
      description: 'Learn SQL through interactive exercises and lessons.',
      prerequisites: []
    },
    {
      title: 'W3Schools SQL Tutorial',
      url: 'https://www.w3schools.com/sql/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '3-4 weeks',
      cost: 'free',
      platform: 'W3Schools',
      rating: 4.4,
      description: 'Comprehensive SQL tutorial with examples.',
      prerequisites: []
    },
    {
      title: 'HackerRank SQL Practice',
      url: 'https://www.hackerrank.com/domains/sql',
      type: 'practice',
      difficulty: 'intermediate',
      duration: 'Ongoing',
      cost: 'free',
      platform: 'HackerRank',
      rating: 4.5,
      description: 'Practice SQL problems from basic to advanced.',
      prerequisites: ['SQL basics']
    }
  ],
  
  'excel': [
    {
      title: 'Excel Essential Skills (Microsoft)',
      url: 'https://support.microsoft.com/en-us/office/excel-help-center',
      type: 'documentation',
      difficulty: 'beginner',
      duration: '2-3 weeks',
      cost: 'free',
      platform: 'Microsoft',
      rating: 4.3,
      description: 'Official Excel documentation and tutorials.',
      prerequisites: []
    },
    {
      title: 'Excel Fundamentals for Data Analysis (Coursera)',
      url: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm',
      type: 'course',
      difficulty: 'beginner',
      duration: '4 weeks',
      cost: 'freemium',
      platform: 'Coursera',
      rating: 4.5,
      description: 'Learn Excel for data analysis and visualization.',
      prerequisites: []
    }
  ],
  
  'git': [
    {
      title: 'Learn Git Branching',
      url: 'https://learngitbranching.js.org/',
      type: 'interactive',
      difficulty: 'beginner',
      duration: '1-2 weeks',
      cost: 'free',
      platform: 'Interactive Tutorial',
      rating: 4.9,
      description: 'Visual and interactive way to learn Git branching.',
      prerequisites: []
    },
    {
      title: 'Git Tutorial (Atlassian)',
      url: 'https://www.atlassian.com/git/tutorials',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '2-3 weeks',
      cost: 'free',
      platform: 'Atlassian',
      rating: 4.6,
      description: 'Comprehensive Git tutorial from basics to advanced.',
      prerequisites: []
    }
  ],
  
  'docker': [
    {
      title: 'Docker Getting Started',
      url: 'https://docs.docker.com/get-started/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '3-4 weeks',
      cost: 'free',
      platform: 'Docker',
      rating: 4.5,
      description: 'Official Docker tutorial and documentation.',
      prerequisites: ['Basic command line']
    },
    {
      title: 'Docker for Beginners',
      url: 'https://docker-curriculum.com/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '2-3 hours',
      cost: 'free',
      platform: 'Docker Curriculum',
      rating: 4.7,
      description: 'Beginner-friendly Docker tutorial with practical examples.',
      prerequisites: []
    }
  ],
  
  'unity': [
    {
      title: 'Unity Learn Platform',
      url: 'https://learn.unity.com/',
      type: 'course',
      difficulty: 'beginner',
      duration: '8-12 weeks',
      cost: 'free',
      platform: 'Unity',
      rating: 4.6,
      description: 'Official Unity learning platform with project-based courses.',
      prerequisites: ['Basic programming']
    },
    {
      title: 'Unity Beginner Tutorials (Brackeys)',
      url: 'https://www.youtube.com/playlist?list=PLPV2KyIb3jR5QFsefuO2RlAgWEz6EvVi6',
      type: 'video',
      difficulty: 'beginner',
      duration: '6-8 weeks',
      cost: 'free',
      platform: 'YouTube',
      rating: 4.8,
      description: 'Popular Unity tutorial series for beginners.',
      prerequisites: ['Basic C# knowledge']
    }
  ],
  
  'c++': [
    {
      title: 'LearnCpp.com',
      url: 'https://www.learncpp.com/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '12-16 weeks',
      cost: 'free',
      platform: 'LearnCpp',
      rating: 4.8,
      description: 'Comprehensive C++ tutorial from basics to advanced topics.',
      prerequisites: ['Basic programming concepts']
    },
    {
      title: 'C++ Tutorial (Programiz)',
      url: 'https://www.programiz.com/cpp-programming',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '8-10 weeks',
      cost: 'free',
      platform: 'Programiz',
      rating: 4.5,
      description: 'Learn C++ with examples and exercises.',
      prerequisites: []
    }
  ],
  
  'statistics': [
    {
      title: 'Khan Academy Statistics',
      url: 'https://www.khanacademy.org/math/statistics-probability',
      type: 'course',
      difficulty: 'beginner',
      duration: '8-12 weeks',
      cost: 'free',
      platform: 'Khan Academy',
      rating: 4.7,
      description: 'Complete statistics and probability course.',
      prerequisites: ['Basic algebra']
    },
    {
      title: 'StatQuest (YouTube)',
      url: 'https://www.youtube.com/c/joshstarmer',
      type: 'video',
      difficulty: 'beginner',
      duration: 'Ongoing',
      cost: 'free',
      platform: 'YouTube',
      rating: 4.9,
      description: 'Statistics concepts explained clearly and simply.',
      prerequisites: []
    }
  ],
  
  'mathematics': [
    {
      title: 'Khan Academy Math',
      url: 'https://www.khanacademy.org/math',
      type: 'course',
      difficulty: 'beginner',
      duration: 'Ongoing',
      cost: 'free',
      platform: 'Khan Academy',
      rating: 4.8,
      description: 'Comprehensive mathematics courses from algebra to calculus.',
      prerequisites: []
    },
    {
      title: '3Blue1Brown - Essence of Calculus',
      url: 'https://www.3blue1brown.com/topics/calculus',
      type: 'video',
      difficulty: 'intermediate',
      duration: '10 hours',
      cost: 'free',
      platform: 'YouTube',
      rating: 4.9,
      description: 'Visual and intuitive explanations of calculus concepts.',
      prerequisites: ['Basic algebra']
    },
    {
      title: 'MIT OpenCourseWare - Mathematics',
      url: 'https://ocw.mit.edu/courses/mathematics/',
      type: 'course',
      difficulty: 'advanced',
      duration: '12-16 weeks',
      cost: 'free',
      platform: 'MIT',
      rating: 4.8,
      description: 'University-level mathematics courses from MIT.',
      prerequisites: ['High school math']
    }
  ],
  
  'ros': [
    {
      title: 'ROS Tutorials (Official)',
      url: 'http://wiki.ros.org/ROS/Tutorials',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '4-6 weeks',
      cost: 'free',
      platform: 'ROS Wiki',
      rating: 4.7,
      description: 'Official ROS tutorials covering basics to advanced topics.',
      prerequisites: ['Linux basics', 'C++ or Python']
    },
    {
      title: 'ROS for Beginners',
      url: 'https://www.theconstructsim.com/ros-basics/',
      type: 'course',
      difficulty: 'beginner',
      duration: '6-8 weeks',
      cost: 'freemium',
      platform: 'The Construct',
      rating: 4.6,
      description: 'Hands-on ROS course with practical robotics projects.',
      prerequisites: ['Python basics']
    }
  ],
  
  'ros basics': [
    {
      title: 'ROS Tutorials (Official)',
      url: 'http://wiki.ros.org/ROS/Tutorials',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '4-6 weeks',
      cost: 'free',
      platform: 'ROS Wiki',
      rating: 4.7,
      description: 'Official ROS tutorials covering basics to advanced topics.',
      prerequisites: ['Linux basics', 'C++ or Python']
    },
    {
      title: 'ROS for Beginners',
      url: 'https://www.theconstructsim.com/ros-basics/',
      type: 'course',
      difficulty: 'beginner',
      duration: '6-8 weeks',
      cost: 'freemium',
      platform: 'The Construct',
      rating: 4.6,
      description: 'Hands-on ROS course with practical robotics projects.',
      prerequisites: ['Python basics']
    }
  ],
  
  'embedded systems': [
    {
      title: 'Embedded Systems Fundamentals',
      url: 'https://www.coursera.org/learn/introduction-embedded-systems',
      type: 'course',
      difficulty: 'beginner',
      duration: '4 weeks',
      cost: 'freemium',
      platform: 'Coursera',
      rating: 4.5,
      description: 'Introduction to embedded systems and microcontrollers.',
      prerequisites: ['C programming basics']
    },
    {
      title: 'Arduino Getting Started',
      url: 'https://www.arduino.cc/en/Guide',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '2-3 weeks',
      cost: 'free',
      platform: 'Arduino',
      rating: 4.7,
      description: 'Learn embedded systems with Arduino platform.',
      prerequisites: []
    }
  ],
  
  'sensors': [
    {
      title: 'Sensor Basics Tutorial',
      url: 'https://learn.sparkfun.com/tutorials/what-is-a-sensor',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '1-2 weeks',
      cost: 'free',
      platform: 'SparkFun',
      rating: 4.6,
      description: 'Introduction to different types of sensors and their applications.',
      prerequisites: []
    },
    {
      title: 'Sensor Fusion and Calibration',
      url: 'https://www.coursera.org/learn/sensor-fusion',
      type: 'course',
      difficulty: 'intermediate',
      duration: '4 weeks',
      cost: 'freemium',
      platform: 'Coursera',
      rating: 4.5,
      description: 'Learn to combine data from multiple sensors for robotics applications.',
      prerequisites: ['Basic programming', 'Mathematics']
    }
  ],
  
  'c++ basics': [
    {
      title: 'LearnCpp.com',
      url: 'https://www.learncpp.com/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '12-16 weeks',
      cost: 'free',
      platform: 'LearnCpp',
      rating: 4.8,
      description: 'Comprehensive C++ tutorial from basics to advanced topics.',
      prerequisites: ['Basic programming concepts']
    },
    {
      title: 'C++ Tutorial (Programiz)',
      url: 'https://www.programiz.com/cpp-programming',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '8-10 weeks',
      cost: 'free',
      platform: 'Programiz',
      rating: 4.5,
      description: 'Learn C++ with examples and exercises.',
      prerequisites: []
    },
    {
      title: 'C++ Crash Course',
      url: 'https://www.learncpp.com/',
      type: 'tutorial',
      difficulty: 'beginner',
      duration: '4-6 weeks',
      cost: 'free',
      platform: 'LearnCpp',
      rating: 4.7,
      description: 'Quick introduction to C++ fundamentals.',
      prerequisites: []
    }
  ]
};

export function getResourcesForSkill(
  skill: string, 
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  preferredTypes?: string[],
  maxResults: number = 3
): LearningResource[] {
  const normalizedSkill = skill.toLowerCase().trim();
  
  // Try exact match first
  let skillResources = RESOURCE_DATABASE[normalizedSkill] || [];
  
  // If no exact match, try to find by partial matching
  if (skillResources.length === 0) {
    // Try matching base skill (e.g., "c++ basics" -> "c++")
    const skillWords = normalizedSkill.split(/\s+/);
    const baseSkill = skillWords[0]; // Get first word
    
    // Check if base skill exists (e.g., "c++" for "c++ basics")
    if (RESOURCE_DATABASE[baseSkill]) {
      skillResources = RESOURCE_DATABASE[baseSkill];
    } else {
      // Try reverse lookup - check if any database key is contained in the skill
      for (const dbSkill in RESOURCE_DATABASE) {
        if (normalizedSkill.includes(dbSkill) || dbSkill.includes(normalizedSkill)) {
          skillResources = RESOURCE_DATABASE[dbSkill];
          break;
        }
      }
    }
  }
  
  // Filter by difficulty - include current level and below
  const appropriateResources = skillResources.filter(resource => {
    if (userLevel === 'beginner') return resource.difficulty === 'beginner';
    if (userLevel === 'intermediate') return ['beginner', 'intermediate'].includes(resource.difficulty);
    return true; // advanced users can access all levels
  });
  
  // Filter by preferred types if specified
  const filteredResources = preferredTypes && preferredTypes.length > 0
    ? appropriateResources.filter(r => preferredTypes.includes(r.type))
    : appropriateResources;
  
  // Sort by rating and return top results
  return filteredResources
    .sort((a, b) => b.rating - a.rating)
    .slice(0, maxResults);
}

export function generateLearningPath(
  skill: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  timeConstraint?: 'fast' | 'normal' | 'comprehensive'
): LearningPath {
  const resources = RESOURCE_DATABASE[skill.toLowerCase()] || [];
  
  // Define learning phases based on skill
  const paths: Record<string, Omit<LearningPath, 'skill'>> = {
    'python': {
      estimatedTime: timeConstraint === 'fast' ? '4-6 weeks' : '8-12 weeks',
      difficulty: userLevel,
      phases: [
        {
          name: 'Foundation',
          duration: '2-3 weeks',
          resources: getResourcesForSkill('python', 'beginner', ['interactive', 'tutorial']),
          projects: ['Build a calculator', 'Create a simple guessing game'],
          milestones: ['Understand variables and data types', 'Write basic functions', 'Handle user input']
        },
        {
          name: 'Intermediate Concepts',
          duration: '3-4 weeks',
          resources: getResourcesForSkill('python', 'intermediate', ['course', 'practice']),
          projects: ['Build a web scraper', 'Create a data analyzer'],
          milestones: ['Work with APIs', 'Handle files and databases', 'Use object-oriented programming']
        },
        {
          name: 'Practical Application',
          duration: '3-5 weeks',
          resources: getResourcesForSkill('python', 'advanced', ['practice', 'interactive']),
          projects: ['Build a full project in your target domain', 'Contribute to open source'],
          milestones: ['Complete portfolio project', 'Write clean, readable code', 'Debug effectively']
        }
      ],
      careerRelevance: 'Python is used in 5 of 7 target industries. Essential for AI/ML, Data Analysis, Backend, DevOps, and Robotics careers.',
      nextSteps: ['Learn domain-specific libraries (pandas for data, Django for web)', 'Practice algorithmic thinking', 'Build portfolio projects']
    },
    
    'machine learning': {
      estimatedTime: '12-16 weeks',
      difficulty: userLevel,
      phases: [
        {
          name: 'Mathematical Foundation',
          duration: '4-5 weeks',
          resources: getResourcesForSkill('statistics', 'beginner'),
          projects: ['Analyze a real dataset', 'Create visualizations'],
          milestones: ['Understand probability and statistics', 'Know linear algebra basics', 'Interpret data visualizations']
        },
        {
          name: 'ML Fundamentals',
          duration: '4-5 weeks',
          resources: getResourcesForSkill('machine learning', 'beginner'),
          projects: ['Build your first ML model', 'Compare different algorithms'],
          milestones: ['Understand supervised vs unsupervised learning', 'Train and evaluate models', 'Use scikit-learn']
        },
        {
          name: 'Advanced Topics',
          duration: '4-6 weeks',
          resources: getResourcesForSkill('machine learning', 'intermediate'),
          projects: ['End-to-end ML project', 'Deploy a model'],
          milestones: ['Handle real-world messy data', 'Optimize model performance', 'Deploy models to production']
        }
      ],
      careerRelevance: 'High-growth field with 8,500+ job mentions. Critical for AI/ML roles and valuable in data science.',
      nextSteps: ['Specialize in deep learning or MLOps', 'Learn cloud ML platforms', 'Build industry-specific expertise']
    },
    
    'react': {
      estimatedTime: '6-10 weeks',
      difficulty: userLevel,
      phases: [
        {
          name: 'React Basics',
          duration: '2-3 weeks',
          resources: getResourcesForSkill('react', 'beginner'),
          projects: ['Simple todo app', 'Weather app with API'],
          milestones: ['Understand components and JSX', 'Manage state with hooks', 'Handle events and forms']
        },
        {
          name: 'Advanced React',
          duration: '2-3 weeks',
          resources: getResourcesForSkill('react', 'intermediate'),
          projects: ['E-commerce app', 'Social media dashboard'],
          milestones: ['Use Context API', 'Implement routing', 'Optimize performance']
        },
        {
          name: 'Ecosystem',
          duration: '2-4 weeks',
          resources: [],
          projects: ['Full-stack application', 'Production deployment'],
          milestones: ['Integrate with backend APIs', 'Use testing libraries', 'Deploy to production']
        }
      ],
      careerRelevance: 'Essential for Frontend SWE roles. React has 8,200+ job mentions and is the most popular frontend framework.',
      nextSteps: ['Learn Next.js for full-stack development', 'Master TypeScript', 'Study mobile development with React Native']
    }
  };
  
  const defaultPath: Omit<LearningPath, 'skill'> = {
    estimatedTime: '4-8 weeks',
    difficulty: userLevel,
    phases: [
      {
        name: 'Foundation',
        duration: '2-3 weeks',
        resources: getResourcesForSkill(skill, 'beginner'),
        projects: [`Basic ${skill} project`],
        milestones: [`Understand ${skill} fundamentals`, `Complete first tutorial`]
      },
      {
        name: 'Application',
        duration: '2-5 weeks',
        resources: getResourcesForSkill(skill, 'intermediate'),
        projects: [`Intermediate ${skill} project`],
        milestones: [`Build real project with ${skill}`, `Apply knowledge practically`]
      }
    ],
    careerRelevance: `${skill} is valuable for your target career path.`,
    nextSteps: [`Practice ${skill} regularly`, `Build portfolio projects`, `Stay updated with latest developments`]
  };
  
  return {
    skill,
    ...(paths[skill.toLowerCase()] || defaultPath)
  };
}

export function generatePersonalizedRecommendations(
  skillGaps: SkillGap[],
  userProfile: {
    level?: 'beginner' | 'intermediate' | 'advanced';
    timeAvailable?: string;
    learningStyle?: string[];
    budget?: 'free' | 'budget' | 'premium';
  }
): {
  priority1: LearningResource[];
  priority2: LearningResource[];
  priority3: LearningResource[];
  studyPlan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
} {
  const level = userProfile.level || 'beginner';
  const preferredTypes = userProfile.learningStyle || ['interactive', 'course', 'tutorial'];
  
  // Categorize gaps by priority
  const criticalGaps = skillGaps.filter(g => g.gapSeverity === 'critical').slice(0, 2);
  const importantGaps = skillGaps.filter(g => g.gapSeverity === 'important').slice(0, 3);
  const beneficialGaps = skillGaps.filter(g => g.gapSeverity === 'beneficial').slice(0, 2);
  
  // Get resources for each priority level
  const priority1 = criticalGaps.flatMap(gap => 
    getResourcesForSkill(gap.skill, level, preferredTypes, 2)
  );
  
  const priority2 = importantGaps.flatMap(gap => 
    getResourcesForSkill(gap.skill, level, preferredTypes, 2)
  );
  
  const priority3 = beneficialGaps.flatMap(gap => 
    getResourcesForSkill(gap.skill, level, preferredTypes, 1)
  );
  
  // Generate 4-week study plan
  const studyPlan = generateStudyPlan(criticalGaps, importantGaps, userProfile.timeAvailable);
  
  return {
    priority1,
    priority2,
    priority3,
    studyPlan
  };
}

function generateStudyPlan(
  criticalGaps: SkillGap[],
  importantGaps: SkillGap[],
  timeAvailable?: string
): {
  week1: string[];
  week2: string[];
  week3: string[];
  week4: string[];
} {
  const isIntensive = timeAvailable === 'full-time' || timeAvailable === '20+ hours/week';
  
  // Week 1: Start with most critical skill
  const week1 = criticalGaps.length > 0 
    ? [
        `Begin learning ${criticalGaps[0].skill}`,
        `Complete basic tutorial for ${criticalGaps[0].skill}`,
        'Set up learning environment and tools'
      ]
    : ['Review fundamentals', 'Set learning goals', 'Choose primary skill to focus on'];
  
  // Week 2: Continue critical + introduce second priority
  const week2 = [
    criticalGaps.length > 0 ? `Continue practicing ${criticalGaps[0].skill}` : 'Focus on core skills',
    criticalGaps.length > 1 ? `Start learning ${criticalGaps[1].skill}` : 
      (importantGaps.length > 0 ? `Begin ${importantGaps[0].skill}` : 'Deepen current knowledge'),
    'Work on first practical project'
  ];
  
  // Week 3: Practice and application
  const week3 = [
    'Build a project combining learned skills',
    importantGaps.length > 0 ? `Practice ${importantGaps[0].skill}` : 'Strengthen existing skills',
    'Get feedback on your progress'
  ];
  
  // Week 4: Integration and assessment
  const week4 = [
    'Complete portfolio project',
    'Review and consolidate learning',
    isIntensive ? 'Start planning next phase' : 'Assess progress and plan continuation'
  ];
  
  return { week1, week2, week3, week4 };
}

export function trackLearningProgress(
  skillName: string,
  completedResources: string[],
  timeSpent: number,
  selfAssessment: number // 1-10 scale
): {
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  nextRecommendations: LearningResource[];
  estimatedCompletion: string;
} {
  // Calculate proficiency based on completed resources and self-assessment
  const resourceWeight = completedResources.length * 2;
  const assessmentWeight = selfAssessment;
  const timeWeight = Math.min(timeSpent / 40, 3); // Cap at 3 for 40+ hours
  
  const proficiencyScore = (resourceWeight + assessmentWeight + timeWeight) / 3;
  
  let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  if (proficiencyScore >= 7) proficiencyLevel = 'advanced';
  else if (proficiencyScore >= 4) proficiencyLevel = 'intermediate';
  else proficiencyLevel = 'beginner';
  
  // Get next level recommendations
  const nextLevel = proficiencyLevel === 'beginner' ? 'intermediate' : 'advanced';
  const nextRecommendations = getResourcesForSkill(skillName, nextLevel, undefined, 3);
  
  // Estimate completion time based on current progress
  const remainingTime = proficiencyLevel === 'beginner' ? '4-6 weeks' :
                       proficiencyLevel === 'intermediate' ? '2-4 weeks' : 'Ongoing mastery';
  
  return {
    proficiencyLevel,
    nextRecommendations,
    estimatedCompletion: remainingTime
  };
}

// Simple 14-day learning plan generator for API compatibility
export function generateLearningPlan(missingSkills: Array<{ skill: string; weight: number; priority: string; resources: any[] }>): Array<{ day: number; task: string; skill: string }> {
  const plan: Array<{ day: number; task: string; skill: string }> = [];
  
  // Sort by priority and weight
  const sortedSkills = missingSkills
    .sort((a, b) => {
      if (a.priority === 'required' && b.priority !== 'required') return -1;
      if (a.priority !== 'required' && b.priority === 'required') return 1;
      return b.weight - a.weight;
    })
    .slice(0, 3); // Focus on top 3 skills

  let currentDay = 1;
  
  for (const skill of sortedSkills) {
    const skillDays = skill.priority === 'required' ? 5 : 3;
    const resources = (skill.resources || []).slice(0, 2); // Top 2 resources per skill
    
    for (let i = 0; i < skillDays && currentDay <= 14; i++) {
      let task = '';
      
      if (i === 0) {
        task = `Start learning ${skill.skill}`;
      } else if (i === 1 && resources[0]) {
        task = `Complete: ${resources[0].title}`;
      } else if (i === 2 && resources[1]) {
        task = `Work through: ${resources[1].title}`;
      } else if (i === 3) {
        task = `Practice ${skill.skill} with hands-on exercises`;
      } else {
        task = `Build a small project using ${skill.skill}`;
      }
      
      plan.push({
        day: currentDay,
        task,
        skill: skill.skill
      });
      
      currentDay++;
    }
  }
  
  // Fill remaining days with practice and review
  while (currentDay <= 14) {
    const skillToReview = sortedSkills[Math.floor(Math.random() * sortedSkills.length)];
    plan.push({
      day: currentDay,
      task: `Review and practice ${skillToReview.skill}`,
      skill: skillToReview.skill
    });
    currentDay++;
  }
  
  return plan;
}

export { RESOURCE_DATABASE };