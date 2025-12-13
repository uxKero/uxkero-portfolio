# 🚀 Configuración Serverless (Sin Carpeta /server)

## ✅ Sistema Actualizado

Ahora usamos **Vercel Serverless Functions** en lugar de un servidor separado. Todo está en la carpeta `api/`.

## 📋 Configuración

### Desarrollo Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos local (desarrollo)
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog

# JWT Secret
JWT_SECRET=uxkero-admin-secret-key-dev
```

3. **Iniciar desarrollo:**
```bash
npm run dev
```

Las funciones serverless estarán disponibles en `http://localhost:3000/api/*`

### Producción (Vercel + Railway)

1. **Configurar variables de entorno en Vercel:**

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```env
DATABASE_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog
# O usa:
MYSQL_PUBLIC_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog

JWT_SECRET=uxkero-admin-secret-key-production-CHANGE-THIS
```

2. **Desplegar:**
```bash
vercel --prod
```

O conecta tu repositorio a Vercel para despliegue automático.

## 🗄️ Crear Tablas

Usa **DBeaver/TablePlus** para crear las tablas:

1. Conéctate a tu base de datos (local o Railway)
2. Abre `TABLAS-SQL.sql`
3. Ejecuta el SQL para crear las tablas

## 👤 Crear Usuario Admin

### Opción 1: Desde el código (desarrollo)

Crea un archivo temporal `create-admin-request.json`:

```json
{
  "username": "admin",
  "password": "tu_contraseña_segura"
}
```

Luego ejecuta:
```bash
curl -X POST http://localhost:3000/api/create-admin \
  -H "Content-Type: application/json" \
  -d @create-admin-request.json
```

### Opción 2: Desde TablePlus/DBeaver

Ejecuta este SQL (reemplaza el hash con uno generado):

```sql
-- Genera el hash en: https://bcrypt-generator.com/
-- O usa: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu_contraseña', 10).then(console.log)"

INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$tu_hash_aqui')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
```

### Opción 3: Script Node.js rápido

Crea `create-admin-script.js`:

```javascript
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: '',
  database: 'uxkeroblog',
});

const username = 'admin';
const password = 'tu_contraseña';

const hash = await bcrypt.hash(password, 10);
await pool.query(
  'INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
  [username, hash, hash]
);

console.log('✅ Usuario creado:', username);
process.exit(0);
```

Ejecuta: `node create-admin-script.js`

## 📁 Estructura de API

```
api/
├── _lib/
│   ├── db.ts          # Conexión a MySQL
│   └── auth.ts        # Utilidades de autenticación
├── auth/
│   ├── login.ts       # POST /api/auth/login
│   └── verify.ts      # GET /api/auth/verify
├── blogs/
│   ├── index.ts       # GET/POST /api/blogs
│   ├── [slug].ts      # GET /api/blogs/:slug
│   └── [id].ts        # PUT/DELETE /api/blogs/:id
└── create-admin.ts    # POST /api/create-admin
```

## ✅ Ventajas

- ✅ No necesitas carpeta `/server`
- ✅ Funciona en desarrollo y producción
- ✅ Serverless = escalable automáticamente
- ✅ Sin servidor que mantener
- ✅ Despliegue simple en Vercel

## 🔧 Desarrollo Local con Vercel CLI

Para probar las funciones localmente:

```bash
npm install -g vercel
vercel dev
```

Esto iniciará un servidor que simula Vercel localmente.

## 📝 Notas

- Las funciones serverless se ejecutan solo cuando se llaman
- No hay servidor corriendo constantemente
- Perfecto para producción
- Usa DBeaver/TablePlus para gestionar la base de datos

