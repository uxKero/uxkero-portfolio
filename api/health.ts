import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Intentar conectar a la base de datos
    const pool = getPool();
    await pool.query('SELECT 1');
    
    res.json({ 
      status: 'ok', 
      message: 'API funcionando correctamente',
      database: 'conectada',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Error conectando a la base de datos',
      error: error.message,
      code: error.code,
      hint: error.code === 'ECONNREFUSED'
        ? 'Verifica que las variables de entorno DATABASE_URL o MYSQL_PUBLIC_URL estén configuradas en Vercel'
        : error.message
    });
  }
}

