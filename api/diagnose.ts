import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Información de configuración
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
    const hasDatabaseUrl = !!databaseUrl;
    const hasMysqlPublicUrl = !!process.env.MYSQL_PUBLIC_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    // Parsear configuración
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
      password: process.env.MYSQLPASSWORD ? '***' : '',
      database: process.env.MYSQLDATABASE || 'uxkeroblog',
    };

    // Intentar conectar a la base de datos
    let dbStatus = 'unknown';
    let dbError = null;
    let tablesStatus = { admin_users: false, blogs: false };
    
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      dbStatus = 'connected';
      
      // Verificar tablas
      try {
        const [adminUsersTable] = await pool.query(`SHOW TABLES LIKE 'admin_users'`) as any[];
        const [blogsTable] = await pool.query(`SHOW TABLES LIKE 'blogs'`) as any[];
        tablesStatus.admin_users = adminUsersTable.length > 0;
        tablesStatus.blogs = blogsTable.length > 0;
        
        // Verificar usuario admin
        if (tablesStatus.admin_users === true) {
          try {
            const [users] = await pool.query('SELECT id, username, LENGTH(password_hash) as hash_length FROM admin_users WHERE username = ?', ['admin']) as any[];
            if (users.length > 0) {
              tablesStatus.admin_users = {
                exists: true,
                hasPassword: users[0].hash_length > 0,
                hashLength: users[0].hash_length
              };
            } else {
              tablesStatus.admin_users = { exists: false };
            }
          } catch (userError: any) {
            tablesStatus.admin_users = { error: userError.message };
          }
        }
      } catch (tableError: any) {
        dbError = `Error verificando tablas: ${tableError.message}`;
      }
    } catch (error: any) {
      dbStatus = 'error';
      dbError = {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
      };
    }

    res.json({
      status: dbStatus === 'connected' ? 'ok' : 'error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      database: {
        status: dbStatus,
        error: dbError,
        config: dbConfig,
        hasDatabaseUrl,
        hasMysqlPublicUrl,
        tables: tablesStatus,
      },
      auth: {
        hasJwtSecret,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      },
      recommendations: [
        !hasDatabaseUrl && !hasMysqlPublicUrl && !process.env.MYSQLHOST 
          ? '❌ Configura DATABASE_URL o MYSQL_PUBLIC_URL en Vercel'
          : null,
        !hasJwtSecret 
          ? '❌ Configura JWT_SECRET en Vercel'
          : null,
        dbStatus === 'error' 
          ? `❌ Error de conexión: ${dbError?.message || 'Desconocido'}`
          : null,
        tablesStatus.admin_users === false 
          ? '❌ La tabla admin_users no existe. Ejecuta el SQL de creación en Railway.'
          : null,
        tablesStatus.blogs === false 
          ? '❌ La tabla blogs no existe. Ejecuta el SQL de creación en Railway.'
          : null,
        typeof tablesStatus.admin_users === 'object' && !tablesStatus.admin_users.exists
          ? '❌ El usuario admin no existe. Crea el usuario admin en Railway.'
          : null,
        typeof tablesStatus.admin_users === 'object' && tablesStatus.admin_users.exists && !tablesStatus.admin_users.hasPassword
          ? '❌ El usuario admin no tiene password_hash. Ejecuta el SQL para crear/actualizar el usuario.'
          : null,
      ].filter(Boolean),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

