-- ============================================
-- UXKERO Portfolio — Esquema de base de datos
-- Sistema de blog/admin (carpeta api/)
-- Base de datos: uxkeroblog
-- Ejecutar en TablePlus / DBeaver
-- ============================================

USE uxkeroblog;

-- --------------------------------------------
-- Usuarios administradores
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Blogs
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_es VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL,
  subtitle_es TEXT,
  subtitle_en TEXT,
  content_es LONGTEXT NOT NULL,
  content_en LONGTEXT NOT NULL,
  category_es VARCHAR(255),
  category_en VARCHAR(255),
  author VARCHAR(255) DEFAULT 'Alan Ponce',
  cover_image_url VARCHAR(500),
  published_at DATETIME,
  read_time_es VARCHAR(50),
  read_time_en VARCHAR(50),
  share_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Usuario admin inicial
-- Usuario: admin  /  Contraseña: admin123
-- Genera tu propio hash bcrypt (rounds: 10) y reemplázalo
-- antes de desplegar a producción.
-- --------------------------------------------
INSERT INTO admin_users (username, password_hash)
VALUES (
  'admin',
  '$2b$10$zZoXUACpSQA91lm4wDNg3u8TjGFhDJk0keflojN.ZxnNxZ5197iie'
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash);
