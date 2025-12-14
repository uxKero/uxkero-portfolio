-- ============================================
-- 🔄 RESTAURAR BLOG "PRINCIPIOS DE UI"
-- Este script restaura el blog que estaba hardcodeado en el frontend
-- ============================================

USE uxkeroblog;

-- Insertar el blog "Principios de UI: De la Teoría al Impacto Real"
INSERT INTO blogs (
  slug,
  title_es,
  title_en,
  subtitle_es,
  subtitle_en,
  content_es,
  content_en,
  category_es,
  category_en,
  author,
  cover_image_url,
  published_at,
  read_time_es,
  read_time_en
) VALUES (
  'principios-ui-impacto-real',
  'Principios de UI: De la Teoría al Impacto Real',
  'UI Principles: From Theory to Real Impact',
  'Por qué una interfaz "bonita" no es suficiente y cómo el diseño UI estratégico aumenta conversiones, retención y satisfacción del usuario.',
  'Why a "beautiful" interface is not enough and how strategic UI design increases conversions, retention and user satisfaction.',
  '<p>Este es el contenido del blog que tenías hardcodeado en el frontend. Puedes editarlo desde el panel de administración.</p><p>El contenido original se perdió durante la migración a la base de datos. Por favor, edita este blog desde el panel admin para restaurar el contenido completo.</p>',
  '<p>This is the content of the blog you had hardcoded in the frontend. You can edit it from the admin panel.</p><p>The original content was lost during the database migration. Please edit this blog from the admin panel to restore the full content.</p>',
  'Estrategia de Diseño',
  'Design Strategy',
  'Alan Ponce',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&auto=format&fit=crop',
  '2025-12-10 00:00:00',
  '15 min lectura',
  '15 min read'
)
ON DUPLICATE KEY UPDATE
  title_es = VALUES(title_es),
  title_en = VALUES(title_en),
  subtitle_es = VALUES(subtitle_es),
  subtitle_en = VALUES(subtitle_en),
  category_es = VALUES(category_es),
  category_en = VALUES(category_en),
  author = VALUES(author),
  cover_image_url = VALUES(cover_image_url),
  published_at = VALUES(published_at),
  read_time_es = VALUES(read_time_es),
  read_time_en = VALUES(read_time_en);

-- Verificar que se insertó correctamente
SELECT 
  id,
  slug,
  title_es,
  category_es,
  published_at,
  created_at
FROM blogs 
WHERE slug = 'principios-ui-impacto-real';

-- ============================================
-- ✅ LISTO! 
-- El blog "Principios de UI" ha sido restaurado.
-- Ahora puedes:
-- 1. Verlo en el panel admin
-- 2. Editarlo para restaurar el contenido completo
-- 3. El slug es: principios-ui-impacto-real
-- ============================================

