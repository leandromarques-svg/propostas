-- Execute este comando no SQL Editor do Supabase para criar a coluna que falta
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_use_calculator BOOLEAN DEFAULT FALSE;
