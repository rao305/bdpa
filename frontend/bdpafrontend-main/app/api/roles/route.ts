import { NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';

// GET /api/roles - Get all available roles
export async function GET() {
  try {
    const roles = await serverStorage.getAllRoles();
    
    // Sort by category
    const sortedRoles = roles.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return 0;
    });

    // Group roles by category for easier frontend consumption
    const rolesByCategory = sortedRoles.reduce((acc, role) => {
      if (!acc[role.category]) {
        acc[role.category] = [];
      }
      acc[role.category].push(role);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({ 
      roles: sortedRoles,
      rolesByCategory 
    });

  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
