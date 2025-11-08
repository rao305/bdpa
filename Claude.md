# SkillGap MVP – ML Analysis Engine & Product Spec

> **One‑liner:** *See your gap. Fix your gap.* A web app that compares provable skills to role demands, scores resume–JD fit, and turns gaps into 1‑click learning plans.

---

## 0) Goals & Non‑Goals

**Goals (MVP):**

* Transparent, explainable analysis (deterministic + light ML).
* 5–8 hardcoded roles with fixed requirements.
* Resume↔JD fit score, role readiness, gap prioritization, resources.
* Responsive UI and judge‑friendly demo.

**Non‑Goals (defer):** live scraping, ATS integrations, LLM rewriting, complex classifiers.

---

## 1) User Flow (Pages)

1. **Welcome → Auth** (email/Google).
2. **First‑time Onboarding**

   * Path A: Upload resume (.pdf) → text parse.
   * Path B: Manual entry: student? (Y/N), year, major, coursework, tools/frameworks, experience (Research/Internship/Full‑time/Other + duration), target industry (AI/ML, Data, SWE, Robotics, Game Dev).
3. **Role & JD Analyzer**

   * Select target role (predefined).
   * Paste job title + description.
   * Click **Analyze**.
4. **Results Dashboard**

   * Overall + 5 sub‑scores, strengths, areas to improve.
   * Missing skills with 1–2 free resources each.
   * Optional: 14‑day micro‑plan generator.
5. **Learning Hub**

   * Saved analyses, skills in progress, completion toggles.

---

## 2) Roles (Hardcoded Examples)

* AI/ML Intern
* Data Analyst Intern
* Backend SWE Intern
* Frontend SWE Intern
* DevOps Intern
* Robotics Intern
* Game Dev Intern

Each role has: `title`, `description`, and `requirements[{skill, weight(1|2), bucket}]` where `bucket ∈ {Language, Framework/Concept, Tool, Soft}`.

---

## 3) Data Models

### 3.1 Role

```json
{
  "id": "backend_intern",
  "title": "Backend SWE Intern",
  "category": "SWE",
  "description": "Build and test backend services; write endpoints; interact with DB.",
  "requirements": [
    {"skill": "Python", "weight": 2, "bucket": "Language"},
    {"skill": "APIs/REST", "weight": 2, "bucket": "Framework/Concept"},
    {"skill": "SQL", "weight": 2, "bucket": "Tool"},
    {"skill": "Git", "weight": 1, "bucket": "Tool"},
    {"skill": "Unit Testing Basics", "weight": 1, "bucket": "Tool"},
    {"skill": "Team Communication", "weight": 1, "bucket": "Soft"}
  ]
}
```

### 3.2 Resource Catalog (static)

```json
{
  "Python": [
    {"title":"Python Basics - freeCodeCamp","url":"https://...","type":"Course"},
    {"title":"Python Docs: Tutorial","url":"https://...","type":"Documentation"}
  ],
  "SQL": [
    {"title":"Intro to SQL - Khan Academy","url":"https://...","type":"Interactive"}
  ]
}
```

### 3.3 User Profile (normalized)

```json
{
  "uid": "user_123",
  "is_student": true,
  "year": "Junior",
  "major": "CS",
  "skills": ["Python","Pandas","Git","Docker","Linux"],
  "coursework": ["Algorithms","Databases","ML"],
  "experience": [{"type":"Internship","duration_months":3}],
  "target_category": "SWE"
}
```

### 3.4 Analysis Result

```json
{
  "role_id": "backend_intern",
  "readiness_overall": 66,
  "subscores": {"ats": 65, "alignment": 60, "impact": 70, "polish": 68, "potential": 80},
  "strengths": ["Docker/K8s","CI/CD basics"],
  "improvements": ["Security basics","Explicit citizenship statement (if required)"],
  "missing_skills": [
    {"skill":"SQL","weight":2,"resources":[{"title":"Intro to SQL - KA","url":"..."}]},
    {"skill":"Unit Testing Basics","weight":1,"resources":[{"title":"PyTest Crash","url":"..."}]}
  ]
}
```

---

## 4) ML Analysis Engine

### 4.1 Tasks

1. Resume↔JD Fit (cosine similarity).
2. Role Readiness (requirements coverage).
3. Gap Prioritization (role weight × market weight).
4. Resource Recommendation (static catalog).
5. Sub‑scores: ATS, Alignment, Impact, Polish, Potential.

### 4.2 Inputs → Feature Extraction

* `resume_text` (or `manual_profile`).
* `job_description`.
* `role_id`.
* Normalize tokens: lowercase, alias map (`js→JavaScript`, `py→Python`, `k8s→Kubernetes`), whitelist to our skill dictionary.
* Count features: #projects, #internships, #quantified bullets (digits/%, `increased|reduced`), headers present, date formats, bullet length.

### 4.3 Models (MVP → Upgrade)

* **Alignment:** TF‑IDF (char tri‑ to penta‑grams + word unigrams) → cosine.
  *Upgrade:* sentence embeddings (`MiniLM`) → cosine.
* **Readiness:** deterministic coverage of required skills with weights.
* **Priority:** `role_weight * market_weight` where `market_weight(skill) = log(1 + freq(skill in postings for the chosen category))`.
  *Upgrade:* logistic regression to predict callback; rank by marginal effect.
* **ATS/Polish:** rule checklist; *upgrade:* small classifier on labeled résumés.

### 4.4 Scoring Formulas

* **Readiness%** = `met_required / total_required * 100`
* **Alignment** = `100 * cosine(resume_vec, jd_vec)`
* **ATS** = sum of checklist flags scaled to [0,100]
* **Impact** = `min(100, 30*internships + 20*projects_with_metrics + 5*quant_bullets)`
* **Polish** = formatting heuristic flags scaled to [0,100]
* **Potential** = `min(100, readiness + 20*has_deep_project + 10*coursework_density)`
* **Overall** = `0.35*Alignment + 0.25*Readiness + 0.15*ATS + 0.15*Impact + 0.10*Polish` (renormalize if ATS/Polish unavailable).

### 4.5 Gap Engine (Algorithm)

```
user_tokens = normalize(user.skills ∪ coursework ∪ tools ∪ resume_tokens)
role_reqs = roles[role_id].requirements
missing = [req for req in role_reqs if req.skill not in user_tokens]
readiness = 100 * (len(role_reqs) - len(missing)) / len(role_reqs)
prioritized = sort(missing, key = (-req.weight, req.bucket))
resources = { req.skill: RESOURCE_CATALOG[req.skill][:2] }
```

### 4.6 Engine API

```
POST /analyze
{
  "resume_text": "..." ,
  "job_description": "...",
  "role_id": "backend_intern",
  "manual_profile": {"skills":[],"coursework":[],"tools":[]}
}

200 OK
{
  "scores": {"overall": 66, "alignment": 60, "readiness": 62, "ats": 65, "impact": 70, "polish": 68, "potential": 80},
  "strengths": ["Python","Docker"],
  "areas_for_improvement": ["SQL","Unit Testing Basics"],
  "missing_skills": [{"skill":"SQL","priority":0.83,"resources":[{"title":"Intro to SQL - KA","url":"..."}]}],
  "plan_14_day": [{"day":1,"task":"Watch Intro to SQL","skill":"SQL"}]
}
```

---

## 5) System Architecture

**Frontend (Next.js + Tailwind):** onboarding, analyzer form, results dashboard, learning hub.
**Backend (FastAPI/Express):** `/analyze` endpoint, PDF parsing (pdfminer or pdf.js client‑side), scoring, resource retrieval.
**DB (Supabase):** tables: `users`, `roles`, `resources`, `analyses`.
**Storage:** static JSON seeds for roles/resources; optional bucket for PDFs.
**Charts:** Recharts for score rings/bars.
**Auth:** Supabase Auth or OAuth.

---

## 6) Database Schema (Supabase‑style)

```sql
-- roles
create table roles (
  id text primary key,
  title text not null,
  category text not null,
  description text
);

-- role_requirements
create table role_requirements (
  role_id text references roles(id),
  skill text not null,
  weight int not null check (weight in (1,2)),
  bucket text not null,
  primary key (role_id, skill)
);

-- resources
create table resources (
  skill text,
  title text,
  url text,
  type text check (type in ('Course','Documentation','Interactive'))
);

-- analyses
create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  role_id text,
  payload jsonb,
  result jsonb,
  created_at timestamp default now()
);
```

---

## 7) Implementation Plan (Hackathon Pace)

**T0–4h**: Auth, layout, DB seed (roles/resources).
**T4–10h**: Onboarding (upload/manual), normalization utility.
**T10–16h**: `/analyze` endpoint: TF‑IDF cosine, readiness, gaps, resources.
**T16–22h**: Results dashboard (cards + lists + save).
**T22–26h**: Learning Hub + optional 14‑day plan.
**T26–30h**: Mobile polish, demo script, seed examples.

---

## 8) Testing Checklist

* Upload PDF with common edge cases (tables, two columns).
* Manual profile only (no resume).
* JD with buzzwords vs. concrete stack.
* Role change recomputes correctly.
* Missing skills always map to at least one resource.
* Scores sum/weights renormalize when ATS/Polish disabled.

---

## 9) Future Work (post‑MVP)

* Embedding models for Alignment; E5/MiniLM.
* Resume rewrite assistant; interview bullet generator.
* Quiz‑based verification and proof‑of‑skill micro‑tasks.
* Real job feeds + dynamic skill priors.
* Multi‑role heatmap and cohort benchmarking.

---

## 10) Demo Script (60–90s)

1. Pick **Backend SWE Intern**, paste JD, click **Analyze**.
2. Show **Overall 66**, **Potential 80**, gaps: **SQL**, **Unit Testing**.
3. Click **SQL** → two free resources; add to plan.
4. Save analysis; open **Learning Hub** to show checklist.

---

### Appendices

#### A) Normalization Rules (examples)

* Aliases: `js→JavaScript`, `py→Python`, `node→Node.js`, `k8s→Kubernetes`, `ts→TypeScript`.
* Ignore stopwords and generic nouns ("team", "fast learner").
* Map plurals ("APIs"→"APIs/REST").

#### B) ATS Heuristics (MVP)

* Headers present: Education, Experience, Projects, Skills.
* Consistent date patterns; bullets start with action verbs; < 2 lines.
* Contact info once; no photos; no references section.
* Keyword coverage for the selected role (≥ 70% of core terms).
