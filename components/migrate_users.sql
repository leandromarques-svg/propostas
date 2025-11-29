-- Script para migrar usuários antigos para a tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Primeiro, limpe a tabela se houver dados de teste
TRUNCATE TABLE profiles;

-- Agora insira os usuários com UUIDs válidos
-- Substitua os dados abaixo pelos usuários reais que você quer manter

INSERT INTO profiles (id, username, password, name, role, email, phone, linkedin, bio, avatar_url, is_admin)
VALUES 
  (
    gen_random_uuid(), 
    'leandro', 
    '123', 
    'Leandro', 
    'Diretor Comercial', 
    'leandro@metarh.com.br', 
    '(11) 99999-8888', 
    'linkedin.com/in/leandro-metarh', 
    'Especialista em recrutamento e soluções de RH', 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',  -- Cole a URL do avatar se tiver
    true
  );

-- Adicione mais usuários conforme necessário
-- INSERT INTO profiles (id, username, password, name, role, email, phone, linkedin, bio, avatar_url, is_admin)
-- VALUES (gen_random_uuid(), 'usuario2', 'senha', 'Nome', 'Cargo', 'email@exemplo.com', '(11) 1234-5678', '', '', '', false);
