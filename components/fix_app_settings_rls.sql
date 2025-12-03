-- Drop existing policies for app_settings to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON app_settings;
DROP POLICY IF EXISTS "Allow update access to authenticated users" ON app_settings;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON app_settings;

-- Create permissive policies for all users (including anon)
CREATE POLICY "Enable read access for all users" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON app_settings FOR UPDATE USING (true);
