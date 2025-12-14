# ⚙️ Configurar .env.local

## ❌ Problema: Error ECONNREFUSED

Si ves `ECONNREFUSED` en `/api/diagnose`, significa que la conexión a la base de datos está fallando.

## ✅ Solución: Crear `.env.local`

Crea un archivo `.env.local` en la **raíz del proyecto** (mismo nivel que `package.json`):

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

## 📝 Importante:

- **Puerto:** `3308` (no 3306)
- **Host:** `localhost`
- **Usuario:** `root`
- **Contraseña:** (vacía, deja después de los dos puntos)
- **Base de datos:** `uxkeroblog`

## ✅ Verificar:

1. Reinicia el servidor: `npm run dev`
2. Ve a: `http://localhost:3001/api/diagnose`
3. Deberías ver: `"database": "conectada"`

## 🔍 Si sigue fallando:

1. **Verifica que dbning esté corriendo:**
   - Abre dbning
   - Conéctate a: `localhost:3308`
   - Verifica que la base de datos `uxkeroblog` exista

2. **Verifica el formato de DATABASE_URL:**
   ```
   mysql://usuario:contraseña@host:puerto/base_de_datos
   ```
   
   Ejemplo correcto:
   ```
   mysql://root:@localhost:3308/uxkeroblog
   ```

3. **Si no tienes contraseña:**
   - Deja vacío después de los dos puntos: `root:@`
   - O simplemente: `root@localhost:3308/uxkeroblog`

