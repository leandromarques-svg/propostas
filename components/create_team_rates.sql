-- Create team_rates table for storing hourly rates
CREATE TABLE IF NOT EXISTS team_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type TEXT NOT NULL UNIQUE, -- 'senior', 'plena', 'junior'
  hourly_rate DECIMAL NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES profiles(id)
);

-- Enable Row Level Security
ALTER TABLE team_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read rates
CREATE POLICY "Anyone can read rates" 
ON team_rates FOR SELECT 
USING (true);

-- Policy: Only admins can update rates
CREATE POLICY "Only admins can update rates" 
ON team_rates FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Insert default values
INSERT INTO team_rates (rate_type, hourly_rate) VALUES
  ('senior', 150.00),
  ('plena', 100.00),
  ('junior', 60.00)
ON CONFLICT (rate_type) DO NOTHING;
