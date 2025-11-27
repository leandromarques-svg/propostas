# Supabase Setup Guide

## Passo 1: Instalar Dependências

No diretório raiz do projeto, execute:

```bash
npm install @supabase/supabase-js
```

## Passo 2: Configurar Credenciais

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL**
   - **anon/public key**

4. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

## Passo 3: Criar Tabela no Supabase

1. No Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `supabase-schema.sql`
3. Copie todo o conteúdo e cole no SQL Editor
4. Execute o SQL

Isso criará:
- Tabela `proposals` com todos os campos necessários
- Políticas de segurança (RLS) para proteger os dados
- Índices para melhor performance

## Passo 4: Testar

Após configurar, o botão "Salvar Proposta" na calculadora salvará os dados no Supabase automaticamente!

## Estrutura de Arquivos Criados

- `lib/supabase.ts` - Cliente Supabase configurado
- `lib/proposalService.ts` - Funções para salvar/carregar propostas
- `supabase-schema.sql` - Schema do banco de dados
- `.env.example` - Template de variáveis de ambiente

## Próximos Passos (Opcional)

- Criar tela para listar propostas salvas
- Adicionar funcionalidade de edição
- Implementar busca e filtros
