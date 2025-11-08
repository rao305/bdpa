// Client-side Supabase client
'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

// Check if Supabase credentials are configured
export const hasSupabaseCredentials = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client-side Supabase client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseClient() {
  if (!hasSupabaseCredentials) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  // Return singleton instance for client-side
  if (typeof window !== 'undefined' && clientInstance) {
    return clientInstance;
  }
  
  if (typeof window === 'undefined') {
    throw new Error('createSupabaseClient can only be used on the client side');
  }
  
  clientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
  
  return clientInstance;
}

