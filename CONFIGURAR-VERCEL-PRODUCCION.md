# 🔧 Configurar Variables de Entorno en Vercel (Producción)

## ⚠️ IMPORTANTE: El error 500 en login generalmente es por variables de entorno no configuradas

## 📋 Paso 1: Ir a la Configuración de Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `uxkero`
3. Ve a **Settings** → **Environment Variables**

## 📋 Paso 2: Agregar Variables de Entorno

Agrega estas variables para **Production** (y opcionalmente para Preview y Development):

### Variable 1: DATABASE_URL

```
Nombre: DATABASE_URL
Valor: mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog
Entornos: Production, Preview, Development
```

### Variable 2: JWT_SECRET

```
Nombre: JWT_SECRET
Valor: uxkero-admin-secret-key-production-2025
Entornos: Production, Preview, Development
```

**⚠️ IMPORTANTE:** Cambia el valor de `JWT_SECRET` por uno seguro y único para producción.

## 📋 Paso 3: Verificar que la Base de Datos Existe

1. Conéctate a Railway con TablePlus/DBeaver:
   - **Host:** `yamanote.proxy.rlwy.net`
   - **Port:** `47650`
   - **User:** `root`
   - **Password:** `BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN`
   - **Database:** `uxkeroblog`

2. Verifica que las tablas existan:
```sql
USE uxkeroblog;
SHOW TABLES;
```

Deberías ver:
- `admin_users`
- `blogs`

3. Verifica que el usuario admin existe:
```sql
SELECT * FROM admin_users WHERE username = 'admin';
```

Si no existe, créalo con este SQL (usa el hash correcto):
```sql
INSERT INTO admin_users (username, password_hash) 
VALUES (
  'admin',
  '$2b$10$LYoDm.8v8B1D5A3s0/1Hz.Lq1zdmutpgcMJFcCwnv3vFZC6ntdgLi'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);
```

**Credenciales:**
- Usuario: `admin`
- Contraseña: `Kero39591238Aap!`

## 📋 Paso 4: Redesplegar

Después de agregar las variables de entorno:

1. Ve a **Deployments** en Vercel
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**

O simplemente haz un nuevo commit y push a tu repositorio.

## 🔍 Verificar que Funciona

1. Ve a: `https://uxkero.vercel.app/api/health`
   - Debería responder con: `{"status":"ok","message":"API funcionando correctamente","database":"conectada"}`

2. Intenta iniciar sesión en: `https://uxkero.vercel.app/admin/login`
   - Usuario: `admin`
   - Contraseña: `Kero39591238Aap!`

## 🐛 Si Sigue Dando Error 500

### Opción 1: Ver los Logs en Vercel

1. Ve a **Deployments** → Selecciona el último deployment
2. Haz clic en **Functions** → `api/auth/login`
3. Revisa los logs para ver el error específico

### Opción 2: Probar el Endpoint Directamente

Abre la consola del navegador y ejecuta:

```javascript
fetch('https://uxkero.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Kero39591238Aap!'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Esto te mostrará el error específico.

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en Vercel
- [ ] `DATABASE_URL` apunta a Railway
- [ ] `JWT_SECRET` configurado
- [ ] Tablas creadas en Railway (`admin_users`, `blogs`)
- [ ] Usuario admin creado con hash bcrypt correcto
- [ ] Deployment redeseado después de agregar variables
- [ ] `/api/health` responde correctamente
- [ ] Login funciona en `/admin/login`

## 📝 Notas

- Las variables de entorno solo se aplican después de un nuevo deployment
- Si cambias variables, debes redeseployar
- El nombre de la base de datos debe ser `uxkeroblog` (no `railway`)
- El hash de la contraseña debe ser bcrypt, no texto plano

