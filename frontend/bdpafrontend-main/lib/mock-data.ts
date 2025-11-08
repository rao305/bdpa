// Mock data for demo/development mode when Supabase is not available

export const mockUser = {
  id: 'mock-user-123',
  email: 'demo@skillgap.dev'
};

export const mockProfile = {
  uid: 'mock-user-123',
  first_time: false,
  is_student: true,
  year: 'Sophomore',
  major: 'Computer Science',
  skills: ['python', 'html', 'css', 'git'],
  coursework: ['Intro to Programming', 'Data Structures', 'Statistics'],
  experience: [
    { type: 'project', duration: '2 months', description: 'Built a personal website' }
  ],
  target_category: 'AI/ML',
  resume_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockAnalysis = {
  id: 'mock-analysis-456',
  uid: 'mock-user-123',
  role_id: 'ai-ml-intern',
  jd_title: 'AI/ML Intern - Summer 2025',
  jd_text: 'Sample job description...',
  readiness_overall: 66,
  subscores: {
    readiness: 62,
    alignment: 65,
    ats: 0,
    impact: 40,
    polish: 0,
    potential: 80
  },
  strengths: [
    'Good starting point with some required skills',
    'Strong programming foundation with versatile languages'
  ],
  improvements: [
    'Focus on learning the most essential required skills first',
    'Add personal projects or coursework examples to demonstrate skills'
  ],
  missing_skills: [
    {
      skill: 'machine learning basics',
      weight: 2,
      priority: 'required',
      resources: [
        {
          title: 'Machine Learning Crash Course (Google)',
          url: 'https://developers.google.com/machine-learning/crash-course',
          type: 'course'
        }
      ]
    },
    {
      skill: 'pandas',
      weight: 1,
      priority: 'required', 
      resources: [
        {
          title: 'Pandas Getting Started',
          url: 'https://pandas.pydata.org/docs/getting_started/',
          type: 'documentation'
        }
      ]
    }
  ],
  meta: {
    learning_plan: [
      { day: 1, task: 'Start learning machine learning basics', skill: 'machine learning basics' },
      { day: 2, task: 'Complete: Machine Learning Crash Course (Google)', skill: 'machine learning basics' },
      { day: 3, task: 'Start learning pandas', skill: 'pandas' },
      { day: 4, task: 'Complete: Pandas Getting Started', skill: 'pandas' }
    ]
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockRoles = [
  {
    id: 'ai-ml-intern',
    title: 'AI/ML Intern',
    category: 'AI/ML',
    description: 'Learn ML fundamentals while building models for real projects',
    requirements: [
      { skill: 'python', weight: 2, priority: 'required' },
      { skill: 'machine learning basics', weight: 2, priority: 'required' }
    ]
  }
];

export const mockAnalyses = [mockAnalysis];