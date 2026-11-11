-- Script de criação das tabelas (MySQL / MariaDB)
-- Opcional: ao iniciar, o servidor já cria estas tabelas sozinho (Sequelize sync).

CREATE DATABASE IF NOT EXISTS aluguel_ferramentas;
USE aluguel_ferramentas;

CREATE TABLE IF NOT EXISTS usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,          -- hash bcrypt, nunca a senha pura
  telefone   VARCHAR(20),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS inventario (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario             INT NOT NULL,
  nome_item              VARCHAR(150) NOT NULL,
  descricao              TEXT,
  categoria              VARCHAR(50) NOT NULL DEFAULT 'Outros',
  preco_diaria           DECIMAL(10,2) NOT NULL,
  status_disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             DATETIME NOT NULL,
  updated_at             DATETIME NOT NULL,
  CONSTRAINT fk_inventario_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);
