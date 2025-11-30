-- SCRIPT PARA LIBERAR ALTERAÇÃO PARA TODOS OS USUÁRIOS

-- 1. Remove a política antiga que exigia ser admin
DROP POLICY IF EXISTS "Only admins can update rates" ON team_rates;

-- 2. Cria uma nova política que permite qualquer usuário logado atualizar
CREATE POLICY "Authenticated users can update rates" 
ON team_rates FOR ALL 
USING (
  auth.role() = 'authenticated'
);

-- 3. Garante que a política de leitura continua existindo (caso não exista)
DROP POLICY IF EXISTS "Anyone can read rates" ON team_rates;
CREATE POLICY "Anyone can read rates" 
ON team_rates FOR SELECT 
USING (true);
