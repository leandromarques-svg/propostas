# Guia de Configuração do Supabase

Este guia vai te ajudar a configurar o banco de dados Supabase para o seu projeto "Confecção de Propostas".

## Passo 1: Criar Conta e Projeto no Supabase

1.  Acesse [supabase.com](https://supabase.com) e clique em **"Start your project"**.
2.  Faça login com sua conta do GitHub (ou crie uma conta).
3.  Clique em **"New Project"**.
4.  Escolha sua organização (se tiver uma).
5.  Preencha os detalhes do projeto:
    *   **Name:** `Confeccao de Propostas` (ou o nome que preferir)
    *   **Database Password:** Crie uma senha forte e **salve-a** (você pode precisar depois, embora não para este guia básico).
    *   **Region:** Escolha a região mais próxima de você (ex: `South America (São Paulo)`).
6.  Clique em **"Create new project"**.
7.  Aguarde alguns minutos enquanto o Supabase configura seu banco de dados.

## Passo 2: Obter as Credenciais (Chaves de API)

Assim que o projeto estiver criado (status verde "Active"):

1.  No painel do seu projeto, vá em **Project Settings** (ícone de engrenagem na barra lateral esquerda).
2.  Clique em **API**.
3.  Na seção **Project URL**, copie a URL.
4.  Na seção **Project API keys**, encontre a chave `anon` `public` e copie-a.

## Passo 3: Configurar o Projeto Local

1.  Volte para o seu editor de código (VS Code).
2.  Crie um arquivo chamado `.env.local` na raiz do projeto (se não existir).
3.  Adicione o seguinte conteúdo, substituindo pelos valores que você copiou:

```env
VITE_SUPABASE_URL=cole_sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=cole_sua_anon_key_aqui
```

> **Importante:** Não coloque espaços ao redor do sinal de igual `=`.

## Passo 4: Criar a Tabela no Banco de Dados

Agora precisamos criar a tabela onde as propostas serão salvas.

1.  No painel do Supabase, clique em **SQL Editor** (ícone de terminal `>_` na barra lateral esquerda).
2.  Clique em **New query**.
3.  Copie todo o código SQL abaixo e cole no editor do Supabase:

```sql
-- Criação da tabela de propostas
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Informações Básicas
  role_name TEXT NOT NULL,
  vacancies INTEGER NOT NULL,
  salary DECIMAL NOT NULL,
  
  -- Coeficientes
  weight_complexity DECIMAL DEFAULT 1,
  
  -- Equipe
  demanded_days INTEGER DEFAULT 0,
  qty_senior INTEGER DEFAULT 0,
  qty_plena INTEGER DEFAULT 0,
  qty_junior INTEGER DEFAULT 0,
  
  -- Itens Fixos (JSON)
  fixed_items JSONB DEFAULT '[]'::jsonb,
  
  -- Margens
  profit_margin_pct DECIMAL DEFAULT 20,
  admin_fee_pct DECIMAL DEFAULT 20,
  
  -- Resultados (JSON para valores calculados)
  results JSONB,
  
  -- Rastreamento de usuário (opcional por enquanto, mas bom ter)
  user_id UUID DEFAULT auth.uid()
);

-- Habilitar segurança (Row Level Security)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer um leia/escreva (para desenvolvimento inicial)
-- ATENÇÃO: Em produção, você deve restringir isso para usuários autenticados.
CREATE POLICY "Permitir acesso público temporário"
ON proposals
FOR ALL
USING (true)
WITH CHECK (true);
```

4.  Clique em **Run** (botão verde no canto inferior direito ou superior).
5.  Você deve ver uma mensagem de "Success".

## Passo 5: Testar

1.  Reinicie seu servidor de desenvolvimento local (no terminal: `Ctrl+C` para parar, e `npm run dev` para iniciar novamente).
2.  Abra a aplicação no navegador.
3.  Preencha uma proposta na calculadora.
4.  Clique em **"Salvar Proposta"**.
5.  Verifique no painel do Supabase:
    *   Vá em **Table Editor** (ícone de tabela na barra lateral).
    *   Selecione a tabela `proposals`.
    *   Você deve ver os dados que acabou de salvar!

---

**Pronto!** Seu aplicativo agora está conectado ao Supabase.
