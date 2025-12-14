import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db.js';
import { getAuthToken, verifyToken } from '../lib/auth.js';

// Función para obtener slug interno desde slug de URL (duplicada para evitar problemas de importación)
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

// GET - Obtener un blog por slug (público)
// PUT - Actualizar blog por ID (requiere autenticación)
// DELETE - Eliminar blog por ID (requiere autenticación)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Asegurar que siempre devolvemos JSON
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Verificar que tenemos el pool de base de datos
    let pool;
    try {
      pool = getPool();
    } catch (dbError: any) {
      console.error('[API] Error obteniendo pool de BD:', dbError);
      return res.status(500).json({ 
        error: 'Error de conexión a la base de datos',
        message: dbError.message || 'No se pudo conectar a la base de datos'
      });
    }

    const { param } = req.query;

    if (!param || typeof param !== 'string') {
      return res.status(400).json({ error: 'Parámetro requerido' });
    }

    // Decodificar el parámetro (por si viene codificado)
    // Intentar decodificar, si falla usar el original
    let decodedParam: string;
    try {
      decodedParam = decodeURIComponent(param);
    } catch (e) {
      // Si falla la decodificación, usar el original
      decodedParam = param;
    }
    console.log('[API] Blog request - param original:', param, 'decodificado:', decodedParam, 'method:', req.method);

    // Detectar si es un ID numérico o un slug
    const isNumericId = /^\d+$/.test(decodedParam);
    const blogId = isNumericId ? parseInt(decodedParam, 10) : null;
    const slug = isNumericId ? null : decodedParam;

  // GET - Obtener blog por slug (público)
  if (req.method === 'GET') {
    if (isNumericId) {
      // Si es un ID numérico, buscar por ID
      try {
        const [rows] = await pool.query(
          'SELECT * FROM blogs WHERE id = ?',
          [blogId]
        ) as any[];

        if (rows.length === 0) {
          return res.status(404).json({ error: 'Blog no encontrado' });
        }

        return res.json(rows[0]);
      } catch (error) {
        console.error('Error obteniendo blog:', error);
        return res.status(500).json({ error: 'Error obteniendo blog' });
      }
    } else {
      // Si es un slug, buscar por slug
      try {
        // Usar decodedParam como slug (no slug que puede ser null)
        const searchSlug = decodedParam;
        let [rows] = await pool.query(
          'SELECT * FROM blogs WHERE slug = ?',
          [searchSlug]
        ) as any[];

        // Si no se encuentra por el slug directo, intentar con el mapeo inverso
        if (rows.length === 0) {
          const internalSlug = getInternalSlug(searchSlug);
          if (internalSlug) {
            [rows] = await pool.query(
              'SELECT * FROM blogs WHERE slug = ?',
              [internalSlug]
            ) as any[];
          }
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: 'Blog no encontrado' });
        }

        return res.json(rows[0]);
      } catch (error: any) {
        console.error('Error obteniendo blog:', error);
        return res.status(500).json({ 
          error: 'Error obteniendo blog',
          message: error.message || 'Error desconocido'
        });
      }
    }
  }

    // PUT y DELETE solo funcionan con IDs numéricos y requieren autenticación
    if (isNumericId) {
    // Verificar autenticación
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    // PUT - Actualizar blog
    if (req.method === 'PUT') {
      try {
        const {
          slug: newSlug,
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
            newSlug,
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
            blogId,
          ]
        ) as any[];

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Blog no encontrado' });
        }

        const [updatedBlog] = await pool.query(
          'SELECT * FROM blogs WHERE id = ?',
          [blogId]
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

    // DELETE - Eliminar blog
    if (req.method === 'DELETE') {
      try {
        const [result] = await pool.query(
          'DELETE FROM blogs WHERE id = ?',
          [blogId]
        ) as any[];

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Blog no encontrado' });
        }

        return res.json({ message: 'Blog eliminado correctamente' });
      } catch (error) {
        console.error('Error eliminando blog:', error);
        return res.status(500).json({ error: 'Error eliminando blog' });
      }
    }
  } else {
    // Si es un slug y se intenta PUT o DELETE, devolver error
    return res.status(405).json({ 
      error: 'PUT y DELETE solo están disponibles para IDs numéricos. Use /api/blogs/:id para estas operaciones.' 
    });
  }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[API] Error inesperado en handler:', error);
    // Asegurar que siempre devolvemos JSON incluso en caso de error
    // Intentar devolver JSON, si falla, al menos intentar enviar un error básico
    try {
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error?.message || 'Error desconocido',
        type: error?.name || 'UnknownError'
      });
    } catch (jsonError) {
      // Si incluso esto falla, intentar enviar texto plano como último recurso
      console.error('[API] Error crítico enviando respuesta JSON:', jsonError);
      res.status(500);
      res.end(JSON.stringify({ 
        error: 'Error interno del servidor',
        message: 'Error crítico al procesar la respuesta'
      }));
    }
  }
}

