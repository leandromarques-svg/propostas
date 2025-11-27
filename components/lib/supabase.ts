// Supabase Client Configuration
// 
// IMPORTANT: Create a .env.local file in the root of your project with:
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
//
// Get these values from: https://app.supabase.com/project/_/settings/api

import { createClient } from '@supabase/supabase-js';

// Fallback to prevent crash if credentials are missing
// Support both Next.js (process.env) and Vite (import.meta.env)
const getEnv = (key: string, viteKey: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env[viteKey]) return import.meta.env[viteKey];
    } catch (e) { }
    return '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);
