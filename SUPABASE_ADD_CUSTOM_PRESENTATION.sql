-- Adiciona coluna para link de apresentação personalizada no perfil do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_presentation_url TEXT;
