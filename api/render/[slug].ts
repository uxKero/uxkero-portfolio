import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db.js';

// GET - Renderizar HTML con meta tags Open Graph para bots/crawlers
// Este endpoint se llama cuando un bot accede a una URL de blog
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { slug } = req.query;
    const userAgent = req.headers['user-agent'] || '';

    // Detectar si es un bot/crawler (WhatsApp, Facebook, Twitter, LinkedIn, etc.)
    const isBot = /bot|crawler|spider|crawling|facebookexternalhit|facebook|twitterbot|whatsapp|linkedinbot|slackbot|telegrambot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);

    // Si no es un bot, redirigir al frontend normal
    if (!isBot) {
      return res.redirect(302, `/${slug}`);
    }

    if (!slug || typeof slug !== 'string') {
      return res.status(400).send('Slug requerido');
    }

    const pool = getPool();
    
    // Buscar el blog por slug
    let [rows] = await pool.query(
      'SELECT * FROM blogs WHERE slug = ?',
      [slug]
    ) as any[];

    // Si no se encuentra, intentar con mapeo
    if (rows.length === 0) {
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

      const internalSlug = getInternalSlug(slug);
      if (internalSlug) {
        [rows] = await pool.query(
          'SELECT * FROM blogs WHERE slug = ?',
          [internalSlug]
        ) as any[];
      }
    }

    if (rows.length === 0) {
      // Si no se encuentra el blog, servir el HTML base
      return res.redirect(302, `/${slug}`);
    }

    const blog = rows[0];
    
    // Obtener la URL base correctamente
    let baseUrl = 'https://uxkero.vercel.app';
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (req.headers.host) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      baseUrl = `${protocol}://${req.headers.host}`;
    }

    // Determinar idioma (por defecto español)
    const title = blog.title_es || blog.title_en;
    const description = blog.subtitle_es || blog.subtitle_en || '';
    const image = blog.cover_image_url 
      ? (blog.cover_image_url.startsWith('http') 
          ? blog.cover_image_url 
          : `${baseUrl}${blog.cover_image_url.startsWith('/') ? blog.cover_image_url : '/' + blog.cover_image_url}`)
      : `${baseUrl}/favicon.svg`;
    const url = `${baseUrl}/${slug}`;

    // Escapar caracteres especiales para HTML
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Generar HTML completo con meta tags Open Graph
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | UXKERO Blog</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="UXKERO" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:locale:alternate" content="en_US" />
  
  <!-- Article tags -->
  <meta property="article:author" content="${escapeHtml(blog.author || 'Alan Ponce')}" />
  ${blog.published_at ? `<meta property="article:published_time" content="${new Date(blog.published_at).toISOString()}" />` : ''}
  ${blog.updated_at ? `<meta property="article:modified_time" content="${new Date(blog.updated_at).toISOString()}" />` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
  <meta name="twitter:site" content="@uxkero" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}" />
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/index.css">
  
  <!-- Redirect to actual SPA page -->
  <script>
    if (typeof window !== 'undefined' && !/bot|crawler|spider/i.test(navigator.userAgent)) {
      window.location.href = "${url}";
    }
  </script>
</head>
<body>
  <div id="root">
    <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #fff; margin-bottom: 1rem;">${escapeHtml(title)}</h1>
      ${description ? `<p style="color: #a1a1aa; font-size: 1.125rem; line-height: 1.75rem;">${escapeHtml(description)}</p>` : ''}
      ${image ? `<img src="${image}" alt="${escapeHtml(title)}" style="width: 100%; max-width: 800px; height: auto; margin-top: 2rem; border-radius: 0.5rem;" />` : ''}
      <p style="margin-top: 2rem;"><a href="${url}" style="color: #10b981;">Leer artículo completo →</a></p>
    </div>
  </div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.send(html);
  } catch (error: any) {
    console.error('[API] Error generando HTML para bot:', error);
    // En caso de error, redirigir al frontend normal
    return res.redirect(302, `/${req.query.slug}`);
  }
}
