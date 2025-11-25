
import { createClient } from '@supabase/supabase-js';

// Acessa as variáveis de ambiente definidas no .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ATENÇÃO: Variáveis do Supabase não encontradas. Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
