import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { serverStorage } from '@/lib/server-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Sign up using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create profile for new user
    await serverStorage.saveProfile({
      uid: data.user.id,
      first_time: true,
      is_student: false,
      year: null,
      major: null,
      skills: [],
      coursework: [],
      experience: [],
      target_category: null,
      resume_text: null,
    });

    // Return user without sensitive data
    const userWithoutPassword = {
      id: data.user.id,
      email: data.user.email || '',
    };

    return NextResponse.json({ 
      user: userWithoutPassword,
      error: null 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
