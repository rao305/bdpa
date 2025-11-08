import { NextResponse } from 'next/server';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { serverStorage } from '@/lib/server-storage';

// POST /api/seed - Seed database with initial data
export async function POST() {
  try {
    console.log('Starting database seeding...');

    // Seed demo user
    console.log('Seeding demo user...');
    const demoEmail = 'rao305@purdue.edu';
    const demoPassword = 'demo1';
    const existingDemoUser = await serverStorage.getUserByEmail(demoEmail);
    
    if (!existingDemoUser) {
      // Create user using Supabase Auth (password will be hashed by Supabase)
      const demoUser = await serverStorage.createUser({
        email: demoEmail,
        password: demoPassword,
      });
      
      // Create demo profile with minimal data (user will fill it out)
      await serverStorage.saveProfile({
        uid: demoUser.id,
        first_time: true,
        is_student: false,
        year: null,
        major: null,
        skills: [],
        coursework: [],
        experience: [],
        target_category: null,
        resume_text: null,
      });
      
      console.log('Demo user created:', demoEmail);
    } else {
      // Update existing demo user profile to have minimal data
      const existingProfile = await serverStorage.getProfile(existingDemoUser.id);
      if (existingProfile) {
        await serverStorage.saveProfile({
          ...(existingProfile as any),
          first_time: true,
          is_student: false,
          year: null,
          major: null,
          skills: [],
          coursework: [],
          experience: [],
          target_category: null,
          resume_text: null,
          updated_at: new Date().toISOString(),
        });
        console.log('Demo user profile reset to minimal data');
      } else {
        // Create profile if it doesn't exist
        await serverStorage.saveProfile({
          uid: existingDemoUser.id,
          first_time: true,
          is_student: false,
          year: null,
          major: null,
          skills: [],
          coursework: [],
          experience: [],
          target_category: null,
          resume_text: null,
        });
        console.log('Demo user profile created');
      }
    }

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
        demoUser: existingDemoUser ? 'already exists' : 'created',
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
