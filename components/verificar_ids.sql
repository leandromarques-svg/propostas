-- SCRIPT DE DIAGNÓSTICO DE IDs

-- Este script compara a tabela de login (auth.users) com a tabela de perfis (profiles).
-- O objetivo é ver se o ID do seu login é o mesmo do seu perfil.

SELECT 
    au.email as "Email de Login (Auth)",
    au.id as "ID de Login (Auth)",
    p.email as "Email do Perfil",
    p.id as "ID do Perfil",
    p.is_admin as "É Admin?",
    CASE 
        WHEN au.id = p.id THEN 'OK' 
        ELSE 'ERRO: IDs Diferentes' 
    END as "Status"
FROM auth.users au
FULL OUTER JOIN profiles p ON au.email = p.email
WHERE au.email ILIKE '%metarh%' OR p.email ILIKE '%metarh%';

-- Se você ver "ERRO: IDs Diferentes" ao lado do seu email, esse é o problema!
-- O ID do Perfil DEVE ser igual ao ID de Login.
