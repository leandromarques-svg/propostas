-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Using TEXT to match existing 'u123' format or UUID
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Storing plain/hashed password (insecure but matches current local app)
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public access policies (since login is local)
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON profiles FOR DELETE USING (true);
