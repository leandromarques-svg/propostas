-- PASSO A PASSO PARA CORRIGIR O ERRO DE PERMISSÃO

-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. Entre no seu projeto
-- 3. No menu lateral esquerdo, clique em "SQL Editor"
-- 4. Clique em "New Query"
-- 5. Cole o código abaixo (substitua o email pelo seu email de login) e clique em "Run"

-- Substitua 'seu_email@aqui.com' pelo email que você usa para logar no sistema
UPDATE profiles
SET is_admin = true
WHERE email = 'seu_email@aqui.com';  -- <--- COLOQUE SEU EMAIL AQUI

-- Verifique se funcionou rodando esta linha:
SELECT email, is_admin FROM profiles WHERE is_admin = true;
