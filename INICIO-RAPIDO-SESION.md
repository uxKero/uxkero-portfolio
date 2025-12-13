# 🚀 Inicio Rápido - Cómo Iniciar Sesión

## ✅ Pasos Rápidos

### 1. Crear Tablas y Usuario (Si aún no lo hiciste)

En TablePlus/DBeaver, ejecuta `EJECUTAR-AHORA-DESARROLLO.sql`

Esto creará:
- ✅ Tabla `admin_users`
- ✅ Tabla `blogs`  
- ✅ Usuario admin (admin/admin123)

### 2. Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

### 3. Iniciar el Sistema

**IMPORTANTE:** Para que las APIs funcionen en desarrollo, usa `vercel dev`:

```bash
# Instalar Vercel CLI (solo una vez)
npm install -g vercel

# Iniciar con funciones serverless
vercel dev
```

Esto iniciará:
- Frontend: `http://localhost:3000`
- APIs: `http://localhost:3000/api/*`

### 4. Iniciar Sesión

1. Abre: `http://localhost:3000/admin/login`
2. Usuario: `admin`
3. Contraseña: `admin123`
4. Click en "Iniciar Sesión"

## 🔑 Credenciales

- **Usuario:** `admin`
- **Contraseña:** `admin123`

(Si ejecutaste el SQL con el hash pre-generado)

## ⚠️ Problemas Comunes

### "No se pudo conectar al servidor"

**Solución:** Usa `vercel dev` en lugar de `npm run dev`

```bash
vercel dev
```

### "Credenciales inválidas"

**Solución:** Verifica que el usuario existe:

```sql
SELECT * FROM admin_users WHERE username = 'admin';
```

Si no existe, ejecuta el INSERT del SQL.

### Las APIs no responden

**Solución:** Asegúrate de usar `vercel dev`, no `npm run dev`

## ✅ Verificación

Prueba que las APIs funcionen:

```
http://localhost:3000/api/health
```

Deberías ver: `{"status":"ok","message":"API funcionando correctamente"}`

