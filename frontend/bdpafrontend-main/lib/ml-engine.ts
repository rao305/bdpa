// Enhanced ML Analysis Engine for SkillGap MVP
// Implements TF-IDF vectorization and cosine similarity for resume-JD alignment

export interface TFIDFVector {
  [term: string]: number;
}

export interface MLAnalysisResult {
  alignmentScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  documentSimilarity: number;
  skillRelevanceScores: { [skill: string]: number };
  recommendations: string[];
}

// Text preprocessing utilities
export class TextProcessor {
  private static stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'among', 'within', 'without', 'against', 'toward', 'across', 'behind', 'beyond',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours',
    'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves',
    'yourselves', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
    'will', 'just', 'should', 'now', 'also', 'have', 'has', 'had', 'be', 'been', 'being',
    'is', 'are', 'was', 'were', 'do', 'does', 'did', 'doing', 'get', 'got', 'getting'
  ]);

  static tokenize(text: string): string[] {
    // Extract meaningful tokens including tech terms
    const techPattern = /[\w+#.-]+/g;
    const tokens = text.toLowerCase().match(techPattern) || [];
    
    // Filter out stop words and very short tokens
    return tokens.filter(token => 
      token.length > 1 && 
      !this.stopWords.has(token) &&
      !token.match(/^\d+$/) // Remove pure numbers
    );
  }

  static extractNgrams(tokens: string[], n: number = 2): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  static preprocessText(text: string): string[] {
    const tokens = this.tokenize(text);
    const unigrams = tokens;
    const bigrams = this.extractNgrams(tokens, 2);
    const trigrams = this.extractNgrams(tokens, 3);
    
    // Combine all n-grams with weights
    return [...unigrams, ...bigrams, ...trigrams];
  }
}

// TF-IDF Implementation
export class TFIDFVectorizer {
  private vocabulary: string[] = [];
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments: number = 0;

  fit(documents: string[]): void {
    this.totalDocuments = documents.length;
    const termCounts = new Map<string, number>();
    
    // Build vocabulary and document frequencies
    for (const doc of documents) {
      const terms = TextProcessor.preprocessText(doc);
      const uniqueTerms = new Set(terms);
      
      // Count document frequency for each unique term
      for (const term of uniqueTerms) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      }
    }
    
    // Build vocabulary from most frequent terms
    this.vocabulary = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5000) // Limit vocabulary size
      .map(([term]) => term);
  }

  transform(document: string): TFIDFVector {
    const terms = TextProcessor.preprocessText(document);
    const termFreq = new Map<string, number>();
    
    // Calculate term frequencies
    for (const term of terms) {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    }
    
    const vector: TFIDFVector = {};
    
    // Calculate TF-IDF for each term in vocabulary
    for (const term of this.vocabulary) {
      const tf = termFreq.get(term) || 0;
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(this.totalDocuments / df);
      
      // Normalize TF using log normalization
      const normalizedTf = tf > 0 ? 1 + Math.log(tf) : 0;
      vector[term] = normalizedTf * idf;
    }
    
    return vector;
  }

  fitTransform(documents: string[]): TFIDFVector[] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }
}

// Cosine Similarity Calculator
export class SimilarityCalculator {
  static cosineSimilarity(vec1: TFIDFVector, vec2: TFIDFVector): number {
    const terms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const term of terms) {
      const val1 = vec1[term] || 0;
      const val2 = vec2[term] || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  static jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }
}

// Enhanced Skill Extractor with confidence scoring
export class SkillExtractor {
  private skillPatterns: Map<string, RegExp> = new Map();
  
  constructor(skills: string[]) {
    // Create fuzzy matching patterns for skills
    for (const skill of skills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'gi');
      this.skillPatterns.set(skill, pattern);
    }
  }

  extractSkills(text: string): { skill: string; confidence: number; matches: number }[] {
    const results: { skill: string; confidence: number; matches: number }[] = [];
    
    for (const [skill, pattern] of this.skillPatterns.entries()) {
      const matches = text.match(pattern);
      if (matches) {
        const count = matches.length;
        // Confidence based on frequency and context
        const confidence = Math.min(1.0, count * 0.3 + 0.1);
        results.push({ skill, confidence, matches: count });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

// Main ML Analysis Engine
export class MLAnalysisEngine {
  private vectorizer: TFIDFVectorizer;
  private skillExtractor: SkillExtractor;
  
  constructor(skillDictionary: string[]) {
    this.vectorizer = new TFIDFVectorizer();
    this.skillExtractor = new SkillExtractor(skillDictionary);
  }

  analyzeResumeJobMatch(
    resumeText: string,
    jobDescription: string,
    roleRequirements: Array<{ skill: string; weight: number; priority: string }>
  ): MLAnalysisResult {
    // Vectorize documents
    const documents = [resumeText, jobDescription];
    const vectors = this.vectorizer.fitTransform(documents);
    const [resumeVector, jdVector] = vectors;
    
    // Extract skills from both documents first
    const resumeSkills = this.skillExtractor.extractSkills(resumeText);
    const jdSkills = this.skillExtractor.extractSkills(jobDescription);
    
    const resumeSkillSet = new Set(resumeSkills.map(s => s.skill.toLowerCase()));
    const jdSkillSet = new Set(jdSkills.map(s => s.skill.toLowerCase()));
    const requiredSkillSet = new Set(
      roleRequirements
        .filter(r => r.priority === 'required')
        .map(r => r.skill.toLowerCase())
    );
    
    // Find keyword matches and gaps
    const keywordMatches = [...resumeSkillSet].filter(skill => 
      jdSkillSet.has(skill) || requiredSkillSet.has(skill)
    );
    
    // Calculate alignment score using cosine similarity
    let alignmentScore = SimilarityCalculator.cosineSimilarity(resumeVector, jdVector);
    
    // Enhance alignment score with skill matching (makes it more dynamic)
    const totalRelevantSkills = Math.max(1, requiredSkillSet.size + jdSkillSet.size);
    const skillMatchRatio = keywordMatches.length / totalRelevantSkills;
    const skillBoost = skillMatchRatio * 0.3; // Add up to 30% boost based on skill matches
    alignmentScore = Math.min(1, alignmentScore + skillBoost);
    
    const missingKeywords = [
      ...jdSkillSet.filter(skill => !resumeSkillSet.has(skill)),
      ...requiredSkillSet.filter(skill => !resumeSkillSet.has(skill))
    ];
    
    // Calculate skill relevance scores
    const skillRelevanceScores: { [skill: string]: number } = {};
    for (const { skill, confidence } of resumeSkills) {
      const isRequired = requiredSkillSet.has(skill.toLowerCase());
      const isInJD = jdSkillSet.has(skill.toLowerCase());
      const relevance = confidence * (isRequired ? 1.0 : isInJD ? 0.8 : 0.5);
      skillRelevanceScores[skill] = relevance;
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      alignmentScore,
      keywordMatches,
      missingKeywords,
      roleRequirements
    );
    
    return {
      alignmentScore: Math.round(alignmentScore * 100),
      keywordMatches,
      missingKeywords: [...new Set(missingKeywords)],
      documentSimilarity: alignmentScore,
      skillRelevanceScores,
      recommendations
    };
  }

  private generateRecommendations(
    alignmentScore: number,
    matches: string[],
    missing: string[],
    requirements: Array<{ skill: string; weight: number; priority: string }>
  ): string[] {
    const recommendations: string[] = [];
    
    if (alignmentScore < 0.3) {
      recommendations.push('Consider tailoring your resume more closely to this job description');
      recommendations.push('Add more relevant keywords and technical terms');
    } else if (alignmentScore < 0.6) {
      recommendations.push('Good foundation - strengthen alignment with job requirements');
    } else {
      recommendations.push('Excellent alignment with job requirements');
    }
    
    if (missing.length > 0) {
      const criticalMissing = missing
        .filter(skill => 
          requirements.some(r => r.skill.toLowerCase() === skill.toLowerCase() && r.priority === 'required')
        )
        .slice(0, 3);
      
      if (criticalMissing.length > 0) {
        recommendations.push(`Focus on learning these critical skills: ${criticalMissing.join(', ')}`);
      }
    }
    
    if (matches.length > 0) {
      recommendations.push(`Highlight your experience with: ${matches.slice(0, 3).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Market Analysis Engine for skill prioritization
export class MarketAnalysisEngine {
  private skillDemandData: Map<string, number> = new Map();
  
  constructor() {
    // Simulated skill demand data based on job market analysis
    this.initializeMarketData();
  }

  private initializeMarketData(): void {
    const marketData = {
      'python': 8500,
      'javascript': 8200,
      'java': 7800,
      'sql': 7500,
      'react': 6900,
      'node.js': 5800,
      'aws': 5600,
      'docker': 4500,
      'kubernetes': 3800,
      'machine learning': 3500,
      'typescript': 3200,
      'git': 8000,
      'html': 6500,
      'css': 6200,
      'excel': 4200,
      'tableau': 2800,
      'power bi': 2400,
      'pandas': 2100,
      'numpy': 1900,
      'scikit-learn': 1500,
      'tensorflow': 1400,
      'pytorch': 1200,
      'unity': 800,
      'c++': 3500,
      'c#': 3200,
      'linux': 4000,
      'bash': 2500,
      'rest apis': 4800
    };
    
    for (const [skill, demand] of Object.entries(marketData)) {
      this.skillDemandData.set(skill.toLowerCase(), demand);
    }
  }

  getSkillPriority(skill: string, roleWeight: number): number {
    const marketDemand = this.skillDemandData.get(skill.toLowerCase()) || 100;
    const marketWeight = Math.log(1 + marketDemand);
    return roleWeight * marketWeight;
  }

  prioritizeSkillGaps(
    missingSkills: Array<{ skill: string; weight: number; priority: string }>
  ): Array<{ skill: string; weight: number; priority: string; marketPriority: number }> {
    return missingSkills
      .map(skill => ({
        ...skill,
        marketPriority: this.getSkillPriority(skill.skill, skill.weight)
      }))
      .sort((a, b) => b.marketPriority - a.marketPriority);
  }
}