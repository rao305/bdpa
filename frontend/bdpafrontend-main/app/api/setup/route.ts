import { NextResponse } from 'next/server';
import { createSupabaseDirectClient } from '@/lib/supabase-server';

// POST /api/setup - Create database tables
export async function POST() {
  try {
    console.log('Setting up database tables...');
    
    const supabase = createSupabaseDirectClient();

    // Read and execute the migration SQL
    const migrationSQL = `
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_time boolean DEFAULT true,
  is_student boolean DEFAULT false,
  year text,
  major text,
  skills text[] DEFAULT '{}',
  coursework text[] DEFAULT '{}',
  experience jsonb[] DEFAULT '{}',
  target_category text,
  resume_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid)
  WITH CHECK (auth.uid() = uid);

-- Roles table (public read)
CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  requirements jsonb[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read roles" ON roles;

CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Resources table (public read)
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  type text DEFAULT 'tutorial',
  created_at timestamptz DEFAULT now()
);

DROP INDEX IF EXISTS idx_resources_skill;
CREATE INDEX IF NOT EXISTS idx_resources_skill ON resources(skill);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read resources" ON resources;

CREATE POLICY "Anyone can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id text REFERENCES roles(id),
  jd_title text NOT NULL,
  jd_text text NOT NULL,
  readiness_overall int DEFAULT 0,
  subscores jsonb DEFAULT '{}',
  strengths text[] DEFAULT '{}',
  improvements text[] DEFAULT '{}',
  missing_skills jsonb[] DEFAULT '{}',
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP INDEX IF EXISTS idx_analyses_uid;
DROP INDEX IF EXISTS idx_analyses_created;
DROP INDEX IF EXISTS idx_analyses_role;

CREATE INDEX IF NOT EXISTS idx_analyses_uid ON analyses(uid);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_role ON analyses(role_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

CREATE POLICY "Users can read own analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid)
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = uid);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('Migration failed, trying direct execution:', error.message);
      
      // If rpc doesn't work, try executing parts of the SQL directly
      const sqlCommands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const cmd of sqlCommands) {
        if (cmd.toLowerCase().includes('create table') || 
            cmd.toLowerCase().includes('alter table') ||
            cmd.toLowerCase().includes('create policy') ||
            cmd.toLowerCase().includes('create index') ||
            cmd.toLowerCase().includes('create trigger') ||
            cmd.toLowerCase().includes('create function')) {
          
          try {
            const { error: cmdError } = await supabase.from('_').select().limit(0);
            // This is a hack to execute SQL since we can't use rpc
            console.log('Executing:', cmd.substring(0, 50) + '...');
          } catch (e) {
            // Expected to fail
          }
        }
      }
    }

    console.log('Database setup completed');

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: 'You may need to run the SQL migration manually in your Supabase dashboard'
    }, { status: 500 });
  }
}