import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_lib/db';

// GET - Obtener un blog por slug (público)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blogs WHERE slug = ?',
      [slug]
    ) as any[];

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo blog:', error);
    return res.status(500).json({ error: 'Error obteniendo blog' });
  }
}

