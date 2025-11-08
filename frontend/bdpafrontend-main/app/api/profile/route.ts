import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

// Helper functions for local file storage
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

const writeProfile = (userId: string, profile: any) => {
  try {
    const profilePath = getProfilePath(userId);
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
    return profile;
  } catch (error) {
    console.error('Error writing profile:', error);
    throw error;
  }
};

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
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
          console.log('✅ GET profile - User authenticated via auth header:', tokenUser.id);
        }
      }
    } else {
      console.log('✅ GET profile - User authenticated via session:', user.id);
    }
    
    if (error || !user) {
      console.log('❌ GET profile - Authentication failed:', error?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = readProfile(user.id);
    console.log('📖 GET profile - Profile loaded:', { userId: user.id, hasProfile: !!profile });

    return NextResponse.json({ 
      profile: profile || null,
      user: {
        id: user.id,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    // Authenticate user using Supabase
    const authHeader = request.headers.get('authorization');
    let user = null;

    try {
      const supabase = await createSupabaseServerClient();
      
      // If we have an auth header, try to get user with that token
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        
        if (!tokenError && tokenUser) {
          user = { id: tokenUser.id, email: tokenUser.email || '' };
          console.log('✅ User authenticated via auth header:', tokenUser.id);
        } else {
          console.log('Auth header validation failed:', tokenError?.message);
        }
      }
      
      // Fallback to session-based auth if header auth failed
      if (!user) {
        const { data: { user: cookieUser }, error: sessionError } = await supabase.auth.getUser();
        if (!sessionError && cookieUser) {
          user = { id: cookieUser.id, email: cookieUser.email || '' };
          console.log('✅ User authenticated via session:', cookieUser.id);
        }
      }
      
      if (!user) {
        console.error('No authenticated user found');
        return NextResponse.json({ 
          error: 'Unauthorized',
          message: 'Session not found or expired. Please sign in again.'
        }, { status: 401 });
      }
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ 
        error: 'Authentication failed',
        message: 'Unable to verify user session'
      }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      is_student,
      year,
      major,
      skills,
      coursework,
      experience,
      target_category,
      resume_text,
      first_time = false
    } = body;

    const profileData: any = {
      uid: user.id,
      is_student: is_student ?? false,
      year,
      major,
      skills: skills || [],
      coursework: coursework || [],
      experience: experience || [],
      target_category,
      resume_text,
      first_time,
      updated_at: new Date().toISOString(),
    };

    try {
      const existingProfile = readProfile(user.id);
      if (existingProfile) {
        profileData.created_at = existingProfile.created_at;
      } else {
        profileData.created_at = new Date().toISOString();
      }

      console.log('💾 Saving profile to local file:', { uid: user.id, skillCount: profileData.skills?.length });
      const savedProfile = writeProfile(user.id, profileData);

      console.log('✅ Profile saved successfully to local file:', { id: savedProfile.uid });

      return NextResponse.json({ 
        success: true, 
        profile: savedProfile 
      });
    } catch (storageError) {
      console.error('Storage error:', storageError);
      console.error('Storage error details:', storageError instanceof Error ? storageError.stack : String(storageError));
      return NextResponse.json({ 
        error: 'Failed to save profile',
        message: storageError instanceof Error ? storageError.message : 'Unknown storage error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
