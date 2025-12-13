import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getPool } from './_lib/db';

// Endpoint para crear usuario admin
// Uso: POST /api/create-admin con { username, password }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pool = getPool();

    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
      [username, passwordHash, passwordHash]
    );

    return res.json({
      message: `Usuario admin creado/actualizado: ${username}`,
      username,
    });
  } catch (error) {
    console.error('Error creando admin:', error);
    return res.status(500).json({ error: 'Error creando admin' });
  }
}

