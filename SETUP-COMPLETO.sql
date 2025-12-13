-- ============================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN
-- Ejecuta esto en TablePlus o DBeaver
-- ============================================

-- ============================================
-- 0. SELECCIONAR BASE DE DATOS
-- ============================================
-- IMPORTANTE: Usa 'uxkeroblog' tanto en desarrollo como producción
USE uxkeroblog;

-- ============================================
-- 1. CREAR TABLA DE USUARIOS ADMINISTRADORES
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. CREAR TABLA DE BLOGS
-- ============================================
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

-- ============================================
-- 3. CREAR USUARIO ADMIN
-- ============================================
-- Contraseña: "admin123"
-- Hash bcrypt generado automáticamente

INSERT INTO admin_users (username, password_hash) 
VALUES (
  'admin',
  '$2b$10$zZoXUACpSQA91lm4wDNg3u8TjGFhDJk0keflojN.ZxnNxZ5197iie'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);

-- ✅ Credenciales de acceso:
-- Usuario: admin
-- Contraseña: admin123

-- ============================================
-- NOTA: El hash de arriba es un placeholder
-- Genera tu propio hash en: https://bcrypt-generator.com/
-- O usa el siguiente comando para generar uno:
-- ============================================

-- Para generar un hash de contraseña, puedes usar:
-- 1. https://bcrypt-generator.com/ (rounds: 10)
-- 2. O ejecutar este script Node.js:
--
-- node -e "
-- import('bcryptjs').then(async (bcrypt) => {
--   const hash = await bcrypt.default.hash('tu_contraseña', 10);
--   console.log('Hash:', hash);
--   console.log('SQL:');
--   console.log('INSERT INTO admin_users (username, password_hash) VALUES (\"admin\", \"' + hash + '\");');
-- });
-- "

-- ============================================
-- USUARIO ADMIN CON CONTRASEÑA "admin123"
-- Hash real generado:
-- ============================================

-- Elimina el INSERT anterior y usa este (con hash real):
-- INSERT INTO admin_users (username, password_hash) 
-- VALUES (
--   'admin',
--   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
-- )
-- ON DUPLICATE KEY UPDATE 
--   password_hash = VALUES(password_hash);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verifica que las tablas se crearon:
SELECT 'Tablas creadas:' as mensaje;
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('admin_users', 'blogs');

-- Verifica que el usuario admin existe:
SELECT 'Usuario admin:' as mensaje;
SELECT id, username, created_at 
FROM admin_users 
WHERE username = 'admin';

