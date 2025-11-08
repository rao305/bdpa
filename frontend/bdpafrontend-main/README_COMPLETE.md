# SkillGap MVP - AI-Powered Skills Analysis Platform

> **One-liner:** *See your gap. Fix your gap.* A web app that compares provable skills to role demands, scores resume–JD fit, and turns gaps into 1-click learning plans.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- (Optional) Supabase account for full functionality

### Installation & Setup

1. **Clone and Install**
   ```bash
   cd frontend/bdpafrontend-main
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials (optional - works in demo mode)
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
4. **Access the Application**
   - **Homepage**: http://localhost:3000
   - **Demo Setup**: http://localhost:3000/admin/seed
   - **Auth**: http://localhost:3000/auth

## 🎯 Demo Flow (60 seconds)

### Option 1: Full Flow with Mock Data
1. Visit http://localhost:3000
2. Click "🛠 Demo Setup" → Click "Seed Database" 
3. Click "Get Started" → Create account/sign in
4. Complete onboarding (Student, CS Major, add Python/Git skills)
5. Go to "Analyze" → Select "AI/ML Intern" → Paste sample JD → Click "Analyze Fit"
6. View results: scores, missing skills, learning plan

### Option 2: API Testing
```bash
# Test seeding
curl -X POST http://localhost:3000/api/seed -H "Content-Type: application/json" -d '{}'

# Test analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"role_id":"ai-ml-intern","jd_title":"ML Intern","jd_text":"Build ML models with Python"}'
```

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 13 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL) + Row Level Security
- **Authentication**: Supabase Auth
- **ML Engine**: Custom TF-IDF vectorization + cosine similarity
- **State**: Zustand + React Hook Form

### Key Features
- ✅ **Real ML Analysis** - TF-IDF vectorization, cosine similarity, market analysis
- ✅ **Resume Parsing** - PDF upload and text extraction
- ✅ **Multi-factor Scoring** - Readiness, Alignment, ATS, Impact, Polish, Potential
- ✅ **Smart Gap Analysis** - Market-prioritized skill gaps with learning resources
- ✅ **Learning Plans** - 14-day personalized roadmaps
- ✅ **Mock Mode** - Full functionality without Supabase for demos
- ✅ **Responsive Design** - Mobile-first with dark mode support

## 📊 ML Analysis Engine

### Algorithms Implemented
1. **TF-IDF Vectorization** - For resume-JD semantic similarity
2. **Cosine Similarity** - Document alignment scoring  
3. **Market Analysis** - Skill demand prioritization
4. **Multi-dimensional Scoring** - 6 key metrics
5. **Gap Prioritization** - Role weight × market demand

### Scoring Dimensions
- **Readiness** (25%): Coverage of required skills
- **Alignment** (35%): Resume-JD semantic similarity
- **ATS** (15%): Resume format and keyword optimization
- **Impact** (15%): Quantified achievements and experience
- **Polish** (10%): Professional presentation quality
- **Potential**: Growth trajectory and learning capacity

## 📁 Project Structure

```
frontend/bdpafrontend-main/
├── app/                    # Next.js 13 App Router
│   ├── api/               # Backend API routes
│   ├── auth/              # Authentication pages
│   ├── analyze/           # Job analysis interface
│   ├── onboarding/        # User profile setup
│   ├── admin/             # Admin tools (seeding)
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui primitives
│   ├── auth/             # Auth-specific components
│   └── onboarding/       # Onboarding components
├── lib/                   # Core libraries
│   ├── ml-engine.ts      # TF-IDF + ML algorithms
│   ├── scoring.ts        # Multi-factor scoring
│   ├── normalization.ts  # Skill standardization
│   ├── resource-engine.ts # Learning recommendations
│   ├── supabase.ts       # Database client
│   └── seed-data.ts      # Demo data
└── supabase/
    └── migrations/        # Database schema
```

## 🔌 API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/analyze` | POST | Run skills analysis | Yes |
| `/api/profile` | GET/POST | User profile management | Yes |
| `/api/roles` | GET | Available roles | Yes |
| `/api/analyses` | GET | Analysis history | Yes |
| `/api/seed` | POST | Database seeding | No |
| `/api/upload` | POST | Resume upload | Yes |

## 🛠 Development

### Available Scripts
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run typecheck  # TypeScript checking
```

### Database Setup (Optional)
1. Create Supabase project
2. Run migration: `supabase/migrations/20251108153156_create_gapfixer_schema.sql`
3. Update `.env.local` with real credentials

### Mock Mode
The app runs in **mock mode** by default with placeholder credentials:
- All APIs return realistic demo data
- No database required
- Perfect for UI testing and demos

## 🎨 Design System

### Components
- **shadcn/ui** - Accessible, customizable primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Consistent iconography
- **Dark/Light Mode** - System preference detection

### Key Patterns
- Cards for content grouping
- Progressive disclosure for complex forms
- Loading states with skeleton screens
- Error boundaries with helpful messages

## 🧪 Testing

### Manual Test Checklist
- [ ] Homepage loads without errors
- [ ] Seed data populates successfully
- [ ] Auth flow works (sign up/in)
- [ ] Onboarding completes successfully
- [ ] Analysis runs and returns scores
- [ ] Results display correctly
- [ ] Learning resources are accessible

### Sample Test Data
**Student Profile:**
- Student: Yes, Sophomore, Computer Science
- Skills: Python, HTML, CSS, Git
- Target: AI/ML

**Job Description:**
```
AI/ML Intern - Build machine learning models with Python, pandas, scikit-learn. 
Analyze datasets and create visualizations. Requirements: Python, statistics, 
problem-solving. Preferred: ML experience, SQL, Jupyter notebooks.
```

## 🚨 Troubleshooting

### Common Issues

1. **Port in use**: Next.js auto-assigns new port (3001, 3002, etc.)
2. **Build errors**: Run `npm run typecheck` and `npm run lint`
3. **Supabase errors**: Check credentials or use mock mode
4. **PDF parsing**: Currently uses mock extraction (placeholder implementation)

### Debug Mode
Set `NEXT_PUBLIC_DEBUG=true` in `.env.local` for detailed logging.

## 🔮 Future Enhancements

### MVP+ Features (Post-Demo)
- [ ] Real PDF parsing with pdf-parse
- [ ] Advanced ML models (sentence embeddings)
- [ ] Resume rewrite suggestions
- [ ] Interview preparation guides
- [ ] Multi-role comparison matrix
- [ ] Skill verification quizzes
- [ ] Progress tracking over time
- [ ] Integration with job boards

### Technical Improvements
- [ ] Server-side rendering optimization
- [ ] Database query optimization
- [ ] Comprehensive error handling
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] SEO optimization

## 📝 License & Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.io) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - Component library

---

**Demo Script**: Homepage → Seed → Auth → Onboarding → Analyze → Results (60s total)

**Key URLs**: 
- Demo: http://localhost:3000
- Setup: http://localhost:3000/admin/seed  
- Docs: See STARTUP.md for detailed setup guide