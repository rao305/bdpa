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

const readAnalysis = (analysisId: string) => {
  try {
    const analysisPath = path.join(getAnalysesDir(), `${analysisId}.json`);
    if (fs.existsSync(analysisPath)) {
      const data = fs.readFileSync(analysisPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading analysis:', error);
    return null;
  }
};

// GET /api/analyses/[id] - Get specific analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try local file storage first (matching how analyses are saved)
    let analysis = readAnalysis(params.id);
    
    // If not found in local storage, try Supabase (for backward compatibility)
    if (!analysis) {
      analysis = await serverStorage.getAnalysis(params.id);
    }
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

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
            console.log('✅ GET analysis - User authenticated via auth header:', user.id);
          }
        }
      } else {
        console.log('✅ GET analysis - User authenticated via session:', user.id);
      }
    } catch (supabaseError) {
      console.log('🔄 Supabase auth failed (may not be configured), using fallback:', supabaseError);
      error = supabaseError;
      user = null;
    }
    
    // Fallback for local development - allow access if Supabase isn't configured or auth fails
    // In local dev, we're more permissive to allow testing
    if (error || !user) {
      console.log('🔄 No authentication found, allowing access for local development');
      // Don't create a fallback user, just skip ownership check
    }

    // Check ownership only if we have a real authenticated user
    // In local dev mode, skip ownership check to allow access
    if (user && user.id !== 'local-dev-user-123' && analysis.uid !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Enrich with role data from seed data
    let role = null;
    if (analysis.role_id) {
      role = seedRoles.find((r) => r.id === analysis.role_id);
      // If not in seed data, try Supabase (for backward compatibility)
      if (!role) {
        role = await serverStorage.getRole(analysis.role_id);
      }
    }

    return NextResponse.json({ 
      analysis: {
        ...analysis,
        roles: role ? {
          id: role.id,
          title: role.title,
          category: role.category,
          description: role.description,
          requirements: role.requirements,
        } : null,
      }
    });

  } catch (error) {
    console.error('Analysis fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/analyses/[id] - Delete specific analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try local file storage first
    let analysis = readAnalysis(params.id);
    
    // If not found in local storage, try Supabase
    if (!analysis) {
      analysis = await serverStorage.getAnalysis(params.id);
    }
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

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
    
    // Check ownership only if we have a real authenticated user
    // In local dev mode, skip ownership check to allow access
    if (user && user.id !== 'local-dev-user-123' && analysis.uid !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from local file storage if it exists
    const analysisPath = path.join(getAnalysesDir(), `${params.id}.json`);
    if (fs.existsSync(analysisPath)) {
      fs.unlinkSync(analysisPath);
    }

    // Also try to delete from Supabase (for backward compatibility)
    try {
      await serverStorage.delete('analyses', 'id', params.id);
    } catch (error) {
      // Ignore Supabase errors if using local storage
      console.warn('Could not delete from Supabase (may be using local storage):', error);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analysis delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
