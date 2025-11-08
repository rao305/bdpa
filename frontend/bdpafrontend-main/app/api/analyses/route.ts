import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { serverStorage } from '@/lib/server-storage';

// GET /api/analyses - Get user's analysis history
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await serverStorage.getAnalyses(user.id);
    
    // Enrich with role data
    const enrichedAnalyses = await Promise.all(analyses.map(async (analysis) => {
      let role = null;
      if (analysis.role_id) {
        role = await serverStorage.getRole(analysis.role_id);
      }
      return {
        ...analysis,
        roles: role ? {
          id: role.id,
          title: role.title,
          category: role.category,
        } : null,
      };
    }));

    return NextResponse.json({ analyses: enrichedAnalyses });

  } catch (error) {
    console.error('Analyses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
