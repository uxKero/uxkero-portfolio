import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getPool } from './api/_lib/db';
import { generateToken, verifyToken, getAuthToken } from './api/_lib/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper para verificar autenticación
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

  (req as any).user = decoded;
  next();
};

// ===== AUTH =====

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    ) as any[];

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id, user.username);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/verify
app.get('/api/auth/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: (req as any).user });
});

// ===== BLOGS =====

// GET /api/blogs - Obtener todos los blogs (público)
app.get('/api/blogs', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blogs ORDER BY published_at DESC, created_at DESC'
    ) as any[];

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo blogs:', error);
    res.status(500).json({ error: 'Error obteniendo blogs' });
  }
});

// GET /api/blogs/:slug - Obtener un blog por slug (público)
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
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

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo blog:', error);
    res.status(500).json({ error: 'Error obteniendo blog' });
  }
});

// POST /api/blogs - Crear blog (requiere autenticación)
app.post('/api/blogs', requireAuth, async (req, res) => {
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

    if (!slug || !title_es || !title_en || !content_es || !content_en) {
      return res.status(400).json({
        error: 'Slug, título (ES/EN) y contenido (ES/EN) son requeridos',
      });
    }

    const pool = getPool();
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

    res.status(201).json(newBlog[0]);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El slug ya existe' });
    }
    console.error('Error creando blog:', error);
    res.status(500).json({ error: 'Error creando blog' });
  }
});

// PUT /api/blogs/:id - Actualizar blog (requiere autenticación)
app.put('/api/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
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

    const pool = getPool();
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

    res.json(updatedBlog[0]);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El slug ya existe' });
    }
    console.error('Error actualizando blog:', error);
    res.status(500).json({ error: 'Error actualizando blog' });
  }
});

// DELETE /api/blogs/:id - Eliminar blog (requiere autenticación)
app.delete('/api/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]) as any[];

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    res.json({ message: 'Blog eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando blog:', error);
    res.status(500).json({ error: 'Error eliminando blog' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/verify`);
  console.log(`   GET    /api/blogs`);
  console.log(`   GET    /api/blogs/:slug`);
  console.log(`   POST   /api/blogs`);
  console.log(`   PUT    /api/blogs/:id`);
  console.log(`   DELETE /api/blogs/:id`);
});

