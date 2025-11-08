# GapFixer - Skills Gap Analysis Platform

A production-ready web application that helps students and professionals analyze their resume against job descriptions, discover missing skills, and get personalized learning roadmaps.

## Features

- **Skills Analysis**: Upload resume or enter skills manually
- **Job Matching**: Analyze fit against target roles with detailed scoring
- **Comprehensive Metrics**: Track progress with interactive charts and analytics
- **Learning Hub**: Get personalized 14-day learning plans with curated resources
- **Supabase Backend**: Secure authentication and data persistence

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase (Auth & Database)
- Recharts (Analytics)
- Zustand (State Management)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema has been automatically applied via Supabase MCP. Visit `/admin/seed` after starting the app to populate roles and resources.

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The database schema includes:

- `profiles` - User profiles with skills and experience
- `roles` - Predefined role templates (ML Engineer, Data Scientist, etc.)
- `resources` - Learning resources mapped to skills
- `analyses` - Saved analysis results with scores and recommendations

To seed the database with initial data:

1. Start the app
2. Navigate to `/admin/seed`
3. Click "Seed Database"

## Key Pages

- `/` - Welcome page with feature overview
- `/auth` - Email/password authentication
- `/onboarding` - Profile setup (resume upload or manual entry)
- `/analyze` - Role analysis with job description input
- `/results/:id` - Detailed analysis results with scores
- `/dashboard` - Metrics dashboard with charts and analytics
- `/learn` - Learning hub with personalized tasks
- `/profile` - Profile management

## Scoring System

The app uses rule-based scoring across multiple dimensions:

- **Overall Score**: Weighted combination of all subscores
- **Alignment**: Keyword match with job description
- **Readiness**: Percentage of required skills met
- **Impact**: Project achievements and quantifiable results
- **Potential**: Growth trajectory based on skills and coursework
- **ATS** (optional): Resume formatting quality

All scoring is done client-side with no external API calls.

## Features

### Authentication
- Email/password authentication via Supabase
- Protected routes with automatic redirection
- Profile creation on signup

### Analysis
- Multi-dimensional scoring (Alignment, Readiness, Impact, Potential)
- Missing skills prioritization by requirement level
- Automatic resource recommendations (1-2 per skill)
- Save and review past analyses

### Metrics Dashboard
- KPI cards (Avg Overall, Total Analyses, Avg Alignment, Avg Readiness)
- Interactive charts:
  - Score trend over time (line chart)
  - Subscore radar chart
  - Readiness distribution (histogram)
  - Top missing skills (bar chart)
  - Role coverage (pie chart)
- Filterable by role and date range
- Clickable table to view individual results

### Learning Hub
- Auto-generated 14-day learning plans
- Task tracking with checkboxes
- Saved resources from analyses
- Progress tabs (In Progress, Saved, Completed)

## Production Build

```bash
npm run build
npm run start
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
