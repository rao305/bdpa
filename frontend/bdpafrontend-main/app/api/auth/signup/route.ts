import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';

// Simple hash function (for demo purposes)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await serverStorage.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };

    await serverStorage.createUser(user);

    // Create profile
    await serverStorage.saveProfile({
      uid: user.id,
      first_time: true,
      is_student: false,
      year: null,
      major: null,
      skills: [],
      coursework: [],
      experience: [],
      target_category: null,
      resume_text: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      user: userWithoutPassword,
      error: null 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

