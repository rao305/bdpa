# GapFixer - Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings → API.

## 2. Database Setup

The database schema has already been applied through Supabase MCP. The following tables exist:

- `profiles` - User profiles with skills and coursework
- `roles` - Predefined role templates
- `resources` - Learning resources mapped to skills
- `analyses` - Saved analysis results

## 3. Seed Initial Data

After starting the development server:

1. Navigate to `http://localhost:3000/admin/seed`
2. Click "Seed Database"

This will populate:
- 7 role templates (ML Engineer, Data Scientist, Full-Stack SWE, DevOps, Robotics, Game Dev, AI Researcher)
- 30+ learning resources with links to tutorials, courses, and documentation

## 4. Run the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. First Time Setup

1. Click "Get Started" on the welcome page
2. Create an account with email/password
3. Complete the onboarding questionnaire:
   - Choose between uploading a resume or manual entry
   - Add your skills, coursework, and experience
   - Select your target industry
4. Start analyzing roles!

## Flow Overview

```
Home (/) → Auth (/auth) → Onboarding (/onboarding) → Dashboard (/dashboard)
                                                    ↓
                                              Analyze (/analyze)
                                                    ↓
                                            Results (/results/:id)
                                                    ↓
                                            Learn (/learn) or Profile (/profile)
```

## Key Features

### 1. Analyze
- Select from 7 predefined roles
- Paste any job description
- Get instant scoring across 6 dimensions

### 2. Results
- Overall score with visual ring
- Sub-scores: Alignment, Readiness, Impact, Potential, ATS (if resume)
- Strengths and areas to improve
- Prioritized missing skills with 1-2 learning resources each

### 3. Dashboard
- KPI cards showing averages and totals
- Interactive charts:
  - Score trend over time
  - Subscore radar
  - Readiness distribution
  - Top missing skills
  - Role coverage
- Filter by role and date
- Click any analysis to view details

### 4. Learning Hub
- Auto-generated 14-day learning plan
- Task tracking with checkboxes
- Saved resources from all analyses
- Progress tabs

### 5. Profile
- Edit skills, coursework, and target industry
- Update student status and academic info

## Production Build

```bash
npm run build
npm run start
```

The app is optimized for production with:
- Server-side rendering for auth flows
- Client-side state management with Zustand
- Secure RLS policies on all database tables
- Type-safe Supabase client

## Troubleshooting

**Build errors**: Make sure you've installed all dependencies with `npm install`

**Database errors**: Verify your Supabase credentials in `.env.local`

**Empty dashboard**: Run an analysis first or visit `/admin/seed` to populate sample data

**Auth not working**: Check that your Supabase project has email auth enabled

## Security Notes

- All database tables use Row Level Security (RLS)
- Users can only access their own data
- No API keys or secrets are exposed client-side
- Password reset uses Supabase's secure flow

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Need Help?

Check the main README.md for detailed documentation or open an issue on GitHub.
