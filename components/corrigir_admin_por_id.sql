-- SOLUÇÃO FINAL (Usando ID)

-- 1. Copie o ID que apareceu na tela do aplicativo (no topo da janela de configuração)
-- 2. Cole no lugar de 'COLE_SEU_ID_AQUI' abaixo (mantenha as aspas)

DO $$
DECLARE
  v_user_id uuid := 'leandromarques@metarh.com.br'; -- <--- COLE O ID AQUI
BEGIN
  -- Atualiza o perfil para ser admin
  UPDATE profiles
  SET is_admin = true
  WHERE id = v_user_id;

  -- Se não atualizou nada (porque o perfil não existe), cria um novo
  IF NOT FOUND THEN
    INSERT INTO profiles (id, email, name, role, is_admin, username, password)
    VALUES (
      v_user_id, 
      'email_recuperado_do_login@metarh.com.br', -- Email provisório
      'Admin Recuperado', 
      'Admin', 
      true, 
      'admin_recuperado', 
      '123'
    );
  END IF;
  
  RAISE NOTICE 'Sucesso! ID % agora é admin.', v_user_id;
END $$;
