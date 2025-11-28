// Supabase Client Configuration
//
// IMPORTANT: Create a .env.local file in the root of your project with:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
//
// Get these values from: https://app.supabase.com/project/_/settings/api

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env.local file.');
}

// Create the client only if keys are present, otherwise create a dummy client or handle gracefully
// For now, we allow it to be created but it might fail on requests if keys are empty.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);