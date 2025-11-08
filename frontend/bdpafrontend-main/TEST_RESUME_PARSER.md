# Resume Parser Testing Guide

## ✅ Fixed Issues

1. **PDF parsing client-side bundling errors** - RESOLVED
   - Added `pdf-parse` to `serverComponentsExternalPackages`
   - Configured webpack to completely exclude `pdf-parse` and `pdfjs-dist` from client bundle
   - Using dynamic import on server-side only

2. **Demo user email** - FIXED
   - Corrected from `image.pngrao305@purdue.edu` to `rao305@purdue.edu`

## 🧪 How to Test

### 1. Sign In
- Go to http://localhost:3000
- Use credentials: `rao305@purdue.edu` / `demo1`

### 2. Upload Resume
- You'll be redirected to `/onboarding`
- Click "Upload Resume" or drag & drop a PDF
- The system will:
  - Send PDF to `/api/upload` (server-side only)
  - Parse PDF using `pdf-parse` (no client-side code)
  - Extract text and save to profile
  - Return text to frontend

### 3. Auto-Fill Detection
The parser extracts and auto-fills:

#### Skills
- Searches for "Skills:", "Technical Skills:", etc. sections
- Parses comma-separated, colon-separated, bullet-point, newline-separated lists
- Matches against dictionary of known skills
- Whole-word matching to avoid false positives

#### Education
- **Major**: Detects patterns like:
  - "Major: Computer Science"
  - "Bachelor of Science in Computer Science"
  - "CS" or "Computer Science" standalone
- **Year**: Extracts graduation year from:
  - "Expected 2025", "Graduation: 2024"
  - Date ranges "2020-2024"
  - Validates years (1980 to current+10)
- **Year Level**: Auto-calculates from graduation year
  - 0-1 years until grad → Senior
  - 2 years → Junior
  - 3 years → Sophomore
  - 4-5 years → Freshman

#### Coursework
- Detects course codes: "CS 101", "COMPSCI 250"
- Parses course names: "Introduction to Computer Science"
- Handles various list formats
- Limits to 15 courses

#### Experience
- Extracts from "Experience", "Projects", "Work" sections
- Detects types: Internship, Work, Project, Research, Teaching, Volunteer
- Parses dates: "May 2023 - August 2023", "2022-2024", "Ongoing"
- Extracts descriptions (up to 200 chars)
- Limits to 8 experiences

#### Target Category
- Auto-infers from skills:
  - AI/ML: tensorflow, pytorch, scikit-learn, etc.
  - Data Science: pandas, tableau, sql, etc.
  - Full Stack: react, node.js, mongodb, etc.
  - Backend: java, spring, microservices, etc.
  - Frontend: react, vue, angular, etc.

## 🔍 What to Check

### Browser Console
- **NO** `pdf-parse` import errors
- **NO** `pdfjs-dist` module errors
- **NO** webpack bundling errors

### After Upload
1. Skills array populated with extracted skills
2. Major field filled (if found in resume)
3. Year dropdown auto-selected
4. Coursework list populated
5. Experience entries created
6. Target category auto-selected
7. Form proceeds to "Details" step automatically

### Server Logs
- PDF parsing happens on server
- Text extraction logged
- Skills extracted logged
- Profile updated logged

## 🐛 Debugging

If upload fails:
1. Check browser console for errors
2. Check server terminal for parsing errors
3. Verify PDF is readable text (not scanned images)
4. Check file size (max 5MB)

If auto-fill doesn't work:
1. Check browser console for parsing output
2. Verify resume sections are labeled clearly ("Education", "Skills", etc.)
3. Check that skills match the dictionary
4. Try different resume formats

## 📝 Supported Resume Formats

- ✅ Standard chronological resumes
- ✅ Skills-based resumes
- ✅ Academic CVs
- ✅ Various section headers (Education, Academic, Qualifications, etc.)
- ✅ Different date formats (MM/YYYY, Month YYYY, YYYY-YYYY)
- ✅ Bullet points, numbered lists, comma-separated lists
- ❌ Scanned PDFs (image-only, no text layer)
- ❌ Heavily formatted PDFs with complex layouts

