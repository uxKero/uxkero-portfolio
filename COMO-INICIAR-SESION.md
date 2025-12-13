# 🔐 Cómo Iniciar Sesión en el Panel Admin

## ✅ Checklist Antes de Iniciar Sesión

### 1. Verificar que las Tablas Existan

En TablePlus/DBeaver, verifica que tengas:
- ✅ Tabla `admin_users` creada
- ✅ Tabla `blogs` creada
- ✅ Usuario admin creado en `admin_users`

**Query para verificar:**
```sql
SELECT * FROM admin_users WHERE username = 'admin';
```

Si no existe, ejecuta `EJECUTAR-AHORA-DESARROLLO.sql` o `EJECUTAR-AHORA-PRODUCCION.sql`

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

### 3. Iniciar el Sistema

**Opción A: Con Vercel CLI (Recomendado para desarrollo)**

```bash
# Instalar Vercel CLI (solo una vez)
npm install -g vercel

# Iniciar con funciones serverless
vercel dev
```

Esto iniciará:
- Frontend en: `http://localhost:3000`
- API en: `http://localhost:3000/api/*`

**Opción B: Solo Frontend (las APIs no funcionarán localmente)**

```bash
npm run dev
```

⚠️ **Nota:** Con solo `npm run dev`, las funciones serverless no estarán disponibles. Necesitas `vercel dev` para que funcionen.

## 🔑 Credenciales de Acceso

Si ejecutaste `EJECUTAR-AHORA-DESARROLLO.sql` o `EJECUTAR-AHORA-PRODUCCION.sql`:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 📝 Pasos para Iniciar Sesión

1. **Abre tu navegador:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Ingresa las credenciales:**
   - Usuario: `admin`
   - Contraseña: `admin123`

3. **Haz clic en "Iniciar Sesión"**

4. **Si todo está bien, serás redirigido a:**
   ```
   http://localhost:3000/admin
   ```

## ❌ Solución de Problemas

### Error: "No se pudo conectar al servidor"

**Causa:** Las funciones serverless no están corriendo.

**Solución:**
```bash
# Instala Vercel CLI
npm install -g vercel

# Inicia con vercel dev
vercel dev
```

### Error: "Credenciales inválidas"

**Causa:** El usuario admin no existe o la contraseña es incorrecta.

**Solución:**
1. Verifica en TablePlus que el usuario existe:
   ```sql
   SELECT * FROM admin_users WHERE username = 'admin';
   ```

2. Si no existe, ejecuta:
   ```sql
   INSERT INTO admin_users (username, password_hash) 
   VALUES (
     'admin',
     '$2b$10$zZoXUACpSQA91lm4wDNg3u8TjGFhDJk0keflojN.ZxnNxZ5197iie'
   );
   ```

3. Usa las credenciales: `admin` / `admin123`

### Error: "Error interno del servidor"

**Causa:** Problema de conexión a la base de datos.

**Solución:**
1. Verifica que `.env.local` tenga la URL correcta:
   ```env
   DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
   ```

2. Verifica que la base de datos esté corriendo
3. Verifica que las tablas existan

### Las funciones API no responden

**Causa:** Vite no ejecuta funciones serverless automáticamente.

**Solución:**
Usa `vercel dev` en lugar de `npm run dev`:
```bash
vercel dev
```

## ✅ Verificación Rápida

Ejecuta estos comandos para verificar:

```bash
# 1. Verificar que las dependencias estén instaladas
npm list mysql2 bcryptjs jsonwebtoken

# 2. Verificar que existe .env.local
cat .env.local

# 3. Iniciar con vercel dev
vercel dev
```

Luego prueba en el navegador:
```
http://localhost:3000/api/health
```

Deberías ver un error 404 (normal, no hay endpoint /health), pero confirma que las rutas API están activas.

## 🎯 Resumen

1. ✅ Tablas creadas en `uxkeroblog`
2. ✅ Usuario admin creado (admin/admin123)
3. ✅ `.env.local` configurado
4. ✅ Iniciar con `vercel dev`
5. ✅ Ir a `http://localhost:3000/admin/login`
6. ✅ Login con `admin` / `admin123`

