# SkillGap MVP - Quick Start Guide

This is a complete SkillGap analysis app built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the frontend folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
cd frontend/bdpafrontend-main
npm install
```

### 3. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the migration file in your Supabase SQL editor:
   ```sql
   -- Copy and run the contents of supabase/migrations/20251108153156_create_gapfixer_schema.sql
   ```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Seed the Database

1. Sign up for an account
2. Navigate to `/admin/seed`
3. Click "Seed Database" to populate roles and resources

## 🎯 User Flow

1. **Sign Up/Sign In** → Create account or log in
2. **Onboarding** → Upload resume or manually enter skills
3. **Analyze Role** → Select role, paste job description, analyze fit
4. **View Results** → See detailed scoring and missing skills
5. **Learning Hub** → Access personalized resources and 14-day plan
6. **Dashboard** → Track progress over time

## 🏗️ Architecture

- **Frontend**: Next.js 13+ with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **ML Engine**: Client-side TypeScript libraries
- **Charts**: Recharts for analytics visualization
- **State Management**: Zustand (minimal usage)

## 📊 Features Implemented

✅ **Complete User Authentication Flow**
- Sign up/sign in with email
- Profile creation and management
- Secure session handling

✅ **Skills Profile Management**
- Resume upload with PDF text extraction
- Manual skill entry with autocomplete
- Academic year, major, coursework tracking

✅ **Role Analysis Engine**
- 7 predefined intern roles (AI/ML, Data, SWE, etc.)
- Resume ↔ Job Description scoring
- 5 sub-scores: ATS, Alignment, Impact, Polish, Potential
- Gap prioritization with market weights

✅ **Results Dashboard**
- Detailed scoring visualization
- Missing skills with learning resources
- Strengths and improvement areas
- Save and track multiple analyses

✅ **Learning Hub**
- Personalized 14-day learning plans
- Curated resources for each missing skill
- Progress tracking with checkboxes

✅ **Analytics Dashboard**
- Score trends over time
- Performance metrics across roles
- Top missing skills analysis
- Role distribution charts

## 🔧 Key Components

### Core Libraries
- **lib/scoring.ts**: Main scoring algorithm
- **lib/gap-analysis.ts**: Enhanced gap analysis with market data
- **lib/advanced-scoring.ts**: Detailed analysis engine
- **lib/normalization.ts**: Skill normalization and text extraction
- **lib/resource-engine.ts**: Learning resource recommendations
- **lib/seed-data.ts**: Hardcoded roles and resources

### UI Components
- **components/onboarding/**: Resume upload and skill input
- **components/results/**: Score visualization and results display
- **components/ui/navigation.tsx**: Main app navigation

### Pages
- **app/page.tsx**: Landing page
- **app/auth/page.tsx**: Authentication
- **app/onboarding/page.tsx**: Profile setup
- **app/analyze/page.tsx**: Role analysis
- **app/results/[id]/page.tsx**: Analysis results
- **app/dashboard/page.tsx**: Analytics dashboard
- **app/learn/page.tsx**: Learning hub
- **app/profile/page.tsx**: Profile management

## 🎨 Demo Script (90 seconds)

1. **Start**: "This is SkillGap - analyze your fit for any role in 60 seconds"
2. **Onboarding**: Upload sample resume → skills auto-extracted
3. **Analysis**: Select "Backend SWE Intern" → paste job description → analyze
4. **Results**: Show overall score 66, potential 80, missing: SQL, Unit Testing
5. **Resources**: Click SQL → show learning resources
6. **Learning Hub**: Show 14-day plan, track progress
7. **Dashboard**: Show analytics, trends, insights

## 📱 Mobile Responsive

The app is fully responsive and works on all device sizes with touch-friendly interactions.

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data isolation through auth.uid()
- No sensitive data in client code
- Secure PDF processing (client-side only)

## 🚀 Deployment

Ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

## 📈 Performance

- Client-side ML processing for speed
- Optimized components with proper loading states
- Efficient database queries with indexes
- Image optimization and code splitting