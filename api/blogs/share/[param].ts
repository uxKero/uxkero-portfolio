import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../../lib/db.js';

// POST - Incrementar contador de compartidos (público)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const pool = getPool();
    const { param } = req.query;

    if (!param || typeof param !== 'string') {
      return res.status(400).json({ error: 'Parámetro requerido' });
    }

    // Decodificar el parámetro
    let decodedParam: string;
    try {
      decodedParam = decodeURIComponent(param);
    } catch (e) {
      decodedParam = param;
    }

    // Buscar el blog por slug
    let [rows] = await pool.query(
      'SELECT id, slug, share_count FROM blogs WHERE slug = ?',
      [decodedParam]
    ) as any[];

    // Si no se encuentra, intentar con mapeo inverso
    if (rows.length === 0) {
      // Función para obtener slug interno (simplificada)
      const getInternalSlug = (urlSlug: string): string | null => {
        const blogSlugMap: Record<string, string> = {
          'principios-ui-impacto-real': 'From-Theory-to-Real-Impact',
          'ui-principles-real-impact': 'From-Theory-to-Real-Impact',
          'sistemas-diseno-escala': 'Design-Systems-at-Scale',
          'design-systems-scale': 'Design-Systems-at-Scale',
          'psicologia-decisiones-usuario': 'Psychology-of-User-Decision-Making',
          'psychology-user-decisions': 'Psychology-of-User-Decision-Making',
        };
        const entry = Object.entries(blogSlugMap).find(([_, url]) => url === urlSlug);
        return entry ? entry[0] : null;
      };

      const internalSlug = getInternalSlug(decodedParam);
      if (internalSlug) {
        [rows] = await pool.query(
          'SELECT id, slug, share_count FROM blogs WHERE slug = ?',
          [internalSlug]
        ) as any[];
      }
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    const blog = rows[0];

    // Incrementar el contador
    await pool.query(
      'UPDATE blogs SET share_count = share_count + 1 WHERE id = ?',
      [blog.id]
    );

    // Obtener el nuevo valor
    const [updatedRows] = await pool.query(
      'SELECT share_count FROM blogs WHERE id = ?',
      [blog.id]
    ) as any[];

    return res.json({ 
      success: true, 
      share_count: updatedRows[0].share_count 
    });
  } catch (error: any) {
    console.error('[API] Error incrementando share count:', error);
    return res.status(500).json({ 
      error: 'Error incrementando contador',
      message: error.message || 'Error desconocido'
    });
  }
}
