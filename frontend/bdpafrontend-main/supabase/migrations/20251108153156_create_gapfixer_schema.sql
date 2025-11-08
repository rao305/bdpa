/*
  # GapFixer Database Schema

  1. New Tables
    - `profiles`
      - `uid` (uuid, foreign key to auth.users)
      - `first_time` (boolean, default true)
      - `is_student` (boolean)
      - `year` (text, academic year)
      - `major` (text)
      - `skills` (text[], normalized skill tokens)
      - `coursework` (text[], course names)
      - `experience` (jsonb[], array of {type, duration, description})
      - `target_category` (text, industry target)
    
    - `roles`
      - `id` (text, primary key)
      - `title` (text)
      - `category` (text, industry category)
      - `description` (text)
      - `requirements` (jsonb[], array of {skill, weight, priority})
    
    - `resources`
      - `id` (uuid, primary key)
      - `skill` (text, normalized skill name)
      - `title` (text)
      - `url` (text)
      - `type` (text, e.g., tutorial, course, doc)
    
    - `analyses`
      - `id` (uuid, primary key)
      - `uid` (uuid, foreign key to auth.users)
      - `role_id` (text, foreign key to roles)
      - `jd_title` (text, job title)
      - `jd_text` (text, full job description)
      - `readiness_overall` (int, 0-100)
      - `subscores` (jsonb, {ats, alignment, impact, polish, potential})
      - `strengths` (text[], identified strengths)
      - `improvements` (text[], areas to improve)
      - `missing_skills` (jsonb[], [{skill, weight, resources[]}])
      - `meta` (jsonb, additional metrics for dashboard)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data
*/

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

CREATE INDEX IF NOT EXISTS idx_resources_skill ON resources(skill);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_analyses_uid ON analyses(uid);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_role ON analyses(role_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

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

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
