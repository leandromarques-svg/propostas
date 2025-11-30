-- SCRIPT PARA DESCOBRIR O EMAIL CORRETO

-- O erro disse que o email 'leandromarques@metarh.com.br' não existe no login.
-- Vamos listar TODOS os emails que existem no sistema para você encontrar o certo.

SELECT id, email, last_sign_in_at 
FROM auth.users 
ORDER BY last_sign_in_at DESC;

-- Rode este script e procure na lista qual é o seu email verdadeiro.
-- Depois, use esse email correto no script 'corrigir_admin_final.sql'.
