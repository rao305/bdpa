// Comprehensive Tech Skills Dictionary (Technical Only)
// Used for extracting technical skills from resumes dynamically

export const TECH_SKILLS_DICTIONARY = new Set([
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c', 'c#', 'go', 'golang',
  'rust', 'swift', 'kotlin', 'scala', 'ruby', 'php', 'r', 'matlab', 'perl',
  'dart', 'lua', 'haskell', 'erlang', 'elixir', 'clojure', 'f#', 'ocaml',
  
  // Web Technologies
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus',
  'react', 'react.js', 'vue', 'vue.js', 'angular', 'angularjs', 'svelte',
  'next.js', 'nuxt.js', 'gatsby', 'remix', 'astro',
  'jquery', 'bootstrap', 'tailwind css', 'material-ui', 'ant design',
  'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint',
  
  // Backend Frameworks
  'node.js', 'nodejs', 'express', 'koa', 'nest.js', 'fastify',
  'django', 'flask', 'fastapi', 'tornado', 'bottle', 'cherrypy',
  'spring', 'spring boot', 'spring mvc', 'hibernate', 'struts',
  'asp.net', '.net', 'asp.net core', 'entity framework',
  'ruby on rails', 'rails', 'sinatra', 'hanami',
  'laravel', 'symfony', 'codeigniter', 'phalcon',
  'gin', 'echo', 'fiber', 'beego',
  
  // Databases
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle',
  'mongodb', 'cassandra', 'redis', 'elasticsearch', 'dynamodb',
  'neo4j', 'couchdb', 'riak', 'influxdb', 'timescaledb',
  'firebase', 'firestore', 'supabase', 'planetscale',
  
  // Cloud & DevOps
  'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb',
  'azure', 'microsoft azure', 'azure functions', 'azure devops',
  'gcp', 'google cloud platform', 'gce', 'gcs', 'cloud functions',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'chef', 'puppet',
  'jenkins', 'circleci', 'travis ci', 'github actions', 'gitlab ci',
  'nginx', 'apache', 'caddy', 'haproxy',
  
  // Data Science & ML
  'machine learning', 'ml', 'deep learning', 'neural networks',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
  'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
  'jupyter', 'jupyter notebook', 'colab', 'kaggle',
  'xgboost', 'lightgbm', 'catboost', 'spark', 'apache spark',
  'hadoop', 'hive', 'pig', 'hbase', 'kafka', 'flink',
  'tableau', 'power bi', 'looker', 'metabase', 'superset',
  
  // AI & NLP
  'artificial intelligence', 'ai', 'natural language processing', 'nlp',
  'computer vision', 'cv', 'opencv', 'yolo', 'detectron',
  'transformers', 'bert', 'gpt', 'llm', 'langchain', 'hugging face',
  'spacy', 'nltk', 'gensim', 'word2vec', 'glove',
  
  // Mobile Development
  'react native', 'flutter', 'ionic', 'xamarin',
  'ios', 'swift', 'objective-c', 'cocoa', 'xcode',
  'android', 'kotlin', 'java android', 'android studio',
  
  // Testing
  'jest', 'mocha', 'chai', 'jasmine', 'karma',
  'pytest', 'unittest', 'nose', 'pytest',
  'selenium', 'cypress', 'playwright', 'puppeteer',
  'junit', 'testng', 'mockito', 'jasmine',
  
  // Version Control & Tools
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
  'jira', 'confluence', 'trello', 'asana', 'notion',
  'slack', 'discord', 'microsoft teams',
  
  // Monitoring & Observability
  'prometheus', 'grafana', 'datadog', 'new relic', 'splunk',
  'elk stack', 'elasticsearch', 'logstash', 'kibana',
  'sentry', 'rollbar', 'bugsnag',
  
  // API & Microservices
  'rest api', 'rest', 'graphql', 'grpc', 'soap',
  'microservices', 'api gateway', 'kong', 'tyk',
  'rabbitmq', 'apache kafka', 'redis pub/sub', 'amqp',
  
  // Security
  'oauth', 'oauth2', 'jwt', 'ssl', 'tls', 'https',
  'penetration testing', 'vulnerability assessment',
  'owasp', 'security best practices',
  
  // Other Tools & Frameworks
  'linux', 'unix', 'bash', 'shell scripting', 'powershell',
  'vim', 'emacs', 'vscode', 'intellij', 'eclipse',
  'postman', 'insomnia', 'swagger', 'openapi',
  'figma', 'sketch', 'adobe xd', 'invision',
  'agile', 'scrum', 'kanban', 'lean', 'devops',
  
  // Specialized
  'blockchain', 'ethereum', 'solidity', 'web3',
  'iot', 'internet of things', 'arduino', 'raspberry pi',
  'game development', 'unity', 'unreal engine',
  'embedded systems', 'fpga', 'verilog', 'vhdl',
]);

// Soft Skills Dictionary
// Used for identifying soft skills (not extracted as technical skills)
export const SOFT_SKILLS_DICTIONARY = new Set([
  // Communication
  'communication', 'verbal communication', 'written communication', 'public speaking',
  'presentation', 'presentation skills', 'interpersonal skills', 'active listening',
  
  // Leadership & Management
  'leadership', 'team leadership', 'people management', 'project management',
  'team management', 'mentoring', 'coaching', 'delegation', 'strategic thinking',
  
  // Collaboration
  'teamwork', 'collaboration', 'cross-functional collaboration', 'stakeholder management',
  'client relations', 'customer service', 'relationship building',
  
  // Problem Solving
  'problem solving', 'analytical thinking', 'critical thinking', 'troubleshooting',
  'decision making', 'root cause analysis', 'creative problem solving',
  
  // Work Ethic
  'time management', 'organization', 'prioritization', 'multitasking',
  'attention to detail', 'quality focus', 'accountability', 'reliability',
  
  // Adaptability
  'adaptability', 'flexibility', 'agile mindset', 'change management',
  'learning agility', 'continuous learning', 'growth mindset',
  
  // Innovation
  'innovation', 'creativity', 'design thinking', 'entrepreneurship',
  'initiative', 'proactive', 'self-motivated',
  
  // Professional
  'professionalism', 'work ethic', 'integrity', 'confidentiality',
  'conflict resolution', 'negotiation', 'influence', 'persuasion',
]);

// Common course keywords for better coursework detection
export const COURSE_KEYWORDS = [
  'introduction', 'fundamentals', 'advanced', 'data structures',
  'algorithms', 'database', 'databases', 'software engineering',
  'computer science', 'machine learning', 'artificial intelligence',
  'networks', 'networking', 'operating systems', 'distributed systems',
  'web development', 'mobile development', 'cloud computing',
  'security', 'cryptography', 'compilers', 'programming',
  'statistics', 'calculus', 'linear algebra', 'discrete mathematics',
  'software design', 'architecture', 'testing', 'quality assurance',
  'project management', 'agile', 'devops', 'ci/cd',
];

// Course code patterns (e.g., CS 101, COMPSCI 250)
export const COURSE_CODE_PATTERN = /^[A-Z]{2,10}[\s-]?\d{3,4}[A-Z]?$/;

