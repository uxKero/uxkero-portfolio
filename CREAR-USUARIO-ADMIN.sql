-- ============================================
-- CREAR USUARIO ADMINISTRADOR
-- Ejecuta esto DESPUÉS de crear las tablas
-- ============================================

-- Seleccionar base de datos
-- Cambia según tu entorno:
USE uxkeroblog;
-- O para Railway: USE railway;

-- ============================================

-- ============================================
-- OPCIÓN 1: Usar este hash pre-generado
-- Contraseña: "admin123"
-- ============================================
-- Ejecuta este INSERT directamente:

INSERT INTO admin_users (username, password_hash) 
VALUES (
  'admin',
  '$2b$10$zZoXUACpSQA91lm4wDNg3u8TjGFhDJk0keflojN.ZxnNxZ5197iie'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);

-- ✅ Credenciales:
-- Usuario: admin
-- Contraseña: admin123

-- ============================================
-- OPCIÓN 2: Generar tu propio hash
-- ============================================
-- 1. Ve a: https://bcrypt-generator.com/
-- 2. Ingresa tu contraseña
-- 3. Rounds: 10
-- 4. Copia el hash generado
-- 5. Reemplaza el hash en el INSERT de arriba

-- ============================================
-- OPCIÓN 3: Usar script Node.js
-- ============================================
-- Crea un archivo temporal: generar-hash.js
-- 
-- import bcrypt from 'bcryptjs';
-- const password = 'tu_contraseña_aqui';
-- const hash = await bcrypt.hash(password, 10);
-- console.log('Hash:', hash);
-- console.log('\nSQL:');
-- console.log(`INSERT INTO admin_users (username, password_hash) VALUES ('admin', '${hash}');`);
--
-- Ejecuta: node generar-hash.js

-- ============================================
-- VERIFICAR
-- ============================================
SELECT id, username, created_at 
FROM admin_users 
WHERE username = 'admin';

