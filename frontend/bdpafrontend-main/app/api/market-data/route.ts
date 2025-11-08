import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load market data from CSV files dynamically
export async function GET() {
  try {
    // Try to load from the analysis results CSV
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), '../../analysis/results/top_100_skills.csv'),
      join(process.cwd(), '../../../analysis/results/top_100_skills.csv'),
      join(process.cwd(), 'analysis/results/top_100_skills.csv'),
    ];
    
    let csvPath = possiblePaths[0];
    let csvContent = '';
    
    for (const path of possiblePaths) {
      try {
        csvContent = await readFile(path, 'utf-8');
        csvPath = path;
        break;
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    let marketData: Record<string, number> = {};
    let skillCombinations: Record<string, string[]> = {};
    
    if (csvContent) {
      const lines = csvContent.split('\n').slice(1); // Skip header
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const [skill, countStr] = line.split(',');
        if (skill && countStr) {
          const count = parseInt(countStr.trim(), 10);
          if (!isNaN(count)) {
            const normalizedSkill = skill.trim().toLowerCase();
            marketData[normalizedSkill] = (marketData[normalizedSkill] || 0) + count;
          }
        }
      }
    } else {
      console.warn('Could not load CSV from any path, using fallback data');
      // Fallback to basic data if CSV not available
      marketData = {
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
    }
    
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

