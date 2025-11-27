-- Supabase Database Schema for Proposals
-- Run this SQL in your Supabase SQL Editor

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Basic Info
  role_name TEXT NOT NULL,
  vacancies INTEGER NOT NULL,
  salary DECIMAL NOT NULL,
  
  -- Coefficients
  weight_job_level DECIMAL DEFAULT 1,
  weight_location DECIMAL DEFAULT 0.5,
  weight_work_model DECIMAL DEFAULT 0.5,
  weight_urgency DECIMAL DEFAULT 0.5,
  weight_profile_difficulty DECIMAL DEFAULT 0.5,
  
  -- Team
  demanded_days INTEGER DEFAULT 0,
  qty_senior INTEGER DEFAULT 0,
  qty_plena INTEGER DEFAULT 0,
  qty_junior INTEGER DEFAULT 0,
  
  -- Fixed Items (JSON)
  fixed_items JSONB DEFAULT '[]'::jsonb,
  
  -- Margins
  profit_margin_pct DECIMAL DEFAULT 20,
  admin_fee_pct DECIMAL DEFAULT 20,
  
  -- Results (JSON for calculated values)
  results JSONB,
  
  -- User tracking
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON proposals;

-- Create RLS policies
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS proposals_user_id_idx ON proposals(user_id);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON proposals(created_at DESC);
