import { createSupabaseClient } from './supabase-client';
import { seedRoles, seedResources } from './seed-data';

export async function seedDatabase() {
  console.log('Seeding database...');
  const supabase = createSupabaseClient();

  for (const role of seedRoles) {
    const { error } = await (supabase
      .from('roles') as any)
      .upsert(role, { onConflict: 'id' });

    if (error) {
      console.error(`Error seeding role ${role.id}:`, error);
    }
  }

  console.log('Roles seeded successfully');

  for (const resource of seedResources) {
    const { error } = await (supabase
      .from('resources') as any)
      .insert(resource);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error seeding resource:', error);
    }
  }

  console.log('Resources seeded successfully');
  console.log('Database seeding complete!');
}
