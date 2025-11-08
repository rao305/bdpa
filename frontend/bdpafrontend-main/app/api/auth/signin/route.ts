import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Sign in using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = {
      id: data.user.id,
      email: data.user.email || '',
    };

    return NextResponse.json({ 
      user: userWithoutPassword,
      error: null 
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
