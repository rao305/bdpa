import { NextResponse } from 'next/server';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { serverStorage } from '@/lib/server-storage';

// POST /api/seed - Seed database with initial data
export async function POST() {
  try {
    console.log('Starting database seeding...');

    // Note: Demo user creation is handled through normal signup flow
    // Demo credentials: rao305@purdue.edu / demo11
    console.log('Demo user should be created through signup flow: rao305@purdue.edu / demo11');

    // Seed roles
    console.log('Seeding roles...');
    const existingRoles = await serverStorage.getAllRoles();

    if (existingRoles.length === 0) {
      for (const role of seedRoles) {
        await serverStorage.saveRole(role);
      }
      console.log(`Seeded ${seedRoles.length} roles`);
    } else {
      console.log('Roles already exist, skipping...');
    }

    // Seed resources
    console.log('Seeding resources...');
    const existingResources = await serverStorage.getResources();

    if (existingResources.length === 0) {
      for (const resource of seedResources) {
        await serverStorage.saveResource(resource);
      }
      console.log(`Seeded ${seedResources.length} resources`);
    } else {
      console.log('Resources already exist, skipping...');
    }

    const finalRoles = await serverStorage.getAllRoles();
    const finalResources = await serverStorage.getResources();

    console.log('Database seeding completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        roles: finalRoles.length,
        resources: finalResources.length,
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
