-- 1. Create Tables if they don't exist
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  role_name TEXT NOT NULL,
  vacancies INTEGER NOT NULL,
  salary NUMERIC NOT NULL,
  weight_job_level NUMERIC NOT NULL,
  weight_location NUMERIC NOT NULL,
  weight_work_model NUMERIC NOT NULL,
  weight_urgency NUMERIC NOT NULL,
  weight_profile_difficulty NUMERIC NOT NULL,
  demanded_days INTEGER NOT NULL,
  qty_senior INTEGER NOT NULL,
  qty_plena INTEGER NOT NULL,
  qty_junior INTEGER NOT NULL,
  fixed_items JSONB DEFAULT '[]'::jsonb,
  profit_margin_pct NUMERIC NOT NULL,
  admin_fee_pct NUMERIC NOT NULL,
  results JSONB,
  user_id UUID
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- We use the same ID as the local user ID (or generated UUID)
  username TEXT UNIQUE NOT NULL,
  password TEXT, -- Storing plain text for this local-auth demo (NOT RECOMMENDED FOR PRODUCTION)
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON proposals;
DROP POLICY IF EXISTS "Enable insert access for all users" ON proposals;
DROP POLICY IF EXISTS "Enable update access for all users" ON proposals;
DROP POLICY IF EXISTS "Enable delete access for all users" ON proposals;

DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete access for all users" ON profiles;

-- 4. Create permissive policies for anon (public) access
-- Note: In a real production app with Supabase Auth, you would use 'authenticated' role and check user_id.
-- Since we are using local auth, we allow public access for now.

-- PROPOSALS
CREATE POLICY "Enable read access for all users" ON proposals FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON proposals FOR DELETE USING (true);

-- PROFILES
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON profiles FOR DELETE USING (true);
