# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Career-Navigator AI** (MVP for BDPA Indianapolis Hackathon)

A real-time, AI-powered career guidance platform that helps students and early-career professionals navigate the tech job market using live labor market data, interactive visualizations, and personalized roadmaps.

### Hackathon Challenge
"Elevating Career Development with AI" - Harness AI to guide career journeys, close skills gaps, and redefine growth in the digital age.

## Core Problem Statement

Addressing how to guide students to become industry-ready in the fast-evolving tech job market:

1. **Identify in-demand tech roles** using real labor-market data
2. **Map required skills** from historic demand and daily job-listing feeds
3. **Detect skills gaps** between user profiles and target roles
4. **Recommend personalized roadmaps** aligned with live market trends
5. **Present via interactive AI assistant** with engaging visuals, not just text

## Product Specification

### Target Users
Students and early-career professionals aiming for tech roles (internships, entry-level) who want to build the right skills aligned with industry demand.

### Value Proposition
"Get to industry-ready faster: See which tech roles are growing, find the exact skills you need, and follow a personalized roadmap — backed by live data and presented by an intelligent, interactive assistant."

### Core Features (MVP Scope)

#### Must-Have Features
1. **Onboarding/Profile Capture** - AI assistant collects current skills, education, target domain
2. **Data Pipeline**
   - Historic tech labor data (job-skills, roles, demand trends)
   - Daily ingestion of job listings from GitHub repo (Summer2026-Internships)
   - Normalize job titles, map to roles, extract required skills
3. **Role Demand & Risk Metrics** - Compute demand score and risk/decline signals per role
4. **Skills Gap Analysis** - Calculate missing skills relative to user profile
5. **Interactive Chatbot** - LLM-powered conversation presenting top 2-3 target roles with reasoning
6. **Dashboard/Visuals**
   - Heatmap: user skills vs target role requirements
   - Time-series graph: demand trend for target roles
   - Roadmap timeline: actionable learning path (12 weeks)
7. **Learning Resources** - Link to courses/tutorials/projects for missing skills

#### Nice-to-Have Features
- Real-time alert feed for skill/role surges
- Scenario analysis (Role A vs Role B comparison)
- Animated dashboard graphs with live playback
- User progress tracking (mark skills as completed)
- Exportable PDF/email summary

## Technology Stack

### Data Layer
- **Database**: PostgreSQL (roles/skills, user profiles) + optional InfluxDB (time-series trends)
- **Data Sources**:
  - `Kaggle Datasets/` - Historic datasets (dice_com jobs, IT_jobs, tech_layoffs, Layoff_Trend, Learning_Resources)
  - GitHub repo: SimplifyJobs/Summer2026-Internships (daily job listings)
- **ETL/Workflow**: n8n for automated daily data ingestion and processing
- **Processing**: Python with Pandas + Scikit-Learn for demand modeling

### Backend
- **Framework**: FastAPI (Python)
- **APIs**: REST endpoints for metrics, user profiles, recommendations
- **AI/LLM**: OpenAI GPT-4 API or open-source (Llama2) with prompt templates and retrieval

### Frontend
- **Framework**: React.js
- **Visualization**: Chart.js or D3.js for animated graphs
- **Chat UI**: Integrated chatbot widget
- **Styling**: Modern responsive design

### Infrastructure
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: AWS/GCP (containerized deployment)

## Data Assets (in Kaggle Datasets - Cleaned/)

**Status**: ✅ Cleaned and ready (332MB, 100% tech-focused)

- `postings_tech_only.csv` (254MB, 63,654 records) - Tech job postings from 2024 LinkedIn data
- `dice_com_tech_jobs.csv` (58MB, 22,000 records) - Historic tech jobs (2019) with structured skills field
- `job_skills_tech.csv` (1.6MB, 107,039 mappings) - Job-to-skill relationships
- `salaries_tech.csv` (1.0MB, 19,110 records) - Salary data for tech roles
- `tech_layoffs.csv` (41KB, 489 records) - Recent layoffs (2022-2023) for risk analysis
- `layoff_trends_30_years.csv` (3.7KB, 31 records) - 30-year trends + AI adoption curve
- `tech_industries_taxonomy.csv` (4.5KB, 143 industries) - Tech industry definitions
- Plus: IT_jobs.csv, benefits_tech.csv, job_industries_tech.csv, skills_taxonomy.csv

**Coverage**: 143 tech industries (Software, AI/ML, Cloud, Cybersecurity, Data, DevOps, etc.)
**See [DATA_GUIDE.md](DATA_GUIDE.md) for usage examples and details**

## Architecture & Data Flow

### User Journey Flow
1. User onboarding → Profile capture (skills, role, preferences)
2. System retrieves latest metrics → Chatbot engagement
3. AI recommends 2-3 target roles with data-driven reasoning
4. Dashboard loads with:
   - Skill gap heatmap
   - Demand trend graphs (12-month view)
   - Personalized roadmap timeline
5. Interactive exploration:
   - Click skills for course links, project suggestions, time estimates
   - Ask chatbot scenario questions ("If I learn DevOps first...")
   - Get responses referencing live data ("DevOps postings +40% this quarter")
6. Daily background updates:
   - New job listings fetched
   - Metrics recalculated
   - Dashboard animates on refresh
7. Optional email summary/report delivery

### Data Pipeline Architecture
```
GitHub Job Listings → n8n Workflow → Data Cleaning/Normalization
                                              ↓
Historic CSV Datasets → Role/Skill Mapping → PostgreSQL
                                              ↓
                            Demand/Risk Metric Calculation
                                              ↓
                            FastAPI Backend ← → LLM (ChatBot)
                                              ↓
                            React Frontend (Dashboard + Chat)
```

### Core Functional Modules

1. **Data Ingestion & Processing**
   - Automated n8n workflow (scheduled/cron)
   - Pulls from SimplifyJobs GitHub repo daily
   - Cleans and normalizes job titles and skills
   - Stores in PostgreSQL with time-series tracking

2. **Metrics Engine**
   - Per-role: demand score, risk score, skill requirements
   - Per-skill: trend analysis (frequency in listings vs baseline)
   - Skills gap calculator (user profile vs target role)
   - Real-time updates on new listing arrivals

3. **AI Chatbot**
   - Onboarding conversation flow
   - Profile-based recommendation generation
   - Visual presentation integration
   - Interactive Q&A with data references
   - Scenario exploration ("What if I switch to Role Y?")

4. **Visual Analytics Dashboard**
   - User profile summary
   - Skill gap heatmap
   - Role demand trend graphs (animated)
   - Risk/layoff charts
   - Learning roadmap timeline
   - Real-time alert banners

5. **Roadmap Generator**
   - Maps missing skills to learning resources
   - Generates step-by-step plan based on user timeline
   - Integrates course links from Learning_Resources_Database.csv
   - Produces actionable weekly/monthly milestones

## Demo Success Metrics

For hackathon presentation, demonstrate:

1. **Role Recommendations** - Clear reasoning with data (e.g., "Role X up +30% in last 3 months")
2. **Live Visuals** - Animated graphs showing data updates/deltas
3. **Chatbot Intelligence** - Answer 3-5 personalized questions meaningfully
4. **Actionable Output** - User leaves with 3 clear skill milestones + 1 starter project
5. **Real-time Integration** - Show live job listing ingestion → dashboard update

## Implementation Timeline

### Week 1 (Hackathon Kickoff)
- Repository scaffold: data/, backend/, frontend/
- Configure n8n workflow for daily GitHub listings pull
- Load historic datasets, build role/skill mapping
- Design onboarding UI and basic chatbot prompt
- Create stub dashboard with sample data

### Week 2 (Mid-Build)
- Develop demand/risk metrics pipeline
- Integrate LLM backend with prompt templates
- Populate learning resource links
- Build roadmap generator module
- Connect frontend to backend APIs

### Week 3 (Finalization)
- Add animated visuals to dashboard
- Implement real-time update simulation
- Refine chatbot scenario handling
- Create demo script and test flow
- Polish UI/UX and performance optimization
- Prepare presentation materials

## Key Differentiators

1. **Industry-Aligned** - Real tech market data, not generic advice
2. **Real-Time Adaptation** - Live job listing ingestion surfaces emerging trends
3. **Interactive & Engaging** - Dynamic visuals + conversational AI
4. **Personalized** - Tailored to individual skills and aspirations
5. **Actionable** - Clear roadmap with resources and timeline
6. **Student-Centric** - Bridges academic experience with industry needs

## Market Context

- Strong demand for AI/ML engineers, data engineers, cloud/network engineers, cybersecurity
- Junior/generalist roles under pressure; skills emphasized over degrees
- Rapid skill evolution (generative AI, cloud-devops, security accelerating)
- Persistent talent gap in key tech areas
- Students need real-time, data-driven guidance (not static career advice)

## Development Notes

### When Building Features
- Prioritize must-have features for working MVP demo
- Focus on data-driven insights (cite metrics in UI)
- Ensure chatbot responses reference actual data calculations
- Animate visualizations for engaging presentation
- Test real-time data pipeline thoroughly

### Data Considerations
- Handle large CSV files efficiently (chunking for dice_com dataset)
- Normalize job titles across different sources
- Map skills consistently (create skills taxonomy)
- Track temporal data for trend analysis
- Cache frequently accessed metrics

### UI/UX Principles
- Make data insights immediately visible
- Use animations to show change over time
- Ensure chatbot feels conversational and intelligent
- Provide clear calls-to-action in roadmap
- Mobile-responsive design for accessibility