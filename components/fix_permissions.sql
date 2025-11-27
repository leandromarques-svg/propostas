-- FIX PERMISSIONS (Run this to allow saving without login)

-- 1. Drop existing strict policies
DROP POLICY IF EXISTS "Users can view own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON proposals;

-- 2. Create PUBLIC policies (allows anyone with the API key to read/write)
-- This is necessary because your login system is local, not connected to Supabase Auth yet.

CREATE POLICY "Enable read access for all users"
ON proposals FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users"
ON proposals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON proposals FOR UPDATE
USING (true);

CREATE POLICY "Enable delete access for all users"
ON proposals FOR DELETE
USING (true);
