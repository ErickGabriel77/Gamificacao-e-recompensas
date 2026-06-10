-- Cria o banco
CREATE DATABASE IF NOT EXISTS gamemarket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gamemarket;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM profiles;
SELECT * FROM comments;
SELECT * FROM gift_codes;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  user_id                   INT           NOT NULL UNIQUE,
  level                     INT           DEFAULT 1,
  xp                        INT           DEFAULT 0,
  points                    INT           DEFAULT 0,
  badges                    JSON,
  purchases                 JSON,
  shares                    JSON,
  ratings                   JSON,
  missions                  JSON          DEFAULT NULL,
  mission_date              VARCHAR(50)   DEFAULT NULL,
  all_missions_reward_given TINYINT(1)    DEFAULT 0,
  total_purchases           INT           DEFAULT 0,
  total_ratings             INT           DEFAULT 0,
  total_shares              INT           DEFAULT 0,
  total_spent               DECIMAL(10,2) DEFAULT 0.00,
  total_comments            INT           DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  game_id    VARCHAR(20)  NOT NULL,
  user_id    INT          NOT NULL,
  username   VARCHAR(50)  NOT NULL,
  content    TEXT         NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_comment (game_id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de gift codes
CREATE TABLE IF NOT EXISTS gift_codes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  game_id    VARCHAR(20)  NOT NULL,
  code       VARCHAR(20)  NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_purchase (user_id, game_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);