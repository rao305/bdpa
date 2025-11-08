// Server-side auth helper for API routes using Supabase
import { createSupabaseServerClient, hasSupabaseCredentials } from './supabase-server';
import { cookies } from 'next/headers';

export async function getServerUser() {
  try {
    if (!hasSupabaseCredentials) {
      console.error('Supabase credentials not configured');
      throw new Error('Supabase credentials not configured');
    }
    
    // Get the cookies to check what's available for debugging
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('All available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Try to get user from cookies/session
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase auth error:', error.message);
      console.error('Auth error code:', error.status);
      
      // Check for auth cookies with different naming patterns
      const authCookies = allCookies.filter(c => 
        c.name.includes('supabase') || 
        c.name.includes('sb-') || 
        c.name.includes('auth')
      );
      console.error('Auth-related cookies:', authCookies.map(c => c.name));
      
      return null;
    }
    
    if (!user) {
      console.error('No user found in session');
      return null;
    }
    
    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    return { id: user.id, email: user.email || '' };
  } catch (error) {
    console.error('Error getting server user:', error);
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
    throw error; // Re-throw so calling code can handle it
  }
}
