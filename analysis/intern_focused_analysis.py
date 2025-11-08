#!/usr/bin/env python3
"""
BDPA SkillGap - Intern-Focused Analysis
Filters and analyzes skills data for 7 target intern industries only
"""

import pandas as pd
import numpy as np
from collections import Counter
import json
import os

# Define skill mapping for 7 target intern industries
INTERN_SKILL_MAPPING = {
    'AI/ML': [
        'python', 'machine learning', 'statistics', 'pandas', 'numpy', 
        'jupyter', 'data visualization', 'scikit-learn', 'sql',
        'tensorflow', 'pytorch', 'matplotlib', 'seaborn', 'keras',
        'data science', 'deep learning', 'neural networks', 'algorithms'
    ],
    'Data': [
        'excel', 'sql', 'data visualization', 'statistics', 'python',
        'tableau', 'power bi', 'data cleaning', 'analytics', 'powerpoint',
        'data analysis', 'business intelligence', 'reporting', 'dashboard',
        'pivot tables', 'vlookup', 'charts', 'graphs'
    ],
    'Backend': [
        'python', 'rest api', 'sql', 'git', 'databases', 'linux',
        'unit testing', 'cloud', 'java', 'node.js', 'express',
        'postgresql', 'mysql', 'mongodb', 'api development', 'flask',
        'django', 'fastapi', 'microservices', 'json', 'postman'
    ],
    'Frontend': [
        'html', 'css', 'javascript', 'react', 'responsive design', 'git',
        'typescript', 'figma', 'ui/ux', 'bootstrap', 'sass', 'webpack',
        'npm', 'redux', 'vue.js', 'angular', 'jquery', 'flexbox', 'grid'
    ],
    'DevOps': [
        'linux', 'git', 'docker', 'cloud', 'bash', 'ci/cd', 'monitoring',
        'python', 'aws', 'azure', 'kubernetes', 'terraform', 'jenkins',
        'ansible', 'shell scripting', 'infrastructure', 'automation',
        'deployment', 'networking'
    ],
    'Robotics': [
        'python', 'c++', 'mathematics', 'ros', 'embedded systems', 'sensors',
        'control systems', 'matlab', 'simulink', 'computer vision', 'opencv',
        'arduino', 'raspberry pi', 'mechanics', 'electronics', 'physics',
        'signal processing', 'kalman filter'
    ],
    'Game Dev': [
        'c#', 'unity', 'game design', 'object-oriented programming', '3d modeling',
        'version control', 'scripting', 'problem solving', 'unreal engine',
        'blender', 'maya', 'photoshop', 'game physics', 'animation',
        'level design', 'shader programming', 'mobile development'
    ]
}

# Skill normalization mapping
SKILL_ALIASES = {
    'python': ['python', 'py', 'python programming', 'python scripting'],
    'javascript': ['javascript', 'js', 'ecmascript', 'node.js', 'nodejs'],
    'sql': ['sql', 'mysql', 'postgresql', 'database', 'databases'],
    'machine learning': ['machine learning', 'ml', 'artificial intelligence', 'ai'],
    'git': ['git', 'github', 'gitlab', 'version control', 'source control'],
    'docker': ['docker', 'containerization', 'containers'],
    'react': ['react', 'react.js', 'reactjs'],
    'html': ['html', 'html5', 'markup'],
    'css': ['css', 'css3', 'styling', 'stylesheets'],
    'c++': ['c++', 'cpp', 'c plus plus'],
    'unity': ['unity', 'unity3d', 'unity engine'],
    'excel': ['excel', 'microsoft excel', 'spreadsheet', 'xlsx']
}

def normalize_skill(skill):
    """Normalize skill names using alias mapping"""
    skill_lower = skill.lower().strip()
    for canonical, aliases in SKILL_ALIASES.items():
        if skill_lower in [alias.lower() for alias in aliases]:
            return canonical
    return skill_lower

def load_skills_data():
    """Load and combine all available skills datasets"""
    data_dir = "../Kaggle Datasets/ML_Ready/"
    
    # Try to load available CSV files that have skills data
    try:
        # Load top 100 skills from previous analysis
        top_skills = pd.read_csv("results/top_100_skills.csv")
        print(f"Loaded {len(top_skills)} skills from top_100_skills.csv")
        return top_skills
    except Exception as e:
        print(f"Error loading skills data: {e}")
        return None

def filter_intern_relevant_skills(skills_df):
    """Filter skills to only those relevant to 7 target intern industries"""
    if skills_df is None:
        return {}
    
    # Get all relevant skills for interns
    all_intern_skills = set()
    for industry_skills in INTERN_SKILL_MAPPING.values():
        all_intern_skills.update([normalize_skill(skill) for skill in industry_skills])
    
    # Filter and categorize skills
    intern_relevant = {}
    
    for industry, skill_list in INTERN_SKILL_MAPPING.items():
        intern_relevant[industry] = {}
        normalized_skills = [normalize_skill(skill) for skill in skill_list]
        
        for skill in normalized_skills:
            # Find matching skills in dataset (case insensitive partial match)
            matches = skills_df[skills_df['skill'].str.lower().str.contains(skill, na=False)]
            if not matches.empty:
                total_count = matches['count'].sum()
                intern_relevant[industry][skill] = total_count
            else:
                # If no match found, mark as 0 but keep for learning resources
                intern_relevant[industry][skill] = 0
    
    return intern_relevant

def calculate_industry_demand_scores(filtered_skills):
    """Calculate demand scores for each industry based on skill frequency"""
    industry_scores = {}
    
    for industry, skills in filtered_skills.items():
        total_demand = sum(skills.values())
        skill_count = len([s for s in skills.values() if s > 0])
        
        # Calculate metrics
        avg_demand = total_demand / len(skills) if skills else 0
        coverage_ratio = skill_count / len(skills) if skills else 0
        
        industry_scores[industry] = {
            'total_demand': total_demand,
            'avg_demand_per_skill': round(avg_demand, 2),
            'skills_with_data': skill_count,
            'total_skills': len(skills),
            'data_coverage': round(coverage_ratio * 100, 1),
            'top_skills': sorted(skills.items(), key=lambda x: x[1], reverse=True)[:5]
        }
    
    return industry_scores

def generate_learning_recommendations(filtered_skills):
    """Generate learning path recommendations based on skill demand"""
    recommendations = {}
    
    for industry, skills in filtered_skills.items():
        # Sort skills by demand (high to low)
        sorted_skills = sorted(skills.items(), key=lambda x: x[1], reverse=True)
        
        # Categorize skills
        high_priority = [(s, c) for s, c in sorted_skills if c > 10000]  # Very high demand
        medium_priority = [(s, c) for s, c in sorted_skills if 1000 <= c <= 10000]  # Medium demand
        foundation = [(s, c) for s, c in sorted_skills if c > 0]  # Any demand in market
        
        recommendations[industry] = {
            'high_priority_skills': high_priority[:3],  # Top 3 highest demand
            'medium_priority_skills': medium_priority[:5],  # Next 5
            'foundation_skills': [s for s, c in foundation if s not in [x[0] for x in high_priority + medium_priority]][:3],
            'learning_path_order': [s for s, c in sorted_skills[:8] if c > 0]  # Top 8 with demand data
        }
    
    return recommendations

def create_intern_skill_matrix():
    """Create a matrix showing skill overlap across industries"""
    all_skills = set()
    for skills in INTERN_SKILL_MAPPING.values():
        all_skills.update([normalize_skill(s) for s in skills])
    
    matrix = {}
    for skill in all_skills:
        matrix[skill] = {}
        for industry, industry_skills in INTERN_SKILL_MAPPING.items():
            normalized_industry_skills = [normalize_skill(s) for s in industry_skills]
            matrix[skill][industry] = skill in normalized_industry_skills
    
    return matrix

def main():
    print("🎯 BDPA SkillGap - Intern-Focused Analysis")
    print("=" * 50)
    
    # Load skills data
    print("\n📊 Loading skills data...")
    skills_data = load_skills_data()
    
    # Filter for intern-relevant skills
    print("🔍 Filtering for intern-relevant skills...")
    intern_skills = filter_intern_relevant_skills(skills_data)
    
    # Calculate demand scores
    print("📈 Calculating industry demand scores...")
    demand_scores = calculate_industry_demand_scores(intern_skills)
    
    # Generate recommendations
    print("💡 Generating learning recommendations...")
    recommendations = generate_learning_recommendations(intern_skills)
    
    # Create skill overlap matrix
    print("🔗 Creating skill overlap matrix...")
    skill_matrix = create_intern_skill_matrix()
    
    # Output results
    print("\n" + "="*50)
    print("📋 ANALYSIS RESULTS")
    print("="*50)
    
    # Industry Rankings by Total Demand
    print("\n🏆 INDUSTRY RANKINGS BY SKILL DEMAND:")
    industry_ranking = sorted(demand_scores.items(), 
                            key=lambda x: x[1]['total_demand'], 
                            reverse=True)
    
    for i, (industry, scores) in enumerate(industry_ranking, 1):
        print(f"{i}. {industry}: {scores['total_demand']:,} total mentions")
        print(f"   📊 Avg per skill: {scores['avg_demand_per_skill']:,}")
        print(f"   📈 Data coverage: {scores['data_coverage']}%")
        top_3 = [f"{skill}({count:,})" for skill, count in scores['top_skills'][:3] if count > 0]
        if top_3:
            print(f"   🔥 Top skills: {', '.join(top_3)}")
        print()
    
    # Skill Overlap Analysis
    print("\n🔗 SKILL OVERLAP ANALYSIS:")
    versatile_skills = {}
    for skill, industries in skill_matrix.items():
        count = sum(industries.values())
        if count > 1:  # Skills used in multiple industries
            versatile_skills[skill] = count
    
    top_versatile = sorted(versatile_skills.items(), key=lambda x: x[1], reverse=True)[:10]
    print("Most versatile skills (used across multiple industries):")
    for skill, count in top_versatile:
        industries = [ind for ind, used in skill_matrix[skill].items() if used]
        print(f"  • {skill}: {count} industries → {', '.join(industries)}")
    
    # Save detailed results
    os.makedirs("results/intern_analysis", exist_ok=True)
    
    # Convert numpy types to native Python types for JSON serialization
    intern_skills_json = {}
    for industry, skills in intern_skills.items():
        intern_skills_json[industry] = {k: int(v) if isinstance(v, np.integer) else v for k, v in skills.items()}
    
    # Save filtered skills data
    with open("results/intern_analysis/intern_skills_by_industry.json", "w") as f:
        json.dump(intern_skills_json, f, indent=2)
    
    # Save demand scores
    with open("results/intern_analysis/industry_demand_scores.json", "w") as f:
        json.dump(demand_scores, f, indent=2)
    
    # Save learning recommendations
    with open("results/intern_analysis/learning_recommendations.json", "w") as f:
        json.dump(recommendations, f, indent=2)
    
    # Save skill matrix
    with open("results/intern_analysis/skill_overlap_matrix.json", "w") as f:
        json.dump(skill_matrix, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: results/intern_analysis/")
    print("\nFiles created:")
    print("  • intern_skills_by_industry.json - Skills demand by industry")
    print("  • industry_demand_scores.json - Industry analysis metrics")
    print("  • learning_recommendations.json - Personalized learning paths")
    print("  • skill_overlap_matrix.json - Cross-industry skill matrix")

if __name__ == "__main__":
    main()