// Re-export for backward compatibility
// IMPORTANT: This file only exports client-safe code
// Server-side code should import directly from './supabase-server'

// Client-side exports
export { createSupabaseClient, hasSupabaseCredentials } from './supabase-client';

// Types (safe to export)
export type { Database } from './supabase-types';

// Note: Server-side functions (createSupabaseServerClient, createSupabaseDirectClient) 
// are NOT exported here to prevent client components from importing server-only code.
// Import them directly from './supabase-server' in server components/API routes.
