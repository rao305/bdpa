import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { serverStorage } from '@/lib/server-storage';

// GET /api/analyses/[id] - Get specific analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysis = await serverStorage.getAnalysis(params.id);
    
    if (!analysis || analysis.uid !== user.id) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Enrich with role data
    let role = null;
    if (analysis.role_id) {
      role = await serverStorage.getRole(analysis.role_id);
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
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysis = await serverStorage.getAnalysis(params.id);
    
    if (!analysis || analysis.uid !== user.id) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    await serverStorage.delete('analyses', 'id', params.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analysis delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
