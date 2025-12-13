-- ============================================
-- Script SQL para crear las tablas
-- Ejecuta esto en TablePlus o DBeaver
-- ============================================

-- Seleccionar base de datos
-- IMPORTANTE: Cambia según tu entorno
-- Desarrollo local: USE uxkeroblog;
-- Producción Railway: USE railway;

USE uxkeroblog;
-- O descomenta para Railway:
-- USE railway;

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de blogs
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

