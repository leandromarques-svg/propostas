-- SCRIPT PARA LIBERAR ALTERAÇÃO PARA TODOS OS USUÁRIOS (CORRIGIDO)

-- 1. Remove políticas antigas ou existentes para evitar erros
DROP POLICY IF EXISTS "Only admins can update rates" ON team_rates;
DROP POLICY IF EXISTS "Authenticated users can update rates" ON team_rates;
DROP POLICY IF EXISTS "Anyone can read rates" ON team_rates;

-- 2. Cria a política que permite qualquer usuário logado atualizar
CREATE POLICY "Authenticated users can update rates" 
ON team_rates FOR ALL 
USING (
  auth.role() = 'authenticated'
);

-- 3. Recria a política de leitura
CREATE POLICY "Anyone can read rates" 
ON team_rates FOR SELECT 
USING (true);
