import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_lib/db';
import { getAuthToken, verifyToken } from '../_lib/auth';

// PUT - Actualizar blog (requiere autenticación)
// DELETE - Eliminar blog (requiere autenticación)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  // Verificar autenticación
  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID requerido' });
  }

  if (req.method === 'PUT') {
    try {
      const {
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
        read_time_en,
      } = req.body;

      const [result] = await pool.query(
        `UPDATE blogs SET
          slug = ?, title_es = ?, title_en = ?, subtitle_es = ?, subtitle_en = ?,
          content_es = ?, content_en = ?, category_es = ?, category_en = ?,
          author = ?, cover_image_url = ?, published_at = ?,
          read_time_es = ?, read_time_en = ?
        WHERE id = ?`,
        [
          slug,
          title_es,
          title_en,
          subtitle_es || null,
          subtitle_en || null,
          content_es,
          content_en,
          category_es || null,
          category_en || null,
          author || 'Alan Ponce',
          cover_image_url || null,
          published_at || null,
          read_time_es || null,
          read_time_en || null,
          id,
        ]
      ) as any[];

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Blog no encontrado' });
      }

      const [updatedBlog] = await pool.query(
        'SELECT * FROM blogs WHERE id = ?',
        [id]
      ) as any[];

      return res.json(updatedBlog[0]);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El slug ya existe' });
      }
      console.error('Error actualizando blog:', error);
      return res.status(500).json({ error: 'Error actualizando blog' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]) as any[];

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Blog no encontrado' });
      }

      return res.json({ message: 'Blog eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando blog:', error);
      return res.status(500).json({ error: 'Error eliminando blog' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

