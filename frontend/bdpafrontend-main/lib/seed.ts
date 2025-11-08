import { supabase } from './supabase';
import { seedRoles, seedResources } from './seed-data';

export async function seedDatabase() {
  console.log('Seeding database...');

  for (const role of seedRoles) {
    const { error } = await supabase
      .from('roles')
      .upsert(role, { onConflict: 'id' });

    if (error) {
      console.error(`Error seeding role ${role.id}:`, error);
    }
  }

  console.log('Roles seeded successfully');

  for (const resource of seedResources) {
    const { error } = await supabase
      .from('resources')
      .insert(resource);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error seeding resource:', error);
    }
  }

  console.log('Resources seeded successfully');
  console.log('Database seeding complete!');
}
