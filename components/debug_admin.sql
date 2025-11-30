-- SCRIPT DE DIAGNÓSTICO

-- 1. Rode este comando para ver TODOS os usuários cadastrados e se são admins:
SELECT email, is_admin, id FROM profiles;

-- 2. Procure seu email na lista.
-- Se o seu email NÃO aparecer:
--    Significa que seu usuário não tem um perfil criado na tabela 'profiles'.
--    Isso pode acontecer se o cadastro não foi concluído corretamente.

-- Se o seu email aparecer, mas is_admin for 'false' ou 'null':
--    Copie o ID que aparece ao lado do seu email e rode:
--    UPDATE profiles SET is_admin = true WHERE id = 'COLE_SEU_ID_AQUI';

-- 3. Se você não encontrar NENHUM usuário:
--    Tente rodar este comando para ver os usuários do sistema de autenticação:
--    SELECT id, email FROM auth.users;
