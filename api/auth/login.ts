import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getPool } from '../_lib/db';
import { generateToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Verificar variables de entorno
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
    if (!databaseUrl && !process.env.MYSQLHOST) {
      console.error('❌ Error: No hay configuración de base de datos');
      return res.status(500).json({ 
        error: 'Error de configuración: Variables de entorno de base de datos no encontradas',
        hint: 'Configura DATABASE_URL o MYSQL_PUBLIC_URL en Vercel'
      });
    }

    let pool;
    try {
      pool = getPool();
    } catch (dbError: any) {
      console.error('❌ Error conectando a la base de datos:', dbError);
      return res.status(500).json({ 
        error: 'Error conectando a la base de datos',
        details: dbError.message,
        code: dbError.code,
        hint: 'Verifica las variables de entorno DATABASE_URL o MYSQL_PUBLIC_URL en Vercel'
      });
    }

    let rows;
    try {
      [rows] = await pool.query(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      ) as any[];
    } catch (queryError: any) {
      console.error('❌ Error ejecutando query:', queryError);
      return res.status(500).json({ 
        error: 'Error consultando la base de datos',
        details: queryError.message,
        code: queryError.code,
        hint: queryError.code === 'ER_NO_SUCH_TABLE' 
          ? 'La tabla admin_users no existe. Ejecuta el SQL de creación de tablas en Railway.'
          : 'Verifica la conexión a la base de datos'
      });
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    
    // Verificar que el password_hash existe y es válido
    if (!user.password_hash) {
      console.error('❌ Error: Usuario sin password_hash');
      return res.status(500).json({ 
        error: 'Error: Usuario sin contraseña configurada',
        hint: 'El usuario existe pero no tiene password_hash. Ejecuta el SQL para crear/actualizar el usuario admin.'
      });
    }

    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptError: any) {
      console.error('❌ Error comparando contraseña:', bcryptError);
      return res.status(500).json({ 
        error: 'Error validando contraseña',
        details: bcryptError.message,
        hint: 'El password_hash puede estar corrupto. Regenera el usuario admin con un hash válido.'
      });
    }

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
    console.error('❌ Error inesperado en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      hint: 'Revisa los logs del servidor para más detalles'
    });
  }
}

