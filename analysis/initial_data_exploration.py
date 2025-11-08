"""
Initial Data Exploration for BDPA Tech Job Market Analysis
This script provides a comprehensive overview of all cleaned datasets
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set up plotting style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

# Define dataset paths
DATA_DIR = Path("Kaggle Datasets/ML_Ready")
RESULTS_DIR = Path("analysis/results")
VIZ_DIR = Path("analysis/visualizations")

# Ensure output directories exist
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
VIZ_DIR.mkdir(parents=True, exist_ok=True)

def load_datasets():
    """Load all cleaned datasets"""
    print("=" * 80)
    print("LOADING DATASETS")
    print("=" * 80)

    datasets = {}

    # Load each dataset
    try:
        datasets['job_postings'] = pd.read_csv(DATA_DIR / "tech_job_postings_clean.csv")
        print(f"✓ Loaded tech_job_postings_clean.csv: {len(datasets['job_postings']):,} rows")
    except Exception as e:
        print(f"✗ Error loading job_postings: {e}")

    try:
        datasets['job_skills'] = pd.read_csv(DATA_DIR / "tech_job_skills_clean.csv")
        print(f"✓ Loaded tech_job_skills_clean.csv: {len(datasets['job_skills']):,} rows")
    except Exception as e:
        print(f"✗ Error loading job_skills: {e}")

    try:
        datasets['it_jobs'] = pd.read_csv(DATA_DIR / "it_jobs_clean.csv")
        print(f"✓ Loaded it_jobs_clean.csv: {len(datasets['it_jobs']):,} rows")
    except Exception as e:
        print(f"✗ Error loading it_jobs: {e}")

    try:
        datasets['linkedin_postings'] = pd.read_csv(DATA_DIR / "tech_linkedin_postings_clean.csv")
        print(f"✓ Loaded tech_linkedin_postings_clean.csv: {len(datasets['linkedin_postings']):,} rows")
    except Exception as e:
        print(f"✗ Error loading linkedin_postings: {e}")

    try:
        datasets['layoffs'] = pd.read_csv(DATA_DIR / "tech_layoffs_clean.csv")
        print(f"✓ Loaded tech_layoffs_clean.csv: {len(datasets['layoffs']):,} rows")
    except Exception as e:
        print(f"✗ Error loading layoffs: {e}")

    try:
        datasets['layoff_trends'] = pd.read_csv(DATA_DIR / "layoff_trends_30y_clean.csv")
        print(f"✓ Loaded layoff_trends_30y_clean.csv: {len(datasets['layoff_trends']):,} rows")
    except Exception as e:
        print(f"✗ Error loading layoff_trends: {e}")

    try:
        datasets['dice_jobs'] = pd.read_csv(DATA_DIR / "dice_jobs_clean.csv")
        print(f"✓ Loaded dice_jobs_clean.csv: {len(datasets['dice_jobs']):,} rows")
    except Exception as e:
        print(f"✗ Error loading dice_jobs: {e}")

    try:
        datasets['unified_jobs'] = pd.read_csv(DATA_DIR / "tech_jobs_unified.csv")
        print(f"✓ Loaded tech_jobs_unified.csv: {len(datasets['unified_jobs']):,} rows")
    except Exception as e:
        print(f"✗ Error loading unified_jobs: {e}")

    print(f"\nTotal datasets loaded: {len(datasets)}")
    return datasets


def explore_dataset_structure(datasets):
    """Explore the structure of each dataset"""
    print("\n" + "=" * 80)
    print("DATASET STRUCTURES")
    print("=" * 80)

    for name, df in datasets.items():
        print(f"\n{name.upper()}")
        print("-" * 80)
        print(f"Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
        print(f"\nColumns:")
        for col in df.columns:
            dtype = df[col].dtype
            non_null = df[col].notna().sum()
            null_pct = (df[col].isna().sum() / len(df)) * 100
            print(f"  • {col:40s} | {str(dtype):15s} | {non_null:,} non-null ({null_pct:.1f}% missing)")


def analyze_job_postings(df):
    """Analyze job postings data"""
    print("\n" + "=" * 80)
    print("JOB POSTINGS ANALYSIS")
    print("=" * 80)

    # Salary analysis
    if 'normalized_salary' in df.columns:
        print("\n--- SALARY STATISTICS ---")
        salary_stats = df['normalized_salary'].describe()
        print(salary_stats)

        # Salary by experience level
        if 'formatted_experience_level' in df.columns:
            print("\n--- MEDIAN SALARY BY EXPERIENCE LEVEL ---")
            salary_by_exp = df.groupby('formatted_experience_level')['normalized_salary'].agg([
                'count', 'median', 'mean'
            ]).sort_values('median', ascending=False)
            print(salary_by_exp)

    # Remote work analysis
    if 'remote_allowed' in df.columns:
        print("\n--- REMOTE WORK DISTRIBUTION ---")
        remote_dist = df['remote_allowed'].value_counts()
        print(remote_dist)
        print(f"\nRemote allowed percentage: {(remote_dist.get(True, 0) / len(df)) * 100:.1f}%")

    # Top locations
    if 'location' in df.columns:
        print("\n--- TOP 15 JOB LOCATIONS ---")
        top_locations = df['location'].value_counts().head(15)
        print(top_locations)

    # Posting trends by month
    if 'posted_year' in df.columns and 'posted_month' in df.columns:
        print("\n--- POSTINGS BY MONTH (2024) ---")
        monthly_posts = df[df['posted_year'] == 2024].groupby('posted_month').size().sort_index()
        print(monthly_posts)

    # Work type distribution
    if 'formatted_work_type' in df.columns:
        print("\n--- WORK TYPE DISTRIBUTION ---")
        work_type_dist = df['formatted_work_type'].value_counts()
        print(work_type_dist)


def analyze_skills(df):
    """Analyze skills data"""
    print("\n" + "=" * 80)
    print("SKILLS ANALYSIS")
    print("=" * 80)

    # Parse skills from the job_skills column
    all_skills = []

    if 'job_skills' in df.columns:
        print(f"\nTotal job postings with skills: {len(df):,}")

        # Extract individual skills
        for skills_str in df['job_skills'].dropna():
            if isinstance(skills_str, str):
                skills = [s.strip() for s in skills_str.split(',')]
                all_skills.extend(skills)

        print(f"Total skill mentions: {len(all_skills):,}")
        print(f"Unique skills: {len(set(all_skills)):,}")

        # Top skills
        from collections import Counter
        skill_counts = Counter(all_skills)

        print("\n--- TOP 30 MOST DEMANDED SKILLS ---")
        for i, (skill, count) in enumerate(skill_counts.most_common(30), 1):
            print(f"{i:2d}. {skill:50s} - {count:,} mentions")

        # Save top skills to file
        top_skills_df = pd.DataFrame(skill_counts.most_common(100), columns=['skill', 'count'])
        top_skills_df.to_csv(RESULTS_DIR / "top_100_skills.csv", index=False)
        print(f"\n✓ Saved top 100 skills to {RESULTS_DIR / 'top_100_skills.csv'}")

        return skill_counts

    return None


def analyze_layoffs(df):
    """Analyze layoffs data"""
    print("\n" + "=" * 80)
    print("LAYOFFS ANALYSIS")
    print("=" * 80)

    print(f"\nTotal layoff events: {len(df):,}")

    if 'total_layoffs' in df.columns:
        total_affected = df['total_layoffs'].sum()
        print(f"Total employees laid off: {total_affected:,.0f}")

    # By year
    if 'year' in df.columns:
        print("\n--- LAYOFFS BY YEAR ---")
        yearly_layoffs = df.groupby('year').agg({
            'total_layoffs': 'sum',
            'company': 'count'
        }).rename(columns={'company': 'num_events'})
        print(yearly_layoffs)

    # By industry
    if 'industry' in df.columns:
        print("\n--- TOP 10 INDUSTRIES BY LAYOFFS ---")
        industry_layoffs = df.groupby('industry')['total_layoffs'].sum().sort_values(ascending=False).head(10)
        print(industry_layoffs)

    # Top companies with layoffs
    if 'company' in df.columns and 'total_layoffs' in df.columns:
        print("\n--- TOP 15 COMPANIES BY TOTAL LAYOFFS ---")
        company_layoffs = df.groupby('company')['total_layoffs'].sum().sort_values(ascending=False).head(15)
        print(company_layoffs)


def create_visualizations(datasets, skill_counts=None):
    """Create initial visualizations"""
    print("\n" + "=" * 80)
    print("CREATING VISUALIZATIONS")
    print("=" * 80)

    # 1. Salary distribution
    if 'job_postings' in datasets and 'normalized_salary' in datasets['job_postings'].columns:
        plt.figure(figsize=(12, 6))
        salary_data = datasets['job_postings']['normalized_salary'].dropna()
        salary_data = salary_data[(salary_data > 0) & (salary_data < 500000)]  # Filter outliers

        plt.hist(salary_data, bins=50, edgecolor='black', alpha=0.7)
        plt.xlabel('Salary (USD)')
        plt.ylabel('Frequency')
        plt.title('Salary Distribution for Tech Jobs')
        plt.axvline(salary_data.median(), color='red', linestyle='--', label=f'Median: ${salary_data.median():,.0f}')
        plt.legend()
        plt.tight_layout()
        plt.savefig(VIZ_DIR / 'salary_distribution.png', dpi=300, bbox_inches='tight')
        print(f"✓ Saved salary_distribution.png")
        plt.close()

    # 2. Top skills bar chart
    if skill_counts:
        plt.figure(figsize=(14, 8))
        top_20_skills = dict(sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:20])

        skills = list(top_20_skills.keys())
        counts = list(top_20_skills.values())

        plt.barh(range(len(skills)), counts, color='steelblue')
        plt.yticks(range(len(skills)), skills)
        plt.xlabel('Number of Mentions')
        plt.title('Top 20 Most In-Demand Skills')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        plt.savefig(VIZ_DIR / 'top_20_skills.png', dpi=300, bbox_inches='tight')
        print(f"✓ Saved top_20_skills.png")
        plt.close()

    # 3. Layoffs by year
    if 'layoffs' in datasets and 'year' in datasets['layoffs'].columns:
        plt.figure(figsize=(12, 6))
        yearly_data = datasets['layoffs'].groupby('year')['total_layoffs'].sum().sort_index()

        plt.plot(yearly_data.index, yearly_data.values, marker='o', linewidth=2, markersize=8)
        plt.xlabel('Year')
        plt.ylabel('Total Layoffs')
        plt.title('Tech Industry Layoffs Over Time')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(VIZ_DIR / 'layoffs_trend.png', dpi=300, bbox_inches='tight')
        print(f"✓ Saved layoffs_trend.png")
        plt.close()

    # 4. Remote work distribution
    if 'job_postings' in datasets and 'remote_allowed' in datasets['job_postings'].columns:
        plt.figure(figsize=(8, 8))
        remote_counts = datasets['job_postings']['remote_allowed'].value_counts()

        # Create labels based on actual data
        labels = [f"{idx}" for idx in remote_counts.index]
        plt.pie(remote_counts.values, labels=labels,
                autopct='%1.1f%%', startangle=90, colors=['#ff9999', '#66b3ff'])
        plt.title('Remote Work Distribution in Tech Jobs')
        plt.tight_layout()
        plt.savefig(VIZ_DIR / 'remote_work_distribution.png', dpi=300, bbox_inches='tight')
        print(f"✓ Saved remote_work_distribution.png")
        plt.close()


def generate_summary_report(datasets):
    """Generate a comprehensive summary report"""
    print("\n" + "=" * 80)
    print("GENERATING SUMMARY REPORT")
    print("=" * 80)

    report = []
    report.append("=" * 80)
    report.append("BDPA TECH JOB MARKET - INITIAL DATA EXPLORATION SUMMARY")
    report.append("=" * 80)
    report.append(f"\nReport Generated: {pd.Timestamp.now()}")

    report.append("\n\n--- DATASETS OVERVIEW ---")
    total_rows = sum(len(df) for df in datasets.values())
    report.append(f"Total datasets: {len(datasets)}")
    report.append(f"Total records: {total_rows:,}")

    for name, df in datasets.items():
        report.append(f"\n{name}: {len(df):,} rows × {df.shape[1]} columns")

    # Key findings
    report.append("\n\n--- KEY FINDINGS ---")

    if 'job_postings' in datasets:
        df = datasets['job_postings']
        if 'normalized_salary' in df.columns:
            median_salary = df['normalized_salary'].median()
            report.append(f"\nMedian Tech Salary: ${median_salary:,.0f}")

        if 'remote_allowed' in df.columns:
            remote_pct = (df['remote_allowed'].sum() / len(df)) * 100
            report.append(f"Remote Work Available: {remote_pct:.1f}% of jobs")

    if 'layoffs' in datasets:
        df = datasets['layoffs']
        total_layoffs = df['total_layoffs'].sum()
        report.append(f"\nTotal Layoffs Tracked: {total_layoffs:,.0f} employees")

    report_text = "\n".join(report)

    # Save report
    with open(RESULTS_DIR / 'summary_report.txt', 'w') as f:
        f.write(report_text)

    print(report_text)
    print(f"\n✓ Saved summary report to {RESULTS_DIR / 'summary_report.txt'}")


def main():
    """Main execution function"""
    print("\n" + "=" * 80)
    print("BDPA TECH JOB MARKET - INITIAL DATA EXPLORATION")
    print("=" * 80)

    # Load datasets
    datasets = load_datasets()

    if not datasets:
        print("No datasets loaded. Exiting.")
        return

    # Explore structures
    explore_dataset_structure(datasets)

    # Analyze specific datasets
    if 'job_postings' in datasets:
        analyze_job_postings(datasets['job_postings'])

    if 'job_skills' in datasets:
        skill_counts = analyze_skills(datasets['job_skills'])
    else:
        skill_counts = None

    if 'layoffs' in datasets:
        analyze_layoffs(datasets['layoffs'])

    # Create visualizations
    create_visualizations(datasets, skill_counts)

    # Generate summary report
    generate_summary_report(datasets)

    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print(f"\nResults saved to: {RESULTS_DIR}")
    print(f"Visualizations saved to: {VIZ_DIR}")


if __name__ == "__main__":
    main()
