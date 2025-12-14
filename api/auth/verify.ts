import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthToken, verifyToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = getAuthToken(req);

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
}

