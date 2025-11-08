# ML-Ready Tech Market Datasets

## Overview
This directory contains cleaned, normalized, and ML-ready CSV datasets focused on the technology job market. All datasets have been optimized for machine learning and data analysis workflows using Python libraries (pandas, scikit-learn, TensorFlow, PyTorch, etc.).

## Datasets Summary

### 1. **it_jobs_clean.csv** (227 KB | 2,500 rows)
**Description:** IT job postings with experience requirements
**Columns:**
- `job_title` (string): Job position title
- `company_name` (string): Hiring company
- `location` (string): Job location
- `experience_min_years` (float): Minimum years of experience required
- `experience_max_years` (float): Maximum years of experience required

**Data Quality:** ✅ No missing values
**Use Cases:** Experience requirement analysis, entry-level vs senior role distribution

---

### 2. **dice_jobs_clean.csv** (4.2 MB)
**Description:** Tech job postings from Dice.com
**Columns:**
- `jobid` (string): Unique job identifier
- `company` (string): Hiring company
- `jobtitle` (string): Job title
- `joblocation_address` (string): Job location
- `employmenttype_jobstatus` (string): Employment type (Full-time, Contract, etc.)
- `skills` (string): Required skills (comma-separated)
- `postdate` (datetime): Date posted
- `post_year` (int): Year posted
- `post_month` (int): Month posted

**Data Quality:** Clean text, parsed dates
**Use Cases:** Skills demand analysis, job posting trends, employment type distribution

---

### 3. **tech_layoffs_clean.csv** (44 KB | 489 rows)
**Description:** Tech company layoff events (2022-2023)
**Columns:**
- `company` (string): Company name
- `total_layoffs` (float): Number of employees laid off
- `impacted_workforce_percentage` (float): % of workforce affected
- `reported_date` (datetime): Date of layoff announcement
- `industry` (string): Tech sub-industry (Fintech, E-commerce, etc.)
- `headquarter_location` (string): Company HQ location
- `status` (string): Company status (Private/Public)
- `year` (int): Year of layoff
- `month` (int): Month of layoff

**Data Quality:** Cleaned, some missing values in layoff numbers
**Top Industries:** Fintech (24), Healthcare Tech (17), PropTech (15), E-commerce (13)
**Top Locations:** San Francisco (136), New York (77), Seattle (21)
**Use Cases:** Layoff trend analysis, industry health monitoring, geographic impact analysis

---

### 4. **layoff_trends_30y_clean.csv** (3.7 KB | 31 rows)
**Description:** 30-year historical analysis of tech layoff trends (1995-2024)
**Columns:**
- `year` (float): Year
- `layoffs` (float): Total layoffs that year
- `reason_for_layoffs` (string): Primary reason
- `industry_focus` (string): Industry focus (Technology)
- `global_event` (string): Major global event that year
- `job_sector_growthmillions` (float): Job sector growth in millions
- `ai_job_percentagepct` (float): Percentage of AI-related jobs
- `future_job_trends` (string): Predicted trends

**Key Insights:**
- AI job percentage: 0.5% (1995) → 60% (2024)
- Tracks dot-com bubble, 2008 crisis, COVID-19, recent tech corrections
**Use Cases:** Long-term trend analysis, AI impact forecasting, economic correlation studies

---

### 5. **tech_job_postings_clean.csv** (5.3 MB | 40,991 rows)
**Description:** Curated tech job postings with salary and engagement metrics
**Columns:**
- `job_id` (string): Unique identifier
- `company_name` (string): Company name
- `title` (string): Job title
- `location` (string): Job location
- `min_salary`, `max_salary`, `med_salary` (float): Salary ranges
- `pay_period` (string): Hourly/Yearly
- `currency` (string): Currency code (USD, etc.)
- `views` (int): Number of views
- `applies` (int): Number of applications
- `formatted_work_type` (string): Full-time/Contract/Part-time
- `formatted_experience_level` (string): Entry/Mid/Senior
- `remote_allowed` (int): 1 if remote, 0 otherwise
- `posted_year` (int), `posted_month` (int): Posting date
- `zip_code` (string): Location zip code

**Data Quality:** 17.6% have salary data, 15% allow remote work
**Use Cases:** Salary prediction, remote work analysis, job popularity metrics, geographic demand

---

### 6. **tech_linkedin_postings_clean.csv** (85 MB | 370,139 rows)
**Description:** Large-scale LinkedIn tech job postings
**Columns:**
- `job_link` (string): LinkedIn URL
- `job_title` (string): Job title
- `company` (string): Company name
- `job_location` (string): Location
- `search_city`, `search_country` (string): Search parameters
- `job_level` (string): Entry/Associate/Mid-Senior/Director/Executive
- `job_type` (string): Full-time/Part-time/Contract/Temporary/Internship
- `first_seen` (datetime): First observed date
- `first_seen_year` (int), `first_seen_month` (int): Parsed date

**Data Quality:** High quality, no missing values
**Job Levels:** Mid-Senior (91%), Associate (9%)
**Top Locations:** New York, Washington DC, Chicago, Houston, Boston
**Use Cases:** Large-scale job market analysis, title standardization, career progression modeling

---

### 7. **tech_job_skills_clean.csv** (185 MB | 354,953 rows)
**Description:** Skills mapping for LinkedIn tech jobs
**Columns:**
- `job_link` (string): Links to LinkedIn postings
- `job_skills` (string): Comma-separated list of required skills

**Data Quality:** Clean, comprehensive skill lists
**Use Cases:** Skills gap analysis, skill co-occurrence, skills-to-salary correlation, trending technologies

---

### 8. **tech_jobs_unified.csv** (NEW - Unified Dataset | 58,491 rows)
**Description:** Unified dataset combining all job sources with standardized schema
**Columns:**
- `job_id` (string): Unique identifier with source prefix
- `source` (string): Data source (it_jobs/dice/job_postings/linkedin)
- `job_title` (string): Standardized job title
- `company_name` (string): Company name
- `location` (string): Job location
- `experience_min_years`, `experience_max_years` (float): Experience range
- `min_salary`, `max_salary`, `med_salary` (float): Salary data
- `job_level` (string): Seniority level
- `job_type` (string): Employment type
- `remote_allowed` (int): Remote work flag
- `posted_year`, `posted_month` (int): Posting date

**Sources Breakdown:**
- Job Postings: 40,991 (70%)
- LinkedIn: 10,000 (17%)
- Dice: 5,000 (9%)
- IT Jobs: 2,500 (4%)

**Data Completeness:**
- Job Title, Location, Source: 100%
- Company Name: 99.4%
- Job Type: 87.2%
- Job Level: 71.0%
- Salary Data: 17.6%

**Use Cases:** Cross-platform analysis, comprehensive job market modeling, unified ML training data

---

## Data Processing Applied

### ✅ Cleaning Steps
1. **Column Normalization:** Snake_case naming convention
2. **Date Parsing:** All dates converted to datetime format
3. **Data Type Optimization:** Proper numeric, string, and datetime types
4. **Missing Value Handling:** Strategic imputation and flagging
5. **Text Cleaning:** Stripped whitespace, standardized formatting
6. **Experience Extraction:** Parsed ranges like "2-6 Years" into min/max floats
7. **Chunked Processing:** Large files processed in chunks to avoid memory issues

### ✅ ML Optimizations
- ✅ Consistent column naming
- ✅ Proper data types for each column
- ✅ Removed unnecessary columns
- ✅ Parsed temporal features (year, month)
- ✅ Boolean flags as integers (0/1)
- ✅ No special characters in column names
- ✅ UTF-8 encoding

---

## Quick Start - Python Examples

### Load Single Dataset
```python
import pandas as pd

# Load layoff trends
df = pd.read_csv('ML_Ready/layoff_trends_30y_clean.csv')
print(df.head())
```

### Load Unified Jobs Dataset
```python
import pandas as pd

# Load all tech jobs
jobs = pd.read_csv('ML_Ready/tech_jobs_unified.csv')

# Filter by source
linkedin_jobs = jobs[jobs['source'] == 'linkedin']
dice_jobs = jobs[jobs['source'] == 'dice']

# Filter by criteria
remote_jobs = jobs[jobs['remote_allowed'] == 1]
senior_jobs = jobs[jobs['job_level'].str.contains('Senior', na=False)]
```

### Salary Analysis
```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('ML_Ready/tech_job_postings_clean.csv')

# Average salary by job type
salary_by_type = df.groupby('formatted_work_type')['med_salary'].mean()
print(salary_by_type)

# Plot salary distribution
df['med_salary'].hist(bins=50)
plt.xlabel('Median Salary')
plt.ylabel('Frequency')
plt.show()
```

### Skills Analysis
```python
import pandas as pd
from collections import Counter

df = pd.read_csv('ML_Ready/tech_job_skills_clean.csv')

# Extract all skills
all_skills = []
for skills in df['job_skills'].dropna():
    all_skills.extend([s.strip() for s in skills.split(',')])

# Top 10 most demanded skills
top_skills = Counter(all_skills).most_common(10)
print(top_skills)
```

### Time Series Analysis
```python
import pandas as pd

df = pd.read_csv('ML_Ready/tech_layoffs_clean.csv')
df['reported_date'] = pd.to_datetime(df['reported_date'])

# Monthly layoff trend
monthly = df.groupby(df['reported_date'].dt.to_period('M')).agg({
    'total_layoffs': 'sum',
    'company': 'count'
})
print(monthly)
```

### ML Model Training Example
```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Load data
df = pd.read_csv('ML_Ready/tech_jobs_unified.csv')

# Prepare features
df = df.dropna(subset=['med_salary', 'job_level', 'job_type'])

# Encode categorical variables
le_level = LabelEncoder()
le_type = LabelEncoder()
df['job_level_encoded'] = le_level.fit_transform(df['job_level'])
df['job_type_encoded'] = le_type.fit_transform(df['job_type'])

# Features and target
X = df[['job_level_encoded', 'job_type_encoded', 'remote_allowed']]
y = df['med_salary']

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

print(f"Model R² Score: {model.score(X_test, y_test):.3f}")
```

---

## Recommended Libraries

### Data Processing
- `pandas` - Data manipulation
- `numpy` - Numerical operations
- `datetime` - Date handling

### Visualization
- `matplotlib` - Basic plotting
- `seaborn` - Statistical visualization
- `plotly` - Interactive charts

### Machine Learning
- `scikit-learn` - Classical ML algorithms
- `xgboost` - Gradient boosting
- `tensorflow` / `pytorch` - Deep learning

### NLP (for job descriptions/skills)
- `nltk` - Natural language toolkit
- `spacy` - Advanced NLP
- `transformers` - BERT/GPT models

---

## Dataset Statistics

| Dataset | Rows | Size | Completeness | Time Range |
|---------|------|------|--------------|------------|
| IT Jobs | 2,500 | 227 KB | 100% | N/A |
| Dice Jobs | ~47K | 4.2 MB | 95%+ | 2019 |
| Tech Layoffs | 489 | 44 KB | 85% | 2022-2023 |
| Layoff Trends | 31 | 3.7 KB | 100% | 1995-2024 |
| Job Postings | 40,991 | 5.3 MB | 80%+ | 2023-2024 |
| LinkedIn | 370,139 | 85 MB | 100% | 2024 |
| Job Skills | 354,953 | 185 MB | 100% | 2024 |
| **Unified** | **58,491** | **~15 MB** | **87%** | **2019-2024** |

---

## Use Case Ideas

### 📊 Market Analysis
- Tech job demand trends over time
- Geographic hotspots for tech hiring
- Layoff correlations with economic indicators
- AI's impact on job market (30-year view)

### 💰 Salary Modeling
- Predict salaries based on title, location, experience
- Salary gap analysis across demographics
- Remote vs on-site compensation differences

### 🎯 Skills Intelligence
- Most in-demand technical skills
- Skills gap identification
- Emerging vs declining technologies
- Skill combinations that maximize salary

### 🏢 Company Intelligence
- Companies with most layoffs vs hiring
- Industry health indicators
- Startup vs enterprise hiring patterns

### 🔮 Predictive Analytics
- Layoff risk prediction by industry
- Future job demand forecasting
- Career path optimization

---

## Notes

- All datasets use UTF-8 encoding
- Missing values are either NaN (numeric) or empty string (text)
- Dates are in ISO format (YYYY-MM-DD)
- Salaries are in original currency (mostly USD)
- Large files (>100MB) may require chunked reading

---

## Contact & Attribution

**Project:** BDPA Tech Market Analysis
**Location:** `/Users/rao305/Documents/School/Hackathons/BDPA/Kaggle Datasets/ML_Ready/`
**Last Updated:** November 5, 2025

---

**Ready for ML/AI Analysis! 🚀**
