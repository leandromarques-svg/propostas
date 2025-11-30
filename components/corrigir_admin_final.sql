-- SOLUÇÃO DEFINITIVA V2 (Case Insensitive)

-- O problema: O ID do seu perfil não está batendo com o ID do seu login.
-- A solução: Vamos pegar o ID correto do seu login e atualizar o perfil.

-- Execute este bloco inteiro de uma vez:

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'leandromarques@metarh.com.br'; -- SEU EMAIL AQUI
BEGIN
  -- 1. Busca o ID correto na tabela de autenticação (IGNORANDO MAIÚSCULAS/MINÚSCULAS)
  SELECT id INTO v_user_id FROM auth.users WHERE email ILIKE v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERRO FATAL: Usuário com email % não encontrado no sistema de login (auth.users). Verifique se o email está correto.', v_email;
  END IF;

  RAISE NOTICE 'Usuário encontrado! ID: %', v_user_id;

  -- 2. Tenta atualizar o perfil existente para usar o ID correto e ser admin
  -- Primeiro, removemos qualquer perfil que possa estar com o ID errado mas com o mesmo email
  DELETE FROM profiles WHERE email ILIKE v_email AND id != v_user_id;

  -- Agora inserimos ou atualizamos o perfil correto
  INSERT INTO profiles (id, email, name, role, is_admin, username, password)
  VALUES (
    v_user_id, 
    v_email, 
    'Leandro', 
    'Admin', 
    true, 
    'leandro', 
    '123'
  )
  ON CONFLICT (id) DO UPDATE
  SET is_admin = true,
      email = EXCLUDED.email;

  RAISE NOTICE 'SUCESSO TOTAL! Usuário % agora é admin com o ID correto: %', v_email, v_user_id;
END $$;
