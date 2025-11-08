# SkillSharp - AI-Powered Skills Gap Analysis Platform

> **Sharpen Your Skills. Advance Your Career.** A comprehensive web application that analyzes your resume against job descriptions, discovers skill gaps, and provides personalized learning roadmaps with interactive SQL challenges and AI mentorship.

## 🚀 Quick Start

### Authentication

**For now, please use the hard login credentials:**
- **Username/Email**: `rao305@purdue.edu`
- **Password**: `demo11`

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or use demo mode)

### Installation & Setup

1. **Clone and Install**
   ```bash
   cd frontend/bdpafrontend-main
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the `frontend/bdpafrontend-main` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**
   ```bash
   cd frontend/bdpafrontend-main
   npm run dev
   ```

4. **Access the Application**
   - **Homepage**: http://localhost:3000
   - **Auth**: http://localhost:3000/auth (use hard login credentials above)
   - **Admin Setup**: http://localhost:3000/admin/seed

## 📋 Features Overview

### 1. **Skills Analysis & Resume Parsing**
- Upload PDF resume with automatic text extraction
- Manual skills entry with autocomplete
- Coursework and experience tracking
- Target industry selection

### 2. **Job Description Analysis**
- Select from predefined role templates (ML Engineer, Data Scientist, Full-Stack SWE, DevOps, etc.)
- Paste any job description for analysis
- Real-time multi-dimensional scoring
- Market demand analysis for missing skills

### 3. **Comprehensive Scoring System**
The platform uses a sophisticated rule-based scoring algorithm across 6 dimensions:

- **Overall Score** (Weighted): Combined score from all dimensions
- **Alignment** (35%): Semantic similarity between resume and job description using TF-IDF vectorization
- **Readiness** (25%): Percentage of required skills that you possess
- **Impact** (15%): Quantified achievements and project experience
- **Potential** (10%): Growth trajectory based on skills and coursework
- **ATS** (15%): Resume formatting and keyword optimization quality
- **Polish**: Professional presentation and completeness

### 4. **Interactive Dashboard with Analytics**

The dashboard provides comprehensive metrics and visualizations:

#### KPI Cards
- **Average Overall Score**: Mean score across all analyses
- **Total Analyses**: Number of job analyses performed
- **Average Alignment**: Mean alignment score
- **Average Readiness**: Mean readiness percentage

#### Interactive Charts

1. **Score Trend Over Time (Line Chart)**
   - Shows how your overall score changes across multiple analyses
   - X-axis: Analysis date
   - Y-axis: Overall score (0-100)
   - Helps track improvement over time

2. **Subscore Radar Chart**
   - Visualizes all 6 scoring dimensions in a radar/spider chart
   - Each axis represents: Alignment, Readiness, Impact, Potential, ATS, Polish
   - Shows strengths and weaknesses at a glance

3. **Readiness Distribution (Histogram)**
   - Bar chart showing distribution of readiness scores
   - X-axis: Readiness percentage ranges (0-20%, 20-40%, etc.)
   - Y-axis: Number of analyses in each range
   - Helps identify consistency in skill coverage

4. **Hot Skills Over Time (Line Chart)**
   - Tracks which skills are most in-demand across your analyses
   - Shows market trends for missing skills
   - Multiple lines for different skills
   - Helps prioritize learning based on market demand

5. **Top Missing Skills (Bar Chart)**
   - Horizontal bar chart of most frequently missing skills
   - Sorted by frequency and market demand
   - Shows which skills appear most often in job descriptions you're targeting

6. **Role Coverage (Pie Chart)**
   - Shows distribution of analyses by role type
   - Helps identify which roles you analyze most
   - Visual representation of your career focus areas

#### Dashboard Filters
- **Role Filter**: Filter analyses by specific role (All, ML Engineer, Data Scientist, etc.)
- **Date Filter**: Filter by time period (All Time, Last 7 Days, Last 30 Days, Last 90 Days)
- **Clickable Table**: Click any analysis row to view detailed results

### 5. **Learning Hub**

The Learning Hub is your personalized learning center with multiple features:

#### 14-Day Learning Plan
- Auto-generated personalized learning roadmap
- Tasks organized by day with checkboxes
- Based on your skill gaps and target roles
- Progress tracking (In Progress, Completed)

#### Saved Resources
- Curated learning resources from all your analyses
- Links to tutorials, courses, and documentation
- Organized by skill category
- Easy access to recommended materials

#### SQL Learning Hub with AI Mentor

A comprehensive SQL learning platform with interactive challenges:

**5 Progressive Levels:**
1. **Foundations** (Level 1): SELECT, WHERE, ORDER BY, filtering, NULL handling
2. **Intermediate** (Level 2): JOINs, GROUP BY, HAVING, aggregate functions
3. **Advanced** (Level 3): CTEs, Window Functions, subqueries, CASE statements
4. **Real-world Scenarios** (Level 4): Dashboards, transactions, complex queries
5. **Capstone Project** (Level 5): End-to-end analytics systems

**Each Challenge Includes:**
- **Industry Context**: Real-world business scenarios explaining why the skill matters
- **Business Value**: How the query helps organizations make decisions
- **Sample Data**: Actual table data to work with
- **Database Schema**: Complete table structures
- **Expected Output**: What the result should look like
- **Learning Resources**: YouTube tutorials and articles for each concept
- **Progressive Hints**: Multiple levels of hints without giving away solutions

**AI Mentor Chatbot:**
- **Trigger Words**: Ask for "help", "hint", "explain the problem", "guide me"
- **Context-Aware Responses**: AI understands your current challenge and provides relevant assistance
- **Query Analysis**: Get explanations for your SQL queries
- **Step-by-Step Guidance**: Walkthroughs for complex problems
- **Markdown Support**: Formatted responses with code blocks and lists

**Interactive Features:**
- **Query Editor**: Write and test SQL queries
- **Validate Solution**: Check if your query is correct
- **Explain Query**: Get line-by-line explanations
- **Debug**: Find syntax and logical errors
- **Get Hint**: Progressive hints that don't reveal the solution

### 6. **Market Analysis Engine**

The platform includes a sophisticated market analysis engine that:

- **Prioritizes Skills**: Ranks missing skills by market demand and job requirement level
- **Industry Context**: Provides real-world explanations for why each skill matters
- **Business Value**: Explains how skills help organizations
- **Personalized Explanations**: Tailored recommendations based on your existing skills
- **Market Demand Data**: Shows number of job opportunities for each skill

### 7. **Results & Recommendations**

After each analysis, you receive:

- **Detailed Scores**: Breakdown of all 6 scoring dimensions
- **Strengths**: What you're doing well
- **Areas to Improve**: Specific gaps identified
- **Prioritized Missing Skills**: 
  - Required skills (must-have)
  - Preferred skills (nice-to-have)
  - Market demand numbers for each
- **Learning Resources**: 1-2 curated resources per missing skill
- **Learning Path Recommendation**: Suggested order for learning new skills

## 🏗 Technical Architecture

### Tech Stack

- **Frontend Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **Charts & Analytics**: Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Core Algorithms

1. **TF-IDF Vectorization**
   - Converts resume and job description text into numerical vectors
   - Identifies important keywords and phrases
   - Used for semantic similarity calculation

2. **Cosine Similarity**
   - Measures alignment between resume and job description
   - Returns score between 0-1
   - Accounts for keyword frequency and importance

3. **Market Analysis Engine**
   - Prioritizes skills by market demand
   - Considers job requirement levels (required vs preferred)
   - Provides industry-specific context

4. **Gap Analysis Algorithm**
   - Identifies missing skills from job description
   - Categorizes by severity (critical, important, beneficial)
   - Suggests learning order based on dependencies

5. **Scoring Algorithm**
   - Multi-dimensional weighted scoring
   - Normalizes scores across different metrics
   - Provides actionable feedback

### Project Structure

```
bdpa-main/
├── frontend/bdpafrontend-main/  # Main application
│   ├── app/                    # Next.js 13 App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── analyze/       # Analysis endpoint
│   │   │   ├── profile/       # User profile management
│   │   │   ├── sql-instructor/# SQL Learning Hub API
│   │   │   └── seed/          # Database seeding
│   │   ├── auth/              # Authentication pages
│   │   ├── analyze/           # Job analysis interface
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── learn/             # Learning Hub (14-day plan + SQL)
│   │   ├── onboarding/        # Profile setup
│   │   ├── results/           # Analysis results
│   │   └── profile/           # Profile management
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── results/           # Results display components
│   │   └── learn/             # Learning Hub components
│   ├── lib/                   # Core libraries
│   │   ├── ml-engine.ts       # ML analysis algorithms
│   │   ├── scoring.ts         # Scoring system
│   │   ├── market-analysis.ts # Market analysis engine
│   │   ├── sql-instructor.ts  # SQL Learning Hub logic
│   │   ├── gap-analysis.ts    # Gap identification
│   │   └── resource-engine.ts # Learning recommendations
│   └── README.md             # Detailed frontend documentation
├── analysis/                  # Analysis scripts
├── 2025 Job Market/           # Job market datasets
└── Kaggle Datasets/           # ML-ready datasets
```

## 📊 Understanding the Graphs

### Dashboard Charts Explained

#### 1. Score Trend Over Time
**What it shows**: Your overall analysis scores plotted chronologically
**How to read**: 
- Upward trend = improving fit over time
- Flat line = consistent performance
- Downward trend = may need to adjust target roles or skills
**Use case**: Track long-term improvement and identify when you made skill gains

#### 2. Subscore Radar Chart
**What it shows**: All 6 scoring dimensions in one view
**How to read**:
- Larger area = better overall fit
- Each axis represents one dimension
- Asymmetric shape = strengths and weaknesses
**Use case**: Quick visual assessment of which areas need work

#### 3. Readiness Distribution
**What it shows**: How often you meet different percentages of required skills
**How to read**:
- Bars on the right (80-100%) = strong skill coverage
- Bars on the left (0-40%) = significant gaps
- Tall bars = common pattern in your analyses
**Use case**: Understand consistency of your skill coverage

#### 4. Hot Skills Over Time
**What it shows**: Market demand trends for skills you're missing
**How to read**:
- Rising lines = increasing demand
- Multiple skills = shows which are trending
- Y-axis = normalized demand score
**Use case**: Prioritize learning based on market trends

#### 5. Top Missing Skills
**What it shows**: Most frequently missing skills across all analyses
**How to read**:
- Longer bars = appear in more job descriptions
- Sorted by frequency and market demand
- Shows which skills to learn first
**Use case**: Identify the most important skills to acquire

#### 6. Role Coverage
**What it shows**: Distribution of analyses by role type
**How to read**:
- Larger slices = roles you analyze most
- Multiple small slices = exploring different paths
- Single large slice = focused on one role type
**Use case**: Understand your career exploration patterns

## 🔄 User Flow

```
1. Landing Page (/) 
   ↓
2. Authentication (/auth) - Use hard login: rao305@purdue.edu / demo11
   ↓
3. Onboarding (/onboarding)
   - Upload resume OR enter skills manually
   - Add coursework and experience
   - Select target industry
   ↓
4. Dashboard (/dashboard)
   - View analytics and trends
   - See past analyses
   ↓
5. Analyze (/analyze)
   - Select role template
   - Paste job description
   - Click "Analyze Fit"
   ↓
6. Results (/results/:id)
   - View detailed scores
   - See missing skills
   - Get learning recommendations
   ↓
7. Learning Hub (/learn)
   - 14-day learning plan
   - SQL challenges with AI mentor
   - Saved resources
```

## 🎯 Key Pages

- **`/`** - Welcome page with feature overview
- **`/auth`** - Email/password authentication (use hard login credentials)
- **`/onboarding`** - Profile setup (resume upload or manual entry)
- **`/dashboard`** - Analytics dashboard with charts and metrics
- **`/analyze`** - Role analysis with job description input
- **`/results/:id`** - Detailed analysis results with scores
- **`/learn`** - Learning Hub (14-day plan + SQL Learning Hub)
- **`/profile`** - Profile management and editing
- **`/admin/seed`** - Database seeding (admin only)

## 🛠 API Endpoints

- `POST /api/analyze` - Run skill gap analysis
- `GET/POST /api/profile` - User profile management
- `GET /api/roles` - Available role templates
- `GET /api/analyses` - User's analysis history
- `POST /api/seed` - Database seeding (admin)
- `POST /api/upload` - Resume upload and parsing
- `GET /api/sql-instructor` - SQL Learning Hub data
- `POST /api/sql-instructor` - SQL query validation and AI mentor chat

## 📚 Database Schema

The database includes the following tables:

- **`profiles`** - User profiles with skills, coursework, and experience
- **`roles`** - Predefined role templates (ML Engineer, Data Scientist, etc.)
- **`resources`** - Learning resources mapped to skills
- **`analyses`** - Saved analysis results with scores and recommendations

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## 🚀 Production Build & Deployment

### Local Production Build

```bash
cd frontend/bdpafrontend-main
npm run build
npm run start
```

### Netlify Deployment

The project includes Netlify configuration files for easy deployment:

1. **Connect your GitHub repository to Netlify**
2. **Build Settings** (should auto-detect):
   - **Base directory**: `frontend/bdpafrontend-main`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18

3. **Environment Variables**:
   Add these in Netlify dashboard → Site settings → Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Netlify Plugin**:
   The `@netlify/plugin-nextjs` plugin is configured in `netlify.toml` and will be automatically installed during build.

5. **Deploy**: Click "Deploy site" and Netlify will handle the rest.

**Note**: The Netlify Next.js plugin automatically handles routing for Next.js 13 App Router, so no manual redirects are needed.

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication via Supabase Auth
- No API keys or secrets exposed client-side
- Password reset uses Supabase's secure flow
- Protected routes with automatic redirection

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Next.js will auto-assign a new port (3001, 3002, etc.)

2. **Supabase connection errors**: 
   - Check `.env.local` has correct credentials
   - Verify database schema is applied
   - For demo, placeholder credentials work for UI testing

3. **Build errors**:
   ```bash
   npm run typecheck  # Check TypeScript errors
   npm run lint       # Check linting issues
   ```

4. **Empty dashboard**: Run an analysis first or visit `/admin/seed` to populate sample data

5. **Auth not working**: 
   - Use the hard login credentials: rao305@purdue.edu / demo11
   - Check that your Supabase project has email auth enabled

## 📝 Development Commands

```bash
cd frontend/bdpafrontend-main
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # TypeScript checking
```

## 🎓 Learning Resources

The platform provides curated learning resources including:

- **YouTube Tutorials**: Video lessons for each SQL concept
- **Interactive Courses**: Step-by-step learning paths
- **Documentation**: Official documentation links
- **Practice Challenges**: Real-world SQL problems with solutions

## 🔮 Future Enhancements

- Additional programming language learning hubs
- Real-time collaboration features
- Advanced ML model training
- Integration with learning platforms
- Mobile app support

## 📄 License

MIT

## 🤝 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**SkillSharp** - Sharpen Your Skills. Advance Your Career.

