-- SCRIPT DE VERIFICAÇÃO E CORREÇÃO

-- 1. Primeiro, vamos verificar se o usuário existe (independente de maiúsculas/minúsculas)
SELECT id, email, is_admin 
FROM profiles 
WHERE email ILIKE 'leandromarques@metarh.com.br';

-- SE A CONSULTA ACIMA NÃO RETORNAR NADA:
-- Significa que o email está errado ou o usuário ainda não tem perfil criado na tabela 'profiles'.

-- 2. Se o usuário apareceu, execute a atualização forçada:
UPDATE profiles
SET is_admin = true
WHERE email ILIKE 'leandromarques@metarh.com.br';

-- 3. Confirme se funcionou:
SELECT email, is_admin 
FROM profiles 
WHERE email ILIKE 'leandromarques@metarh.com.br';

-- O resultado deve mostrar "t" ou "true" na coluna is_admin.
