// Server-side Supabase client
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './supabase-types';

// Check if Supabase credentials are configured
export const hasSupabaseCredentials = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side Supabase client for API routes
export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  const cookieStore = await cookies();
  
  try {
    // Use createRouteHandlerClient for API routes (better cookie handling)
    const client = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore,
    });
    
    console.log('✅ Supabase server client created successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to create Supabase server client:', error);
    throw error;
  }
}

// Direct client for API routes (when you need full control)
import { createClient } from '@supabase/supabase-js';

export function createSupabaseDirectClient() {
  if (!hasSupabaseCredentials) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

