-- Script de criação das tabelas (PostgreSQL / Supabase)
-- Opcional: ao iniciar, o servidor já cria estas tabelas sozinho (Sequelize sync).
-- No Supabase: menu "SQL Editor" > cole este script > Run.

CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,          -- hash bcrypt, nunca a senha pura
  telefone   VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventario (
  id                     SERIAL PRIMARY KEY,
  id_usuario             INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_item              VARCHAR(150) NOT NULL,
  descricao              TEXT,
  categoria              VARCHAR(50) NOT NULL DEFAULT 'Outros',
  preco_diaria           DECIMAL(10,2) NOT NULL,
  status_disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
