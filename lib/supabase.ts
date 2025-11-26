import { createClient } from '@supabase/supabase-js';

// Fallback keys provided by user to ensure app works in preview environment
const FALLBACK_URL = 'https://xveyftsamksweozahmdu.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZXlmdHNhbWtzd2VvemFobWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDkzNDEsImV4cCI6MjA3OTY4NTM0MX0.FPvEo_6xDfCqLeB6sq_Fb_qI-cCOkvzjyo2gTduQ7WM';

// Use cast to avoid type errors with import.meta.env
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase keys missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);