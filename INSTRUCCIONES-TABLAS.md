# 📋 Instrucciones para Crear Tablas y Usuario Admin

## Paso 1: Abrir TablePlus o DBeaver

1. Abre TablePlus o DBeaver
2. Conéctate a tu base de datos:
   - **Desarrollo:** `localhost:3308` → base de datos `uxkeroblog`
   - **Producción:** `yamanote.proxy.rlwy.net:47650` → base de datos `uxkeroblog` (mismo nombre)
3. **IMPORTANTE:** Selecciona la base de datos `uxkeroblog` en TablePlus/DBeaver antes de ejecutar el SQL

## Paso 2: Crear las Tablas

### Opción A: Desarrollo Local

1. Abre el archivo `EJECUTAR-AHORA-DESARROLLO.sql`
2. Copia **TODO** el contenido
3. En TablePlus/DBeaver, ve a la pestaña "SQL" o "Query"
4. Pega el SQL completo
5. Ejecuta (Cmd/Ctrl + Enter o botón "Run")

### Opción B: Producción (Railway)

1. Abre el archivo `EJECUTAR-AHORA-PRODUCCION.sql`
2. Copia **TODO** el contenido
3. En TablePlus/DBeaver, ve a la pestaña "SQL" o "Query"
4. Pega el SQL completo
5. Ejecuta (Cmd/Ctrl + Enter o botón "Run")

### Opción C: Manual (cambiar base de datos)

1. Abre el archivo `EJECUTAR-AHORA.sql`
2. **Edita la línea `USE uxkeroblog;`** y cambia por tu base de datos:
   - Desarrollo: `USE uxkeroblog;`
   - Producción: `USE railway;`
3. Copia TODO el contenido
4. Pega y ejecuta en TablePlus/DBeaver

**O ejecuta solo las tablas:**

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

## Paso 3: Crear Usuario Admin

### Opción A: Usar el hash pre-generado (Más fácil)

El archivo `CREAR-USUARIO-ADMIN.sql` tiene un hash para la contraseña **"admin123"**.

1. Abre `CREAR-USUARIO-ADMIN.sql`
2. Copia y ejecuta el INSERT
3. **Usuario:** `admin`
4. **Contraseña:** `admin123`

### Opción B: Generar tu propio hash

1. Ve a: https://bcrypt-generator.com/
2. Ingresa tu contraseña (ej: "MiPasswordSegura123")
3. Rounds: **10**
4. Copia el hash generado
5. Ejecuta este SQL (reemplaza el hash):

```sql
INSERT INTO admin_users (username, password_hash) 
VALUES (
  'admin',
  'TU_HASH_AQUI'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);
```

### Opción C: Script Node.js

Crea un archivo `generar-hash.js`:

```javascript
import bcrypt from 'bcryptjs';

const password = 'tu_contraseña_aqui';
const hash = await bcrypt.hash(password, 10);

console.log('Hash generado:', hash);
console.log('\nSQL para ejecutar:');
console.log(`INSERT INTO admin_users (username, password_hash) VALUES ('admin', '${hash}');`);
```

Ejecuta:
```bash
node generar-hash.js
```

Luego copia el SQL generado y ejecútalo en TablePlus.

## Paso 4: Verificar

Ejecuta estos queries para verificar:

```sql
-- Ver tablas creadas
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('admin_users', 'blogs');

-- Ver usuario admin
SELECT id, username, created_at 
FROM admin_users 
WHERE username = 'admin';
```

## Paso 5: Probar el Login

1. Inicia el frontend: `npm run dev`
2. Ve a: `http://localhost:3000/admin/login`
3. Usa las credenciales que creaste:
   - Si usaste el hash pre-generado: `admin` / `admin123`
   - Si generaste tu propio hash: `admin` / `tu_contraseña`

## ✅ Listo!

Ahora puedes:
- ✅ Iniciar sesión en `/admin/login`
- ✅ Crear, editar y eliminar blogs
- ✅ Gestionar todo desde el panel de admin

## 🔒 Seguridad

**IMPORTANTE:** Después de crear el usuario, cambia la contraseña por defecto:

1. Genera un nuevo hash con tu contraseña segura
2. Ejecuta el UPDATE:

```sql
UPDATE admin_users 
SET password_hash = 'TU_NUEVO_HASH_AQUI'
WHERE username = 'admin';
```

