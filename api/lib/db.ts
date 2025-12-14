import mysql from 'mysql2/promise';

// Función para parsear URL de conexión MySQL
const parseDatabaseUrl = (url: string) => {
  if (!url) return null;
  
  // Formato: mysql://user:password@host:port/database
  // O: mysql://user@host:port/database (sin password)
  const match = url.match(/mysql:\/\/([^:@]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/);
  if (match) {
    return {
      host: match[3],
      port: parseInt(match[4]),
      user: match[1],
      password: match[2] || '',
      database: match[5],
    };
  }
  return null;
};

// Prioridad de configuración:
// 1. DATABASE_URL (desarrollo local o producción)
// 2. MYSQL_PUBLIC_URL (Railway público)
// 3. Variables individuales
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
const urlConfig = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

const dbConfig = urlConfig || {
  host: process.env.MYSQLHOST || 'localhost',
  port: parseInt(process.env.MYSQLPORT || '3308'), // Puerto por defecto 3308 para dbning
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'uxkeroblog', // Mismo nombre en local y Railway
};

// Determinar si es una conexión remota (Railway) que requiere SSL
const isRemoteConnection = dbConfig.host !== 'localhost' && 
                           dbConfig.host !== '127.0.0.1' &&
                           !dbConfig.host.includes('localhost');

let pool: mysql.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // SSL requerido solo para conexiones remotas (Railway)
      ssl: isRemoteConnection ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
};

