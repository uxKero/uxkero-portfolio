# 🚀 Configuración para Railway (Producción)

## 📋 Paso 1: Conectar TablePlus a Railway

### Opción A: Usar la URL Pública

1. Abre TablePlus
2. Crea una nueva conexión MySQL
3. Usa estos datos:
   - **Host:** `yamanote.proxy.rlwy.net`
   - **Port:** `47650`
   - **User:** `root`
   - **Password:** `BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN`
   - **Database:** `railway`

### Opción B: Importar desde URL

1. Abre TablePlus
2. Click en "Import from URL"
3. Pega: `mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/railway`

## 📋 Paso 2: Crear las Tablas

1. Conéctate a Railway en TablePlus
2. Abre el archivo `TABLAS-SQL.sql`
3. Copia todo el contenido
4. En TablePlus, ve a la pestaña "SQL" o "Query"
5. Pega el SQL y ejecuta (Cmd/Ctrl + Enter)

O ejecuta directamente en TablePlus:

```sql
-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de blogs
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_es VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL,
  subtitle_es TEXT,
  subtitle_en TEXT,
  content_es LONGTEXT NOT NULL,
  content_en LONGTEXT NOT NULL,
  category_es VARCHAR(255),
  category_en VARCHAR(255),
  author VARCHAR(255) DEFAULT 'Alan Ponce',
  cover_image_url VARCHAR(500),
  published_at DATETIME,
  read_time_es VARCHAR(50),
  read_time_en VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📋 Paso 3: Crear Usuario Admin

Después de crear las tablas, crea el usuario admin ejecutando:

```bash
cd server
npm run create-admin admin tu_contraseña_segura
```

Esto creará el usuario en Railway automáticamente.

O manualmente en TablePlus:

```sql
-- Reemplaza 'tu_contraseña_hash' con el hash bcrypt de tu contraseña
-- Puedes generar el hash en: https://bcrypt-generator.com/
-- O usar el script: npm run create-admin admin tu_contraseña

INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$tu_hash_aqui');
```

## 📋 Paso 4: Configurar el Servidor

El archivo `server/.env` ya está configurado para Railway:

```env
MYSQL_PUBLIC_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/railway
MYSQLHOST=yamanote.proxy.rlwy.net
MYSQLPORT=47650
MYSQLUSER=root
MYSQLPASSWORD=BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN
MYSQLDATABASE=railway
JWT_SECRET=uxkero-admin-secret-key-2025
PORT=3001
```

## 📋 Paso 5: Iniciar el Servidor

```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Conectado a MySQL (Railway)
✅ Tablas encontradas en la base de datos
🚀 Servidor corriendo en http://localhost:3001
```

## 🎯 Para Producción

Cuando despliegues a producción:

1. **Backend:** Despliega el servidor en Railway o Vercel (con serverless functions)
2. **Frontend:** Despliega en Vercel/Netlify
3. **Base de Datos:** Ya está en Railway ✅

### Variables de Entorno en Producción

En tu plataforma de despliegue, configura:

- `MYSQL_PUBLIC_URL` → La URL pública de Railway
- `JWT_SECRET` → Un secreto seguro (diferente al de desarrollo)
- `PORT` → El puerto que use tu plataforma (o déjalo por defecto)

## ✅ Verificación

1. Conéctate a Railway con TablePlus ✅
2. Crea las tablas ejecutando el SQL ✅
3. Crea el usuario admin ✅
4. Inicia el servidor ✅
5. Prueba el login en `http://localhost:3000/admin/login` ✅

