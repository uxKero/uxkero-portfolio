import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_lib/db';
import { getAuthToken, verifyToken } from '../_lib/auth';
import bcrypt from 'bcryptjs';

// GET - Obtener todos los blogs (público)
// POST - Crear blog (requiere autenticación)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM blogs ORDER BY published_at DESC, created_at DESC'
      ) as any[];

      return res.json(rows);
    } catch (error) {
      console.error('Error obteniendo blogs:', error);
      return res.status(500).json({ error: 'Error obteniendo blogs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const token = getAuthToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }

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

      if (!slug || !title_es || !title_en || !content_es || !content_en) {
        return res.status(400).json({
          error: 'Slug, título (ES/EN) y contenido (ES/EN) son requeridos',
        });
      }

      const [result] = await pool.query(
        `INSERT INTO blogs (
          slug, title_es, title_en, subtitle_es, subtitle_en,
          content_es, content_en, category_es, category_en,
          author, cover_image_url, published_at, read_time_es, read_time_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ]
      ) as any[];

      const [newBlog] = await pool.query(
        'SELECT * FROM blogs WHERE id = ?',
        [result.insertId]
      ) as any[];

      return res.status(201).json(newBlog[0]);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El slug ya existe' });
      }
      console.error('Error creando blog:', error);
      return res.status(500).json({ error: 'Error creando blog' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

