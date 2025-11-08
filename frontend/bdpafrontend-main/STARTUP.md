# SkillGap MVP - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure Supabase:
```bash
cp .env.example .env.local
```

For demo/testing, you can use the placeholder values already in `.env.local`.

### 3. Database Setup
If using real Supabase:
1. Create a new Supabase project
2. Run the migration: `supabase/migrations/20251108153156_create_gapfixer_schema.sql`
3. Update `.env.local` with your real Supabase URL and anon key

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000 (or 3001 if 3000 is in use).

## 🎯 Demo Flow

### Option 1: Full Demo Flow
1. Go to http://localhost:3001/admin/seed
2. Click "Seed Database" to populate roles and resources
3. Go to http://localhost:3001/auth
4. Create an account or sign in
5. Complete onboarding (can skip resume upload)
6. Use the analyze page with sample job description

### Option 2: Quick Test (Mock Mode)
The app works in mock mode with placeholder Supabase credentials for UI testing.

## 📋 Test Checklist

### Core Features to Test:
- [ ] **Authentication**: Sign up/sign in flow
- [ ] **Onboarding**: Student info, skills entry (manual or resume)
- [ ] **Role Analysis**: Select role, paste job description, analyze fit
- [ ] **Results Dashboard**: View scores, missing skills, recommendations
- [ ] **Learning Hub**: Browse saved analyses and resources

### Sample Test Data:

**Job Description (AI/ML Intern):**
```
Join our AI team as a Machine Learning Intern and gain hands-on experience with real ML projects.

What you'll do:
- Assist in building machine learning models for data analysis
- Learn to clean and preprocess datasets
- Work with Python libraries like pandas and scikit-learn
- Create data visualizations and reports
- Collaborate with senior engineers on ML projects

Requirements:
- Currently pursuing a degree in Computer Science, Data Science, or related field
- Basic programming knowledge in Python
- Understanding of statistics and mathematics
- Strong problem-solving skills and willingness to learn
- Ability to work in a team environment

Preferred (but not required):
- Experience with pandas, NumPy, or other data science libraries
- Previous coursework in machine learning or statistics
- Familiarity with Jupyter notebooks
- Basic SQL knowledge

This internship is perfect for students who want to explore AI/ML careers and gain practical experience in a supportive learning environment.
```

**Student Profile Example:**
- Student: Yes
- Year: Sophomore
- Major: Computer Science
- Skills: Python, HTML, CSS, Git
- Coursework: Intro to Programming, Data Structures, Statistics
- Target: AI/ML

## 🛠 Technical Details

### Architecture:
- **Frontend**: Next.js 13 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **ML Engine**: Custom TF-IDF and cosine similarity implementation

### API Endpoints:
- `POST /api/analyze` - Run skill gap analysis
- `GET/POST /api/profile` - User profile management
- `GET /api/roles` - Available internship roles
- `GET /api/analyses` - User's analysis history
- `POST /api/seed` - Database seeding (admin)
- `POST /api/upload` - Resume upload and parsing

### Key Components:
- **ML Analysis Engine** (`lib/ml-engine.ts`) - TF-IDF vectorization, cosine similarity
- **Scoring System** (`lib/scoring.ts`) - Multi-factor scoring algorithm
- **Resource Engine** (`lib/resource-engine.ts`) - Learning recommendations
- **Normalization** (`lib/normalization.ts`) - Skill standardization

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use**: Next.js will auto-assign a new port (3001, 3002, etc.)

2. **Supabase connection errors**: 
   - Check `.env.local` has correct credentials
   - Verify database schema is applied
   - For demo, placeholder credentials are fine for UI testing

3. **Build errors**:
   ```bash
   npm run typecheck  # Check TypeScript errors
   npm run lint       # Check linting issues
   ```

4. **Database seeding fails**:
   - Ensure Supabase project is set up
   - Check database permissions
   - Use admin panel: http://localhost:3001/admin/seed

### Development Commands:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # TypeScript checking
```

## 📊 Performance Notes

- **Resume parsing**: Currently uses mock extraction (placeholder for pdf-parse)
- **ML engine**: Client-side processing for small-scale analysis
- **Caching**: Resource recommendations cached per session
- **Scoring**: Real-time computation with <100ms target

## 🎯 Demo Script (60 seconds)

1. **[10s]** Show homepage → Sign in → Onboarding (pre-filled student profile)
2. **[20s]** Navigate to analyze → Select "AI/ML Intern" → Paste sample JD
3. **[20s]** Click "Analyze Fit" → Show results (scores, gaps, recommendations)  
4. **[10s]** Browse missing skills → Show learning resources → Demo complete

## 🔗 Key URLs

- **Main App**: http://localhost:3001
- **Auth**: http://localhost:3001/auth
- **Analyze**: http://localhost:3001/analyze
- **Admin Panel**: http://localhost:3001/admin/seed
- **Results**: http://localhost:3001/results/[id] (after analysis)