-- Remove a coluna de string única para substituir por JSONB
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_presentation_url') THEN
    ALTER TABLE profiles DROP COLUMN custom_presentation_url;
  END IF;
END $$;

-- Adiciona coluna JSONB para links de apresentação personalizados por solução
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_presentation_urls JSONB DEFAULT '{}'::jsonb;
