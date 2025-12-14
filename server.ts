import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getPool } from './api/_lib/db';
import { generateToken, verifyToken, getAuthToken } from './api/_lib/auth';

// Cargar variables de entorno desde .env.local primero, luego .env
dotenv.config({ path: '.env.local' });
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
  } catch (error: any) {
    console.error('Error en login:', error);
    
    // Mensajes de error más específicos
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        error: 'No se puede conectar a la base de datos. Verifica que dbning esté corriendo en localhost:3308' 
      });
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).json({ 
        error: `La base de datos 'uxkeroblog' no existe. Ejecuta EJECUTAR-AHORA-DESARROLLO.sql en TablePlus/DBeaver` 
      });
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: `La tabla 'admin_users' no existe. Ejecuta EJECUTAR-AHORA-DESARROLLO.sql en TablePlus/DBeaver` 
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    console.log(`[API] Buscando blog con slug: ${slug}`);

    const pool = getPool();
    
    // Mapeo de slugs de URL a slugs internos
    const slugMap: Record<string, string> = {
      'ui-principles-real-impact': 'principios-ui-impacto-real',
      'From-Theory-to-Real-Impact': 'principios-ui-impacto-real',
      'design-systems-scale': 'sistemas-diseno-escala',
      'Design-Systems-at-Scale': 'sistemas-diseno-escala',
      'psychology-user-decisions': 'psicologia-decisiones-usuario',
      'Psychology-of-User-Decision-Making': 'psicologia-decisiones-usuario',
    };

    // Intentar primero con el slug tal cual viene
    let [rows] = await pool.query(
      'SELECT * FROM blogs WHERE slug = ?',
      [slug]
    ) as any[];

    // Si no se encuentra, intentar con el slug mapeado
    if (rows.length === 0 && slugMap[slug]) {
      console.log(`[API] Intentando con slug mapeado: ${slugMap[slug]}`);
      [rows] = await pool.query(
        'SELECT * FROM blogs WHERE slug = ?',
        [slugMap[slug]]
      ) as any[];
    }

    // Si aún no se encuentra, buscar por coincidencia parcial
    if (rows.length === 0) {
      const [altRows] = await pool.query(
        'SELECT * FROM blogs WHERE slug LIKE ? OR slug LIKE ?',
        [`%${slug}%`, `%${slug.replace(/-/g, '')}%`]
      ) as any[];
      
      if (altRows.length > 0) {
        console.log(`[API] Encontrado blog similar: ${altRows[0].slug}`);
        return res.json(altRows[0]);
      }
    }

    console.log(`[API] Encontrados ${rows.length} blogs con slug: ${slug}`);

    if (rows.length === 0) {
      // Listar todos los slugs disponibles para debugging
      const [allBlogs] = await pool.query('SELECT slug, title_es FROM blogs LIMIT 10') as any[];
      const availableSlugs = allBlogs.map((b: any) => b.slug).join(', ');
      return res.status(404).json({ 
        error: `Blog con slug "${slug}" no encontrado`,
        hint: availableSlugs ? `Slugs disponibles: ${availableSlugs}` : 'No hay blogs en la base de datos'
      });
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Error obteniendo blog:', error);
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'No se puede conectar a la base de datos. Verifica que dbning esté corriendo.' });
    }
    res.status(500).json({ error: 'Error obteniendo blog', details: error.message });
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
app.get('/api/health', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      message: 'API funcionando correctamente',
      database: 'conectada'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error conectando a la base de datos',
      error: error.message,
      hint: 'Verifica que dbning esté corriendo y que la base de datos uxkeroblog exista'
    });
  }
});

// Diagnóstico de conexión
app.get('/api/diagnose', async (req, res) => {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
  
  // Parsear URL si existe
  const parseDatabaseUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/mysql:\/\/([^:@]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2] ? '***' : '',
        database: match[5],
      };
    }
    return null;
  };
  
  const urlConfig = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;
  const dbConfig = urlConfig || {
    host: process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || '3308'),
    user: process.env.MYSQLUSER || 'root',
    database: process.env.MYSQLDATABASE || 'uxkeroblog',
  };
  
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin_users') as any[];
    res.json({
      config: dbConfig,
      databaseUrl: databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':***@') : null,
      database: 'conectada',
      adminUsers: rows[0]?.count || 0,
      message: 'Todo está bien configurado'
    });
  } catch (error: any) {
    res.status(500).json({
      config: dbConfig,
      databaseUrl: databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':***@') : null,
      database: 'error',
      error: error.message,
      code: error.code,
      hint: error.code === 'ECONNREFUSED' 
        ? 'Verifica que dbning esté corriendo en localhost:3308 y que la base de datos uxkeroblog exista. Crea .env.local con: DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog'
        : error.message
    });
  }
});

// Iniciar servidor con manejo de errores
const server = app.listen(PORT, () => {
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

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: El puerto ${PORT} ya está en uso.\n`);
    console.error(`💡 Solución:`);
    console.error(`   1. Detén el proceso que está usando el puerto ${PORT}`);
    console.error(`   2. O ejecuta: netstat -ano | findstr :${PORT}`);
    console.error(`   3. Luego: taskkill /PID <PID> /F`);
    console.error(`\n   O simplemente cierra la terminal anterior y vuelve a ejecutar: npm run dev\n`);
    process.exit(1);
  } else {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
});

