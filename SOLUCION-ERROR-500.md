# 🔧 Solución al Error 500

## ❌ Error que estás viendo:

```
POST http://localhost:3001/api/auth/login 500 (Internal Server Error)
```

## ✅ Pasos para solucionar:

### 1. Verificar que la base de datos esté corriendo

- Abre **dbning**
- Verifica que esté conectado a: `localhost:3308`
- Verifica que la base de datos `uxkeroblog` exista

### 2. Verificar que las tablas existan

En TablePlus/DBeaver, ejecuta:

```sql
USE uxkeroblog;
SHOW TABLES;
```

Deberías ver:
- `admin_users`
- `blogs`

Si no existen, ejecuta: `EJECUTAR-AHORA-DESARROLLO.sql`

### 3. Verificar que el usuario admin exista

```sql
SELECT * FROM admin_users WHERE username = 'admin';
```

Si no existe, ejecuta: `EJECUTAR-AHORA-DESARROLLO.sql`

### 4. Verificar variables de entorno

Crea `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

### 5. Diagnosticar el problema

Abre en el navegador: `http://localhost:3001/api/diagnose`

Esto te mostrará:
- Configuración de la base de datos
- Si la conexión funciona
- Cuántos usuarios admin hay
- Errores específicos

### 6. Ver logs del servidor

Mira la terminal donde está corriendo `npm run dev`. Deberías ver el error específico.

## 🔍 Errores comunes:

### "ECONNREFUSED"
**Causa:** dbning no está corriendo o no está en el puerto 3308
**Solución:** Abre dbning y verifica la conexión

### "ER_BAD_DB_ERROR"
**Causa:** La base de datos `uxkeroblog` no existe
**Solución:** Ejecuta `EJECUTAR-AHORA-DESARROLLO.sql` en TablePlus

### "ER_NO_SUCH_TABLE"
**Causa:** Las tablas no existen
**Solución:** Ejecuta `EJECUTAR-AHORA-DESARROLLO.sql` en TablePlus

## ✅ Verificar que todo funciona:

1. `http://localhost:3001/api/health` → Debería mostrar `{"status":"ok"}`
2. `http://localhost:3001/api/diagnose` → Debería mostrar la configuración y estado
3. `http://localhost:3000/admin/login` → Debería permitir login con `admin`/`admin123`

