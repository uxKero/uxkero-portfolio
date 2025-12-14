-- ============================================
-- Script para agregar contador de compartidos
-- Ejecuta esto en TablePlus o DBeaver
-- ============================================

USE uxkeroblog;

-- Agregar columna share_count a la tabla blogs
ALTER TABLE blogs 
ADD COLUMN share_count INT DEFAULT 0 AFTER read_time_en;

-- Actualizar blogs existentes para que tengan 0 shares
UPDATE blogs SET share_count = 0 WHERE share_count IS NULL;

-- Verificar que se agregó correctamente
SELECT '✅ Columna share_count agregada' as mensaje;
DESCRIBE blogs;
