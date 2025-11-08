import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { serverStorage } from '@/lib/server-storage';
import { computeScores } from '@/lib/scoring';
import { normalizeSkills, buildDictionary } from '@/lib/normalization';
import { generateLearningPlan } from '@/lib/resource-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role_id, jd_title, jd_text, manual_profile, resume_text } = body;

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role_id || !jd_title || !jd_text) {
      return NextResponse.json(
        { error: 'Missing required fields: role_id, jd_title, jd_text' },
        { status: 400 }
      );
    }

    // Get user profile if not provided manually
    let userProfile = manual_profile;
    if (!userProfile) {
      const profile = await serverStorage.getProfile(user.id);
      
      if (profile) {
        userProfile = {
          skills: profile.skills || [],
          coursework: profile.coursework || [],
          experience: profile.experience || [],
          is_student: profile.is_student,
          year: profile.year,
          major: profile.major,
          target_category: profile.target_category,
        };
      }
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'No user profile found. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    // Get role requirements
    const role = await serverStorage.getRole(role_id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found. Please ensure roles are seeded.' }, { status: 404 });
    }

    if (!role.requirements || !Array.isArray(role.requirements) || role.requirements.length === 0) {
      return NextResponse.json({ error: 'Role has no requirements defined' }, { status: 400 });
    }

    // Get all resources for building dictionary
    const resources = await serverStorage.getResources();
    const allRoles = await serverStorage.getAllRoles();

    if (!allRoles || allRoles.length === 0) {
      return NextResponse.json({ error: 'No roles found. Please seed roles first.' }, { status: 500 });
    }

    // Build skill dictionary
    const dictionary = buildDictionary(allRoles || [], resources || []);
    
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

    // Get resources for missing skills
    const missingSkillsWithResources = await Promise.all(
      (scoringResult.missingSkills || []).map(async (missingSkill) => {
        const skillResources = await serverStorage.getResources(missingSkill.skill);
        return {
          ...missingSkill,
          resources: (skillResources || []).slice(0, 2), // Limit to 2 resources
        };
      })
    );

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

    const analysis = await serverStorage.saveAnalysis(analysisData);

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
