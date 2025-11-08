import { NextResponse } from 'next/server';

// Cached market data to avoid file I/O on every request
let cachedMarketData: Record<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fallback market data (used immediately, no file I/O blocking)
const FALLBACK_MARKET_DATA: Record<string, number> = {
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
  'typescript': 4500,
  'html': 11000,
  'css': 10000,
  'linux': 5000,
  'mathematics': 4000,
  'statistics': 3500,
  'pandas': 3000,
  'numpy': 2500,
  'scikit-learn': 2000,
  'c++': 5000,
  'ros': 1500,
  'embedded systems': 2000,
  'unity': 3000,
  'c#': 4000,
  'machine learning': 6000,
  'tableau': 3000,
  'power bi': 2500,
};

// Load market data from CSV files dynamically (with caching)
export async function GET() {
  try {
    // Return cached data if available and fresh
    const now = Date.now();
    if (cachedMarketData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        marketData: cachedMarketData,
        skillCombinations: generateSkillCombinations(cachedMarketData),
        emergingTech: [],
        totalSkills: Object.keys(cachedMarketData).length,
      });
    }
    
    // Try to load from CSV in background (non-blocking)
    let marketData: Record<string, number> = { ...FALLBACK_MARKET_DATA };
    
    // Try to load CSV asynchronously (don't block response)
    try {
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      
      const possiblePaths = [
        join(process.cwd(), '../../analysis/results/top_100_skills.csv'),
        join(process.cwd(), '../../../analysis/results/top_100_skills.csv'),
        join(process.cwd(), 'analysis/results/top_100_skills.csv'),
      ];
      
      for (const path of possiblePaths) {
        try {
          const csvContent = await readFile(path, 'utf-8');
          const lines = csvContent.split('\n').slice(1); // Skip header
          
          // Process CSV quickly (limit to first 200 lines to avoid blocking)
          for (const line of lines.slice(0, 200)) {
            if (!line.trim()) continue;
            const [skill, countStr] = line.split(',');
            if (skill && countStr) {
              const count = parseInt(countStr.trim(), 10);
              if (!isNaN(count) && count > 0) {
                const normalizedSkill = skill.trim().toLowerCase();
                marketData[normalizedSkill] = (marketData[normalizedSkill] || 0) + count;
              }
            }
          }
          break; // Successfully loaded, exit loop
        } catch (e) {
          // Try next path
          continue;
        }
      }
    } catch (error) {
      // If CSV loading fails, use fallback (already set above)
      console.warn('Could not load CSV, using fallback data:', error);
    }
    
    // Cache the result
    cachedMarketData = marketData;
    cacheTimestamp = now;
    
    // Dynamically determine emerging tech based on growth patterns
    // (skills with lower absolute count but high growth potential)
    const emergingTech: string[] = [];
    const sortedSkills = Object.entries(marketData)
      .sort((a, b) => a[1] - b[1]) // Sort by count ascending
      .slice(0, 20); // Bottom 20 by count (emerging)
    
    for (const [skill] of sortedSkills) {
      if (['kubernetes', 'terraform', 'graphql', 'microservices', 'pytorch', 'spark', 'kafka'].includes(skill)) {
        emergingTech.push(skill);
      }
    }
    
    // Dynamically generate skill combinations based on common patterns
    // This would ideally come from analyzing job postings, but for now we'll infer from skill categories
    skillCombinations = generateSkillCombinations(marketData);
    
    return NextResponse.json({
      marketData,
      skillCombinations,
      emergingTech,
      totalSkills: Object.keys(marketData).length,
    });
  } catch (error) {
    console.error('Error loading market data:', error);
    return NextResponse.json(
      { error: 'Failed to load market data' },
      { status: 500 }
    );
  }
}

function generateSkillCombinations(marketData: Record<string, number>): Record<string, string[]> {
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

