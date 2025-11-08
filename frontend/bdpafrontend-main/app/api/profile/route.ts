import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { serverStorage } from '@/lib/server-storage';

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await serverStorage.getProfile(user.id);

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
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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

    const profileData = {
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

    const existingProfile = await serverStorage.getProfile(user.id);
    if (existingProfile) {
      profileData.created_at = existingProfile.created_at;
    } else {
      profileData.created_at = new Date().toISOString();
    }

    const profile = await serverStorage.saveProfile(profileData);

    return NextResponse.json({ 
      success: true, 
      profile: profile 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
