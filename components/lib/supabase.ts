// Supabase Client Configuration
// 
// IMPORTANT: Create a .env.local file in the root of your project with:
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
//
// Get these values from: https://app.supabase.com/project/_/settings/api

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please add them to your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
