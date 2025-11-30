-- OPÇÃO NUCLEAR: DESATIVAR SEGURANÇA DA TABELA
-- Isso garante que NENHUMA verificação de permissão será feita.
-- Use isso se nada mais funcionar.

ALTER TABLE team_rates DISABLE ROW LEVEL SECURITY;

-- Se quiser reativar no futuro, use:
-- ALTER TABLE team_rates ENABLE ROW LEVEL SECURITY;
