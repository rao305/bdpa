import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { seedRoles } from '@/lib/seed-data';
import fs from 'fs';
import path from 'path';

// Helper functions for local file storage (matching analyze route)
const getAnalysesDir = () => {
  const dir = path.join(process.cwd(), 'data', 'analyses');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const readAllAnalyses = (userId: string) => {
  try {
    const analysesDir = getAnalysesDir();
    const files = fs.readdirSync(analysesDir);
    const analyses = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(analysesDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const analysis = JSON.parse(data);
        
        // Filter by user ID
        if (analysis.uid === userId) {
          analyses.push(analysis);
        }
      }
    }
    
    // Sort by created_at descending (newest first)
    analyses.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    return analyses;
  } catch (error) {
    console.error('Error reading analyses:', error);
    return [];
  }
};

// GET /api/analyses - Get user's analysis history
export async function GET(request: NextRequest) {
  try {
    // Use same authentication pattern as analyze route (with fallback for local dev)
    let user: any = null;
    let error: any = null;
    
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase-server');
      const supabase = await createSupabaseServerClient();
      
      // Try to get user from session first (cookies)
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;
      error = authResult.error;
      
      // If session auth failed, try authorization header
      if (error || !user) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const tokenResult = await supabase.auth.getUser(token);
          if (!tokenResult.error && tokenResult.data.user) {
            user = tokenResult.data.user;
            error = null;
          }
        }
      }
    } catch (supabaseError) {
      console.log('🔄 Supabase auth failed (may not be configured), using fallback:', supabaseError);
      error = supabaseError;
      user = null;
    }
    
    // Fallback for local development - use a default user ID to read all analyses
    // In local dev, we're more permissive to allow testing
    const userId = user?.id || 'local-dev-user-123';

    // Try local file storage first
    let analyses = readAllAnalyses(userId);
    
    // If no analyses found in local storage, try Supabase (for backward compatibility)
    if (analyses.length === 0 && user) {
      analyses = await serverStorage.getAnalyses(user.id);
    }
    
    // In local dev mode, if no user, return all analyses (for testing)
    if (!user && analyses.length === 0) {
      // Try reading all analyses without filtering by user
      const analysesDir = getAnalysesDir();
      const files = fs.readdirSync(analysesDir);
      analyses = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(analysesDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const analysis = JSON.parse(data);
          analyses.push(analysis);
        }
      }
      
      // Sort by created_at descending (newest first)
      analyses.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
    
    // Enrich with role data from seed data
    const enrichedAnalyses = analyses.map((analysis) => {
      let role = null;
      if (analysis.role_id) {
        role = seedRoles.find((r) => r.id === analysis.role_id);
        // If not in seed data, try Supabase (for backward compatibility)
        if (!role) {
          // Note: We can't await in map, so we'll handle this synchronously
          // For now, just use seed data
        }
      }
      return {
        ...analysis,
        roles: role ? {
          id: role.id,
          title: role.title,
          category: role.category,
        } : null,
      };
    });

    return NextResponse.json({ analyses: enrichedAnalyses });

  } catch (error) {
    console.error('Analyses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
