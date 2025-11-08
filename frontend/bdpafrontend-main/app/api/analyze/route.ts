import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { serverStorage } from '@/lib/server-storage';
import { computeScores } from '@/lib/scoring';
import { normalizeSkills, buildDictionary } from '@/lib/normalization';
import { generateLearningPlan, getResourcesForSkill } from '@/lib/resource-engine';
import { seedRoles } from '@/lib/seed-data';
import fs from 'fs';
import path from 'path';

// Helper functions for local file storage (same as profile route)
const getProfilesDir = () => {
  const dir = path.join(process.cwd(), 'data', 'profiles');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getProfilePath = (userId: string) => {
  return path.join(getProfilesDir(), `${userId}.json`);
};

const readProfile = (userId: string) => {
  try {
    const profilePath = getProfilePath(userId);
    if (fs.existsSync(profilePath)) {
      const data = fs.readFileSync(profilePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading profile:', error);
    return null;
  }
};

// Helper functions for local analysis storage
const getAnalysesDir = () => {
  const dir = path.join(process.cwd(), 'data', 'analyses');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const saveAnalysis = (analysisData: any) => {
  try {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const analysisPath = path.join(getAnalysesDir(), `${analysisId}.json`);
    const analysis = {
      id: analysisId,
      ...analysisData,
      created_at: new Date().toISOString(),
    };
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf8');
    console.log('✅ Analysis saved to local file:', analysisId);
    return analysis;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Simplified authentication for local development
    const supabase = await createSupabaseServerClient();
    
    // Try to get user from session first (cookies)
    let { data: { user }, error } = await supabase.auth.getUser();
    
    // If session auth failed, try authorization header
    if (error || !user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        if (!tokenError && tokenUser) {
          user = tokenUser;
          error = null;
          console.log('✅ Analyze - User authenticated via auth header:', tokenUser.id);
        }
      }
    } else {
      console.log('✅ Analyze - User authenticated via session:', user.id);
    }
    
    // Fallback for local development - create a mock user
    if (error || !user) {
      console.log('🔄 No authentication found, using fallback user for local development');
      user = {
        id: 'local-dev-user-123',
        email: 'dev@local.test',
        aud: 'authenticated',
        role: 'authenticated',
        user_metadata: {},
        app_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const body = await request.json();
    const { role_id, jd_title, jd_text, manual_profile, resume_text } = body;

    if (!role_id || !jd_title || !jd_text) {
      return NextResponse.json(
        { error: 'Missing required fields: role_id, jd_title, jd_text' },
        { status: 400 }
      );
    }

    // Get user profile if not provided manually - use local file storage
    let userProfile = manual_profile;
    if (!userProfile) {
      console.log('🔍 Looking for profile for user:', user.id);
      const profile = readProfile(user.id);
      
      if (profile) {
        console.log('✅ Profile found in local storage');
        userProfile = {
          skills: profile.skills || [],
          coursework: profile.coursework || [],
          experience: profile.experience || [],
          is_student: profile.is_student,
          year: profile.year,
          major: profile.major,
          target_category: profile.target_category,
        };
      } else {
        console.log('❌ No profile found in local storage');
      }
    }

    // Fallback profile for local development - don't block analysis
    if (!userProfile) {
      console.log('🔄 No profile found, using fallback profile for analysis');
      userProfile = {
        skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Git'],
        coursework: ['Computer Science', 'Data Structures', 'Algorithms'],
        experience: [{ type: 'Internship', duration_months: 3 }],
        is_student: true,
        year: 'Junior',
        major: 'Computer Science',
        target_category: 'SWE',
      };
    }

    // Get role requirements from seed data
    const role = seedRoles.find(r => r.id === role_id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found. Please check role ID.' }, { status: 404 });
    }

    if (!role.requirements || !Array.isArray(role.requirements) || role.requirements.length === 0) {
      return NextResponse.json({ error: 'Role has no requirements defined' }, { status: 400 });
    }

    // Use seed data for roles
    const allRoles = seedRoles;

    console.log('✅ Using seed data:', { rolesCount: allRoles.length });

    // Build skill dictionary (resources will be fetched from resource-engine)
    const dictionary = buildDictionary(allRoles || [], []);
    
    if (!dictionary || dictionary.size === 0) {
      return NextResponse.json({ error: 'Failed to build skill dictionary' }, { status: 500 });
    }
    
    // Load market data dynamically
    let marketData: any = null;
    try {
      const marketResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/market-data`);
      if (marketResponse.ok) {
        marketData = await marketResponse.json();
      }
    } catch (error) {
      console.warn('Could not load market data, will use fallback:', error);
    }

    // Prepare all user skills (profile + coursework + resume if provided)
    const allUserSkills = [
      ...(userProfile.skills || []),
      ...(userProfile.coursework || []),
    ];

    // Add skills from resume if provided
    if (resume_text) {
      const { extractSkillsFromText } = await import('@/lib/normalization');
      const resumeSkills = extractSkillsFromText(resume_text, dictionary);
      console.log(`Extracted ${resumeSkills.length} skills from resume:`, resumeSkills);
      allUserSkills.push(...resumeSkills);
    }
    
    // Log total skills for debugging
    console.log(`Total user skills (profile + coursework + resume): ${allUserSkills.length}`, allUserSkills);

    // Compute scores
    let scoringResult;
    try {
      scoringResult = computeScores({
        userSkills: allUserSkills || [],
        roleRequirements: role.requirements as Array<{ skill: string; weight: number; priority: string }>,
        jdText: jd_text || '',
        jdTitle: jd_title || '',
        dictionary,
        resumeProvided: !!resume_text,
        resumeText: resume_text || '',
        roleCategory: role.category || 'general',
        marketData: marketData, // Pass dynamically loaded market data
      });
    } catch (scoringError) {
      console.error('Scoring error:', scoringError);
      throw new Error(`Scoring failed: ${scoringError instanceof Error ? scoringError.message : 'Unknown error'}`);
    }

    // Get resources for missing skills from resource engine
    const missingSkillsWithResources = (scoringResult.missingSkills || []).map((missingSkill) => {
      // Get resources for this skill using the resource engine
      const skillResources = getResourcesForSkill(
        missingSkill.skill,
        'beginner', // Default to beginner level
        undefined, // No preferred types
        3 // Get up to 3 resources
      );
      
      // Format resources to match expected structure
      const formattedResources = skillResources.map(resource => ({
        title: resource.title,
        url: resource.url,
        type: resource.type,
        difficulty: resource.difficulty,
        duration: resource.duration,
      }));
      
      return {
        ...missingSkill,
        resources: formattedResources,
      };
    });

    // Generate 14-day learning plan (handle empty case)
    const learningPlan = missingSkillsWithResources.length > 0 
      ? generateLearningPlan(missingSkillsWithResources)
      : [];

    // Save analysis to database
    const analysisData = {
      uid: user.id,
      role_id,
      jd_title,
      jd_text,
      readiness_overall: scoringResult.overall,
      subscores: {
        readiness: scoringResult.readiness,
        alignment: scoringResult.alignment,
        ats: scoringResult.ats,
        impact: scoringResult.impact,
        polish: scoringResult.polish,
        potential: scoringResult.potential,
      },
      strengths: scoringResult.strengths,
      improvements: scoringResult.improvements,
      missing_skills: missingSkillsWithResources,
      meta: {
        ...scoringResult.meta,
        user_skills_count: allUserSkills.length,
        role_requirements_count: role.requirements.length,
        learning_plan: learningPlan,
        market_analysis: scoringResult.marketAnalysis, // Store market analysis in meta
      },
    };

    const analysis = saveAnalysis(analysisData);

    // Return complete results
    return NextResponse.json({
      success: true,
      analysis_id: analysis.id,
      scores: {
        overall: scoringResult.overall,
        readiness: scoringResult.readiness,
        alignment: scoringResult.alignment,
        ats: scoringResult.ats,
        impact: scoringResult.impact,
        polish: scoringResult.polish,
        potential: scoringResult.potential,
      },
      strengths: scoringResult.strengths,
      areas_for_improvement: scoringResult.improvements,
      missing_skills: missingSkillsWithResources,
      learning_plan: learningPlan,
      market_analysis: scoringResult.marketAnalysis, // Add market analysis explanations
      role: {
        id: role.id,
        title: role.title,
        category: role.category,
        description: role.description,
      },
      meta: scoringResult.meta,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorStack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
