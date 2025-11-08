// Resume Parser - Extracts structured data from resume text
// Auto-fills onboarding form fields

import { extractSkillsFromText } from './normalization';

export interface ParsedResumeData {
  skills: string[];
  education: {
    major?: string;
    degree?: string;
    year?: string;
    school?: string;
  };
  coursework: string[];
  experience: Array<{
    type: string;
    duration: string;
    description: string;
  }>;
  targetCategory?: string;
}

export function parseResumeText(text: string, dictionary: Set<string>): ParsedResumeData {
  const lowerText = text.toLowerCase();
  const parsed: ParsedResumeData = {
    skills: [],
    education: {},
    coursework: [],
    experience: [],
    targetCategory: undefined,
  };

  // Extract skills
  parsed.skills = extractSkillsFromText(text, dictionary);

  // Extract education section once (reused for both education and coursework)
  const educationSection = extractSection(text, /education|academic|university|college|degree|qualification/i);
  
  // Extract education information - more robust patterns
  if (educationSection) {
    // Extract major - multiple patterns to catch different formats
    const majorPatterns = [
      // "Major: Computer Science" or "Majoring in Computer Science"
      /(?:major|degree|studying|pursuing|concentration)[\s:]+(?:in\s+)?([A-Z][A-Za-z\s&,]+(?:Science|Engineering|Studies|Arts|Business|Technology|Mathematics|Statistics))?/i,
      // "Bachelor of Science in Computer Science"
      /(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|Ph\.?D\.?|B\.?A\.?|M\.?A\.?)[\s]+(?:of\s+)?(?:Science|Arts|Engineering|Technology)?[\s]+(?:in\s+)?([A-Z][A-Za-z\s&,]+)/,
      // "Computer Science" or "Data Science" standalone
      /([A-Z][A-Za-z\s&,]+(?:Computer Science|Data Science|Software Engineering|Information Technology|Electrical Engineering|Mechanical Engineering|Civil Engineering|Chemical Engineering|Biomedical Engineering|Aerospace Engineering|Industrial Engineering|Materials Science|Physics|Mathematics|Statistics|Computer Engineering|Cybersecurity|Information Systems))/,
      // Generic technical degree field patterns
      /([A-Z][A-Za-z\s&,]{3,40}(?:Science|Engineering|Technology|Mathematics|Computer|Information|Software|Data|Cybersecurity))/,
    ];
    
    for (const pattern of majorPatterns) {
      const match = educationSection.match(pattern);
      if (match && match[1]) {
        let major = match[1].trim();
        // Clean up common prefixes/suffixes
        major = major.replace(/^(in|of|the)\s+/i, '').trim();
        if (major.length > 3 && major.length < 60 && !major.match(/^(Bachelor|Master|PhD|University|College)/i)) {
          parsed.education.major = major;
          break;
        }
      }
    }

    // Extract degree type
    const degreeMatch = educationSection.match(/(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|Ph\.?D\.?|Associate)/i);
    if (degreeMatch) {
      parsed.education.degree = degreeMatch[1];
    }

    // Extract graduation year - multiple patterns
    const yearPatterns = [
      /(?:graduat|expected|class of|complet|degree|awarded)[\w\s]*(?:in|on)?[\s]*(\d{4})/i,
      /(\d{4})[\s]*(?:[-–—]|to|until)[\s]*(?:present|current|\d{4})/i, // Date ranges
      /(?:expected|anticipated)[\s]+(?:graduation|completion)[\s]+(?:in|on)?[\s]*(\d{4})/i,
    ];
    
    let yearFound = false;
    for (const pattern of yearPatterns) {
      const yearMatch = educationSection.match(pattern);
      if (yearMatch && yearMatch[1]) {
        const year = parseInt(yearMatch[1]);
        const currentYear = new Date().getFullYear();
        // Valid graduation years: between 1980 and 10 years in the future
        if (year >= 1980 && year <= currentYear + 10) {
          parsed.education.year = yearMatch[1];
          yearFound = true;
          break;
        }
      }
    }
    
    if (!yearFound) {
      // Try to find any 4-digit year that's likely a graduation year
      const years = educationSection.match(/\b(20\d{2}|19\d{2})\b/g);
      if (years && years.length > 0) {
        const currentYear = new Date().getFullYear();
        const validYears = years
          .map(y => parseInt(y))
          .filter(y => y >= 1980 && y <= currentYear + 10)
          .sort((a, b) => b - a); // Most recent first
        if (validYears.length > 0) {
          parsed.education.year = validYears[0].toString();
        }
      }
    }

    // Extract school name
    const schoolMatch = educationSection.match(/(?:at|from|university|college|institute)[\s]+([A-Z][A-Za-z\s&]+(?:University|College|Institute|School))/i);
    if (schoolMatch && schoolMatch[1]) {
      parsed.education.school = schoolMatch[1].trim();
    }
  }

  // Extract coursework - comprehensive extraction from multiple sources
  const courseworkPatterns = [
    /coursework[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /relevant\s+courses?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /courses?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /classes?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /curriculum[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /academic\s+courses?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /key\s+courses?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /course\s+list[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /completed\s+courses?[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
  ];
  
  let allCourseText = '';
  for (const pattern of courseworkPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      allCourseText += '\n' + match[1];
    }
  }
  
  // Also check education section for courses
  if (educationSection) {
    allCourseText += '\n' + educationSection;
  }
  
  // Also search entire resume for course patterns
  const allCourses: string[] = [];
  
  // Pattern 1: Course codes (CS 101, COMPSCI 250, ECE 301, CS101, CS-101)
  const courseCodePatterns = [
    /\b([A-Z]{2,10}[\s-]?\d{3,4}[A-Z]?)\b/g,  // CS 101, COMPSCI 250
    /\b([A-Z]{2,10}\d{3,4})\b/g,              // CS101, ECE301
    /\b([A-Z]{2,10}[\s-]\d{3,4})\b/g,         // CS-101, ECE-301
  ];
  
  for (const pattern of courseCodePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length >= 4 && match[1].length <= 15) {
        allCourses.push(match[1].trim());
      }
    }
  }
  
  // Pattern 2: Course names with keywords (expanded list)
  const courseKeywords = [
    'introduction', 'fundamentals', 'advanced', 'data structures', 'algorithms',
    'algorithm', 'database', 'databases', 'software engineering', 'computer science',
    'machine learning', 'artificial intelligence', 'networks', 'networking',
    'operating systems', 'distributed systems', 'web development', 'mobile development',
    'cloud computing', 'security', 'cryptography', 'compilers', 'programming',
    'statistics', 'calculus', 'linear algebra', 'discrete mathematics',
    'software design', 'architecture', 'testing', 'quality assurance',
    'project management', 'agile', 'devops', 'data science', 'computer vision',
    'natural language processing', 'nlp', 'deep learning', 'neural networks',
    'information systems', 'cybersecurity', 'computer graphics', 'human computer interaction',
    'hci', 'user interface', 'ui', 'user experience', 'ux', 'systems programming',
    'parallel computing', 'computer organization', 'assembly', 'compiler design',
  ];
  
  // Extract from all course text sections
  const courseTextSections = allCourseText ? allCourseText.split(/\n\n|\n(?=[A-Z][A-Z\s]+:)/) : [];
  
  for (const section of courseTextSections) {
    const lines = section.split(/\n/);
    for (const line of lines) {
      let trimmed = line.trim();
      if (trimmed.length < 5 || trimmed.length > 80) continue;
      
      // Clean up common prefixes
      trimmed = trimmed
        .replace(/^[•\-\*]\s*/, '') // Remove bullet points
        .replace(/^\d+[\.\)]\s*/, '') // Remove numbered lists (1. or 1))
        .replace(/^[A-Z][a-z]+\s+[A-Z][a-z]+:\s*/, '') // Remove "Course Name:"
        .trim();
      
      if (trimmed.length < 5) continue;
      
      const lower = trimmed.toLowerCase();
      
      // Check if line contains course keywords
      const hasKeyword = courseKeywords.some(keyword => lower.includes(keyword));
      
      // Check if it looks like a course name (capitalized, reasonable length)
      const looksLikeCourse = /^[A-Z][A-Za-z\s&,:-]{4,70}$/.test(trimmed);
      
      // Check if it has a course code pattern
      const hasCourseCode = /\b[A-Z]{2,10}[\s-]?\d{3,4}\b/.test(trimmed);
      
      // Check if it's in a course-like format
      const courseFormat = /^(?:[A-Z][A-Za-z\s&,:-]+(?:Course|Class|Subject))|(?:Introduction|Fundamentals|Advanced|Data Structures|Algorithms|Database|Software|Computer|Machine Learning|Artificial Intelligence)/i.test(trimmed);
      
      // Exclude common non-course words
      const excludeWords = ['relevant', 'coursework', 'courses', 'classes', 'and', 'or', 'the', 'a', 'an',
                           'include', 'including', 'such', 'as', 'example', 'examples', 'key', 'selected',
                           'completed', 'taken', 'enrolled', 'grade', 'gpa', 'credit', 'credits', 'semester',
                           'fall', 'spring', 'summer', 'winter', 'year', 'term'];
      const isExcluded = excludeWords.some(word => lower === word || lower.startsWith(word + ' ') || lower.endsWith(' ' + word));
      
      if ((hasKeyword || looksLikeCourse || hasCourseCode || courseFormat) && !isExcluded) {
        // Further clean up
        let courseName = trimmed
          .replace(/\([^)]*\)/g, '') // Remove parentheses content
          .replace(/\[[^\]]*\]/g, '') // Remove bracket content
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        // Remove common suffixes
        courseName = courseName.replace(/\s+(?:Course|Class|Subject|I|II|III|IV|V)$/i, '').trim();
        
        if (courseName.length >= 5 && courseName.length <= 70 && /[A-Za-z]/.test(courseName)) {
          allCourses.push(courseName);
        }
      }
    }
  }
  
  // Pattern 3: Extract from comma/colon/semicolon/bullet separated lists
  const listPatterns = [
    /(?:coursework|relevant\s+courses?|courses?|classes?)[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
    /(?:taken|completed|enrolled\s+in)[:\s]*([^]*?)(?=\n\n|\n[A-Z][A-Z\s]+:|$)/i,
  ];
  
  for (const pattern of listPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const listText = match[1];
      // Split by various separators
      const items = listText
        .split(/[,:;•\-\n|]/)
        .map(s => s.trim())
        .filter(s => {
          const lower = s.toLowerCase();
          // Filter out non-course items
          if (s.length < 5 || s.length > 70) return false;
          if (/^(and|or|the|a|an|include|including|such|as|example|examples|key|selected|completed|taken|enrolled)$/i.test(lower)) return false;
          if (!/[A-Za-z]/.test(s)) return false;
          return true;
        });
      allCourses.push(...items);
    }
  }
  
  // Pattern 4: Look for course patterns in the entire resume text
  // Find lines that look like courses but might not be in a coursework section
  const resumeLines = text.split(/\n/);
  for (const line of resumeLines) {
    const trimmed = line.trim();
    if (trimmed.length < 10 || trimmed.length > 70) continue;
    
    // Look for patterns like "CS 101 - Introduction to Computer Science"
    const courseWithCode = /([A-Z]{2,10}[\s-]?\d{3,4})\s*[-–—:]\s*([A-Z][A-Za-z\s&,:-]+)/i;
    const match = trimmed.match(courseWithCode);
    if (match && match[2]) {
      const courseName = match[2].trim();
      if (courseName.length >= 5 && courseName.length <= 70) {
        allCourses.push(courseName);
      }
    }
  }
  
  // Filter and clean courses
  const filteredCourses = allCourses
    .map(c => c.trim())
    .filter(c => {
      if (!c || c.length < 5 || c.length > 70) return false;
      
      const lower = c.toLowerCase();
      
      // Exclude common non-course words and phrases
      const excludePatterns = [
        /^(relevant|coursework|courses|classes|and|or|the|a|an|include|including|such|as|example|examples|key|selected|completed|taken|enrolled|grade|gpa|credit|credits|semester|fall|spring|summer|winter|year|term)$/,
        /^(i|we|you|they|this|that|these|those)$/,
        /^(with|without|from|to|in|on|at|by|for|of)$/,
        /^(course|class|subject)$/i,
      ];
      
      if (excludePatterns.some(pattern => pattern.test(lower))) return false;
      if (/^[A-Z]{1,2}$/.test(c)) return false; // Exclude single/two letter abbreviations
      if (!/[A-Za-z]/.test(c)) return false; // Must contain at least one letter
      
      // Exclude if it's just a date or number
      if (/^\d+$/.test(c)) return false;
      
      return true;
    })
    .filter((c, i, arr) => {
      // Remove duplicates (case-insensitive)
      const lower = c.toLowerCase();
      return arr.findIndex(item => item.toLowerCase() === lower) === i;
    })
    .slice(0, 25); // Limit to 25 courses
  
  parsed.coursework = filteredCourses;

  // Extract experience/projects - more comprehensive extraction
  const experienceSection = extractSection(text, /experience|projects|work|internship|employment|professional|work experience|project experience|research experience/i);
  if (experienceSection) {
    // Split by various separators (bullet points, new lines, job titles)
    const separators = [
      /(?:^|\n)[•\-\*]\s+/gm,  // Bullet points
      /(?:^|\n)\d+\.\s+/gm,    // Numbered lists
      /(?:^|\n)(?:[A-Z][a-z]+\s+[A-Z][a-z]+|Software|Data|Machine|Full|Backend|Frontend|DevOps|Research|Teaching)/gm, // Job titles
    ];
    
    let experienceItems: string[] = [];
    for (const separator of separators) {
      const split = experienceSection.split(separator);
      experienceItems.push(...split.filter(item => item.trim().length > 20));
    }
    
    // Remove duplicates and limit
    experienceItems = [...new Set(experienceItems)].slice(0, 8);
    
    for (const item of experienceItems) {
      // Try to extract type (Intern, Project, Work, etc.)
      let type = 'Project';
      const lowerItem = item.toLowerCase();
      if (lowerItem.match(/intern|internship|co-op|coop/i)) type = 'Internship';
      else if (lowerItem.match(/work|employment|job|position|full.?time|part.?time|contract|freelance/i)) type = 'Work';
      else if (lowerItem.match(/project|built|developed|created|designed|implemented|built|constructed/i)) type = 'Project';
      else if (lowerItem.match(/research|research assistant|undergraduate research/i)) type = 'Research';
      else if (lowerItem.match(/volunteer|volunteering/i)) type = 'Volunteer';
      else if (lowerItem.match(/teaching|ta|tutor|mentor/i)) type = 'Teaching';

      // Extract duration - multiple date patterns
      let duration = '';
      const datePatterns = [
        /(\w+\s+\d{4})\s*(?:[-–—]|to|through)\s*(\w+\s+\d{4}|present|current|now|ongoing)/i,
        /(\d{1,2}\/\d{4})\s*(?:[-–—]|to|through)\s*(\d{1,2}\/\d{4}|present|current|now)/i,
        /(\w+\s+\d{4})\s*(?:[-–—]|to|through)\s*(\d{4})/i,
      ];
      
      let dateFound = false;
      for (const pattern of datePatterns) {
        const dateMatch = item.match(pattern);
        if (dateMatch) {
          duration = `${dateMatch[1]} - ${dateMatch[2]}`;
          dateFound = true;
          break;
        }
      }
      
      if (!dateFound) {
        // Try single date
        const singleDate = item.match(/(\w+\s+\d{4}|\d{1,2}\/\d{4})/);
        if (singleDate) {
          duration = singleDate[1];
        } else {
          // Try to find year ranges
          const yearRange = item.match(/(\d{4})\s*(?:[-–—]|to)\s*(\d{4})/);
          if (yearRange) {
            duration = `${yearRange[1]} - ${yearRange[2]}`;
          } else {
            duration = 'Ongoing';
          }
        }
      }

      // Extract description - clean up and limit length
      let description = item.trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n/g, ' ')  // Remove newlines
        .substring(0, 200);   // Limit length
      
      // Remove common prefixes
      description = description.replace(/^(•|\-|\*|\d+\.)\s*/, '').trim();

      if (description.length > 15) {
        parsed.experience.push({ type, duration, description });
      }
    }
  }

  // Infer target category from skills
  parsed.targetCategory = inferTargetCategory(parsed.skills);

  return parsed;
}

function extractSection(text: string, pattern: RegExp): string | null {
  // Try multiple patterns to find section
  const patterns = [
    // Section header followed by content until next section or end
    new RegExp(`${pattern.source}[\\s\\S]*?(?=\\n\\n[A-Z][A-Z\\s]+:|$)`, 'i'),
    // Section header on its own line
    new RegExp(`(?:^|\\n)${pattern.source}[\\s:]*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i'),
    // Section header with colon
    new RegExp(`${pattern.source}[\\s:]+([\\s\\S]*?)(?=\\n\\n[A-Z][A-Z\\s]+:|$)`, 'i'),
  ];
  
  for (const sectionPattern of patterns) {
    const match = text.match(sectionPattern);
    if (match) {
      // Return the content part (group 1 if exists, otherwise full match)
      return match[1] || match[0];
    }
  }
  
  return null;
}

function inferTargetCategory(skills: string[]): string {
  const skillSet = new Set(skills.map(s => s.toLowerCase()));
  
  // AI/ML indicators
  if (skillSet.has('machine learning') || skillSet.has('tensorflow') || 
      skillSet.has('pytorch') || skillSet.has('neural networks') || 
      skillSet.has('deep learning') || skillSet.has('ai')) {
    return 'AI/ML';
  }
  
  // Data indicators
  if (skillSet.has('data analysis') || skillSet.has('pandas') || 
      skillSet.has('numpy') || skillSet.has('sql') || 
      skillSet.has('tableau') || skillSet.has('excel')) {
    return 'Data';
  }
  
  // Backend indicators
  if (skillSet.has('python') || skillSet.has('java') || 
      skillSet.has('node.js') || skillSet.has('rest apis') || 
      skillSet.has('databases') || skillSet.has('sql')) {
    return 'Backend';
  }
  
  // Frontend indicators
  if (skillSet.has('react') || skillSet.has('javascript') || 
      skillSet.has('html') || skillSet.has('css') || 
      skillSet.has('typescript') || skillSet.has('vue')) {
    return 'Frontend';
  }
  
  // DevOps indicators
  if (skillSet.has('docker') || skillSet.has('kubernetes') || 
      skillSet.has('aws') || skillSet.has('azure') || 
      skillSet.has('ci/cd') || skillSet.has('terraform')) {
    return 'DevOps';
  }
  
  // Robotics indicators
  if (skillSet.has('c++') || skillSet.has('ros') || 
      skillSet.has('robotics') || skillSet.has('embedded systems')) {
    return 'Robotics';
  }
  
  // Game Dev indicators
  if (skillSet.has('unity') || skillSet.has('c#') || 
      skillSet.has('game development') || skillSet.has('unreal')) {
    return 'Game Dev';
  }
  
  return ''; // Let user choose if unclear
}

