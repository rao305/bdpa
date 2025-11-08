export const seedRoles = [
  {
    id: 'ai-ml-intern',
    title: 'AI/ML Intern',
    category: 'AI/ML',
    description: 'Learn ML fundamentals while building models for real projects',
    requirements: [
      { skill: 'python', weight: 2, priority: 'required' },
      { skill: 'machine learning basics', weight: 2, priority: 'required' },
      { skill: 'statistics', weight: 1, priority: 'required' },
      { skill: 'pandas', weight: 1, priority: 'required' },
      { skill: 'numpy', weight: 1, priority: 'required' },
      { skill: 'jupyter notebooks', weight: 1, priority: 'required' },
      { skill: 'data visualization', weight: 1, priority: 'preferred' },
      { skill: 'scikit-learn', weight: 1, priority: 'preferred' },
      { skill: 'sql', weight: 1, priority: 'preferred' },
    ],
  },
  {
    id: 'data-analyst-intern',
    title: 'Data Analyst Intern',
    category: 'Data',
    description: 'Analyze data, create reports, and support data-driven decisions',
    requirements: [
      { skill: 'excel', weight: 2, priority: 'required' },
      { skill: 'sql', weight: 2, priority: 'required' },
      { skill: 'data visualization', weight: 2, priority: 'required' },
      { skill: 'statistics', weight: 1, priority: 'required' },
      { skill: 'python', weight: 1, priority: 'preferred' },
      { skill: 'tableau', weight: 1, priority: 'preferred' },
      { skill: 'power bi', weight: 1, priority: 'preferred' },
      { skill: 'data cleaning', weight: 1, priority: 'required' },
    ],
  },
  {
    id: 'backend-swe-intern',
    title: 'Backend SWE Intern',
    category: 'Backend',
    description: 'Build server-side applications, APIs, and database systems',
    requirements: [
      { skill: 'python', weight: 2, priority: 'required' },
      { skill: 'rest apis', weight: 2, priority: 'required' },
      { skill: 'sql', weight: 2, priority: 'required' },
      { skill: 'git', weight: 1, priority: 'required' },
      { skill: 'databases', weight: 1, priority: 'required' },
      { skill: 'linux basics', weight: 1, priority: 'preferred' },
      { skill: 'unit testing', weight: 1, priority: 'preferred' },
      { skill: 'cloud basics', weight: 1, priority: 'preferred' },
    ],
  },
  {
    id: 'frontend-swe-intern',
    title: 'Frontend SWE Intern',
    category: 'Frontend',
    description: 'Create user interfaces and interactive web experiences',
    requirements: [
      { skill: 'html', weight: 2, priority: 'required' },
      { skill: 'css', weight: 2, priority: 'required' },
      { skill: 'javascript', weight: 2, priority: 'required' },
      { skill: 'react', weight: 1, priority: 'required' },
      { skill: 'responsive design', weight: 1, priority: 'required' },
      { skill: 'git', weight: 1, priority: 'required' },
      { skill: 'typescript', weight: 1, priority: 'preferred' },
      { skill: 'figma', weight: 1, priority: 'preferred' },
    ],
  },
  {
    id: 'devops-intern',
    title: 'DevOps Intern',
    category: 'DevOps',
    description: 'Learn infrastructure automation and deployment practices',
    requirements: [
      { skill: 'linux', weight: 2, priority: 'required' },
      { skill: 'git', weight: 2, priority: 'required' },
      { skill: 'docker basics', weight: 2, priority: 'required' },
      { skill: 'cloud platforms', weight: 1, priority: 'required' },
      { skill: 'bash scripting', weight: 1, priority: 'required' },
      { skill: 'ci/cd basics', weight: 1, priority: 'preferred' },
      { skill: 'monitoring', weight: 1, priority: 'preferred' },
      { skill: 'python', weight: 1, priority: 'preferred' },
    ],
  },
  {
    id: 'robotics-intern',
    title: 'Robotics Intern',
    category: 'Robotics',
    description: 'Work on robotic systems, sensors, and automation projects',
    requirements: [
      { skill: 'python', weight: 2, priority: 'required' },
      { skill: 'c++ basics', weight: 2, priority: 'required' },
      { skill: 'mathematics', weight: 1, priority: 'required' },
      { skill: 'ros basics', weight: 1, priority: 'preferred' },
      { skill: 'embedded systems', weight: 1, priority: 'preferred' },
      { skill: 'sensors', weight: 1, priority: 'preferred' },
      { skill: 'control systems basics', weight: 1, priority: 'preferred' },
      { skill: 'matlab', weight: 1, priority: 'preferred' },
    ],
  },
  {
    id: 'gamedev-intern',
    title: 'Game Dev Intern',
    category: 'Game Dev',
    description: 'Develop games, work on gameplay mechanics, and create interactive content',
    requirements: [
      { skill: 'c# basics', weight: 2, priority: 'required' },
      { skill: 'unity basics', weight: 2, priority: 'required' },
      { skill: 'game design principles', weight: 1, priority: 'required' },
      { skill: 'object-oriented programming', weight: 1, priority: 'required' },
      { skill: '3d modeling basics', weight: 1, priority: 'preferred' },
      { skill: 'version control', weight: 1, priority: 'required' },
      { skill: 'scripting', weight: 1, priority: 'preferred' },
      { skill: 'problem solving', weight: 1, priority: 'required' },
    ],
  },
];

export const seedResources = [
  // Universal/Cross-Industry Skills
  { skill: 'python', title: 'Python Crash Course (Free)', url: 'https://automatetheboringstuff.com/', type: 'interactive' },
  { skill: 'python', title: 'Python for Beginners (Microsoft)', url: 'https://aka.ms/python-for-beginners', type: 'course' },
  { skill: 'git', title: 'Git & GitHub Crash Course', url: 'https://www.freecodecamp.org/news/git-and-github-crash-course/', type: 'tutorial' },
  { skill: 'git', title: 'Interactive Git Tutorial', url: 'https://learngitbranching.js.org/', type: 'interactive' },
  { skill: 'sql', title: 'SQL Tutorial (W3Schools)', url: 'https://www.w3schools.com/sql/', type: 'tutorial' },
  { skill: 'sql', title: 'SQLBolt Interactive Lessons', url: 'https://sqlbolt.com/', type: 'interactive' },

  // AI/ML Intern Resources
  { skill: 'machine learning basics', title: 'ML Crash Course (Google)', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
  { skill: 'machine learning basics', title: 'Kaggle Learn ML', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'course' },
  { skill: 'statistics', title: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course' },
  { skill: 'statistics', title: 'StatQuest YouTube Channel', url: 'https://www.youtube.com/c/joshstarmer', type: 'video' },
  { skill: 'pandas', title: 'Pandas Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'documentation' },
  { skill: 'pandas', title: '10 Minutes to Pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', type: 'tutorial' },
  { skill: 'numpy', title: 'NumPy Quickstart Tutorial', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'tutorial' },
  { skill: 'jupyter notebooks', title: 'Jupyter Notebook Tutorial', url: 'https://www.dataquest.io/blog/jupyter-notebook-tutorial/', type: 'tutorial' },
  { skill: 'data visualization', title: 'Matplotlib Tutorial', url: 'https://matplotlib.org/stable/tutorials/index.html', type: 'tutorial' },
  { skill: 'scikit-learn', title: 'Scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'documentation' },

  // Data Analyst Intern Resources
  { skill: 'excel', title: 'Excel Essential Skills (Microsoft)', url: 'https://support.microsoft.com/en-us/office/excel-help-center-e8f4d3a2-de41-4e7b-ad7d-1c4edb6d7c4d', type: 'documentation' },
  { skill: 'excel', title: 'Excel Fundamentals for Data Analysis', url: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm', type: 'course' },
  { skill: 'data cleaning', title: 'Data Cleaning with Python', url: 'https://realpython.com/python-data-cleaning-numpy-pandas/', type: 'tutorial' },
  { skill: 'tableau', title: 'Tableau Public Free Training', url: 'https://public.tableau.com/en-us/s/resources', type: 'course' },
  { skill: 'power bi', title: 'Microsoft Power BI Learning Path', url: 'https://docs.microsoft.com/en-us/learn/powerplatform/power-bi/', type: 'course' },

  // Backend SWE Intern Resources
  { skill: 'rest apis', title: 'REST API Tutorial', url: 'https://restfulapi.net/', type: 'tutorial' },
  { skill: 'rest apis', title: 'Build Your First API', url: 'https://www.freecodecamp.org/news/build-rest-api-python-flask/', type: 'tutorial' },
  { skill: 'databases', title: 'Database Design Basics', url: 'https://support.microsoft.com/en-us/office/database-design-basics-eb2159cf-1e30-401a-8084-bd4f9c9ca1f5', type: 'tutorial' },
  { skill: 'linux basics', title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'interactive' },
  { skill: 'unit testing', title: 'Python Testing 101', url: 'https://realpython.com/python-testing/', type: 'tutorial' },
  { skill: 'cloud basics', title: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/course-descriptions/cloud-practitioner-essentials/', type: 'course' },

  // Frontend SWE Intern Resources
  { skill: 'html', title: 'MDN HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics', type: 'tutorial' },
  { skill: 'html', title: 'freeCodeCamp HTML', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', type: 'course' },
  { skill: 'css', title: 'CSS Grid Garden', url: 'https://cssgridgarden.com/', type: 'interactive' },
  { skill: 'css', title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', type: 'interactive' },
  { skill: 'javascript', title: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial' },
  { skill: 'javascript', title: 'JavaScript30', url: 'https://javascript30.com/', type: 'course' },
  { skill: 'react', title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'tutorial' },
  { skill: 'react', title: 'React for Beginners (Scrimba)', url: 'https://scrimba.com/learn/learnreact', type: 'course' },
  { skill: 'responsive design', title: 'Responsive Web Design (freeCodeCamp)', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', type: 'course' },
  { skill: 'typescript', title: 'TypeScript in 5 Minutes', url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html', type: 'tutorial' },
  { skill: 'figma', title: 'Figma for Developers', url: 'https://help.figma.com/hc/en-us/articles/360040451373-Explore-developer-resources', type: 'tutorial' },

  // DevOps Intern Resources
  { skill: 'linux', title: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners', type: 'tutorial' },
  { skill: 'docker basics', title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'tutorial' },
  { skill: 'docker basics', title: 'Docker for Beginners', url: 'https://docker-curriculum.com/', type: 'course' },
  { skill: 'cloud platforms', title: 'AWS Getting Started', url: 'https://aws.amazon.com/getting-started/', type: 'tutorial' },
  { skill: 'bash scripting', title: 'Bash Scripting Tutorial', url: 'https://linuxconfig.org/bash-scripting-tutorial-for-beginners', type: 'tutorial' },
  { skill: 'ci/cd basics', title: 'GitHub Actions Tutorial', url: 'https://docs.github.com/en/actions/learn-github-actions', type: 'tutorial' },
  { skill: 'monitoring', title: 'Introduction to Monitoring', url: 'https://www.atlassian.com/incident-management/devops/monitoring', type: 'tutorial' },

  // Robotics Intern Resources
  { skill: 'c++ basics', title: 'LearnCpp.com', url: 'https://www.learncpp.com/', type: 'tutorial' },
  { skill: 'c++ basics', title: 'C++ Tutorial (Programiz)', url: 'https://www.programiz.com/cpp-programming', type: 'tutorial' },
  { skill: 'mathematics', title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math', type: 'course' },
  { skill: 'ros basics', title: 'ROS Tutorials', url: 'http://wiki.ros.org/ROS/Tutorials', type: 'tutorial' },
  { skill: 'embedded systems', title: 'Arduino Getting Started', url: 'https://www.arduino.cc/en/Guide', type: 'tutorial' },
  { skill: 'sensors', title: 'Sensor Basics', url: 'https://learn.sparkfun.com/tutorials/what-is-a-sensor', type: 'tutorial' },
  { skill: 'control systems basics', title: 'Control Systems Basics', url: 'https://www.mathworks.com/videos/control-systems-in-practice-81834.html', type: 'video' },
  { skill: 'matlab', title: 'MATLAB Onramp', url: 'https://www.mathworks.com/learn/tutorials/matlab-onramp.html', type: 'course' },

  // Game Dev Intern Resources
  { skill: 'c# basics', title: 'C# Fundamentals (Microsoft)', url: 'https://docs.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/', type: 'tutorial' },
  { skill: 'c# basics', title: 'C# Programming Yellow Book', url: 'https://www.robmiles.com/c-yellow-book/', type: 'tutorial' },
  { skill: 'unity basics', title: 'Unity Learn', url: 'https://learn.unity.com/', type: 'course' },
  { skill: 'unity basics', title: 'Unity Beginner Tutorials', url: 'https://unity3d.com/learn/tutorials', type: 'tutorial' },
  { skill: 'game design principles', title: 'Game Design Document Template', url: 'https://www.gamedeveloper.com/business/how-to-write-a-game-design-document', type: 'tutorial' },
  { skill: 'object-oriented programming', title: 'OOP Principles (Codecademy)', url: 'https://www.codecademy.com/learn/learn-object-oriented-programming', type: 'course' },
  { skill: '3d modeling basics', title: 'Blender Fundamentals', url: 'https://www.blender.org/support/tutorials/', type: 'tutorial' },
  { skill: 'version control', title: 'Git for Game Development', url: 'https://thoughtbot.com/blog/how-to-git-with-unity', type: 'tutorial' },
  { skill: 'scripting', title: 'Unity Scripting API', url: 'https://docs.unity3d.com/ScriptReference/', type: 'documentation' },
  { skill: 'problem solving', title: 'LeetCode Easy Problems', url: 'https://leetcode.com/problemset/algorithms/', type: 'interactive' },
];

export const demoProfile = {
  is_student: true,
  year: 'Sophomore',
  major: 'Computer Science',
  skills: ['python', 'html', 'css', 'git', 'excel'],
  coursework: ['Intro to Programming', 'Data Structures', 'Statistics'],
  experience: [
    { type: 'project', duration: '2 months', description: 'Built a personal website' },
  ],
  target_category: 'AI/ML',
  first_time: true,
};

export const demoJD = {
  title: 'AI/ML Intern - Summer 2025',
  text: `Join our AI team as a Machine Learning Intern and gain hands-on experience with real ML projects.

What you'll do:
- Assist in building machine learning models for data analysis
- Learn to clean and preprocess datasets
- Work with Python libraries like pandas and scikit-learn
- Create data visualizations and reports
- Collaborate with senior engineers on ML projects

Requirements:
- Currently pursuing a degree in Computer Science, Data Science, or related field
- Basic programming knowledge in Python
- Understanding of statistics and mathematics
- Strong problem-solving skills and willingness to learn
- Ability to work in a team environment

Preferred (but not required):
- Experience with pandas, NumPy, or other data science libraries
- Previous coursework in machine learning or statistics
- Familiarity with Jupyter notebooks
- Basic SQL knowledge

This internship is perfect for students who want to explore AI/ML careers and gain practical experience in a supportive learning environment.`,
};
